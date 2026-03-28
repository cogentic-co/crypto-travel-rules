import { describe, it, expect, beforeAll } from 'vitest';
import { TravelRuleEngine } from '../src/engine';

let engine: TravelRuleEngine;

beforeAll(() => {
  engine = new TravelRuleEngine();
});

describe('TravelRuleEngine', () => {
  describe('listJurisdictions', () => {
    it('loads all jurisdiction files', () => {
      const list = engine.listJurisdictions();
      expect(list.length).toBeGreaterThanOrEqual(200);
      expect(list).toContain('US');
      expect(list).toContain('GB');
      expect(list).toContain('SG');
    });

    it('does not contain non-ISO codes', () => {
      const list = engine.listJurisdictions();
      expect(list).not.toContain('UK');
      expect(list).not.toContain('EU');
    });
  });

  describe('getJurisdiction', () => {
    it('returns jurisdiction data by code', () => {
      const us = engine.getJurisdiction('US');
      expect(us).toBeDefined();
      expect(us!.countryCode).toBe('US');
      expect(us!.name).toBe('United States');
    });

    it('is case-insensitive', () => {
      expect(engine.getJurisdiction('us')).toEqual(engine.getJurisdiction('US'));
    });

    it('returns undefined for unknown codes', () => {
      expect(engine.getJurisdiction('ZZ')).toBeUndefined();
    });
  });

  describe('getApplicableRule', () => {
    it('returns the active rule for a single-rule jurisdiction', () => {
      const rule = engine.getApplicableRule('US', '2025-06-01');
      expect(rule).not.toBeNull();
      expect(rule!.threshold.amount).toBe(3000);
      expect(rule!.threshold.currency).toBe('USD');
    });

    it('returns the correct rule based on date for multi-rule jurisdictions', () => {
      const before = engine.getApplicableRule('AU', '2026-06-15');
      expect(before!.threshold.amount).toBe(10000);

      const after = engine.getApplicableRule('AU', '2026-07-15');
      expect(after!.threshold.amount).toBe(1000);
    });

    it('returns the pending EU zero-threshold rule after July 2026', () => {
      const rule = engine.getApplicableRule('DE', '2026-08-01');
      expect(rule).not.toBeNull();
      expect(rule!.threshold.isZeroThreshold).toBe(true);
      expect(rule!.threshold.amount).toBe(0);
    });

    it('returns the EUR 1,000 rule before July 2026 for EU states', () => {
      const rule = engine.getApplicableRule('DE', '2025-06-01');
      expect(rule).not.toBeNull();
      expect(rule!.threshold.amount).toBe(1000);
      expect(rule!.threshold.isZeroThreshold).toBe(false);
    });

    it('returns null for unknown country codes', () => {
      expect(engine.getApplicableRule('ZZ')).toBeNull();
    });

    it('returns null for dates before any rule is effective', () => {
      expect(engine.getApplicableRule('US', '1990-01-01')).toBeNull();
    });

    it('accepts Date objects', () => {
      const rule = engine.getApplicableRule('US', new Date('2025-06-01'));
      expect(rule).not.toBeNull();
    });
  });

  describe('isRuleTriggered', () => {
    it('returns true when amount meets the threshold', () => {
      const result = engine.isRuleTriggered('US', 3000);
      expect(result).toBe(true);
    });

    it('returns false when amount is below the threshold', () => {
      const result = engine.isRuleTriggered('US', 2999);
      expect(result).toBe(false);
    });

    it('always triggers for zero-threshold jurisdictions', () => {
      const result = engine.isRuleTriggered('SG', 1);
      expect(result).toBe(true);
    });

    it('returns false for unknown jurisdictions', () => {
      const result = engine.isRuleTriggered('ZZ', 99999);
      expect(result).toBe(false);
    });
  });

  describe('evaluate', () => {
    it('triggers when either jurisdiction triggers', () => {
      // AU threshold is AUD 10,000 until 2026-06-30; after 2026-07-01 it becomes AUD 1,000
      // US threshold is USD 3,000 — 1,000 fiat equivalent is below US threshold
      // but AU pending rule (AUD 1,000) is in effect from 2026-07-01, so to-side triggers
      const result = engine.evaluate(
        { from: 'US', to: 'AU', fiatEquivalent: 1000 },
        '2026-08-01',
      );
      expect(result.triggered).toBe(true);
      expect(result.from.triggered).toBe(false);
      expect(result.to.triggered).toBe(true);
    });

    it('triggers both sides when amount exceeds both thresholds', () => {
      const result = engine.evaluate(
        { from: 'US', to: 'AU', fiatEquivalent: 5000 },
        '2026-08-01',
      );
      expect(result.triggered).toBe(true);
      expect(result.from.triggered).toBe(true);
      expect(result.to.triggered).toBe(true);
    });

    it('does not trigger when below both thresholds', () => {
      const result = engine.evaluate(
        { from: 'US', to: 'AU', fiatEquivalent: 500 },
        '2025-06-01',
      );
      expect(result.triggered).toBe(false);
      expect(result.requiredFields.originator).toEqual([]);
      expect(result.requiredFields.beneficiary).toEqual([]);
    });

    it('merges required fields from both jurisdictions', () => {
      const result = engine.evaluate(
        { from: 'US', to: 'AU', fiatEquivalent: 5000 },
        '2026-08-01',
      );
      expect(result.requiredFields.beneficiary).toContain('accountNumber');
      expect(result.requiredFields.beneficiary).toContain('fullName');
      expect(result.requiredFields.originator.length).toBeGreaterThan(0);
    });

    it('handles zero-threshold jurisdictions correctly', () => {
      const result = engine.evaluate(
        { from: 'GB', to: 'SG', fiatEquivalent: 1 },
      );
      expect(result.triggered).toBe(true);
      expect(result.from.triggered).toBe(false);
      expect(result.to.triggered).toBe(true);
    });

    it('includes correct country codes in result', () => {
      const result = engine.evaluate(
        { from: 'us', to: 'sg', fiatEquivalent: 100 },
      );
      expect(result.from.countryCode).toBe('US');
      expect(result.to.countryCode).toBe('SG');
    });

    it('demonstrates the Sunrise Issue — same transfer, different dates', () => {
      const before = engine.evaluate(
        { from: 'DE', to: 'FR', fiatEquivalent: 50 },
        '2025-06-01',
      );
      const after = engine.evaluate(
        { from: 'DE', to: 'FR', fiatEquivalent: 50 },
        '2026-08-01',
      );
      expect(before.triggered).toBe(false);
      expect(after.triggered).toBe(true);
    });
  });

  describe('walletVerification', () => {
    it('returns verification requirements for a jurisdiction with a threshold', () => {
      const result = engine.walletVerification('DE', '2025-06-01');
      expect(result.required).toBe(true);
      expect(result.threshold).toBe(1000);
      expect(result.currency).toBe('EUR');
      expect(result.notes).toBeDefined();
    });

    it('returns required=false when not required', () => {
      const result = engine.walletVerification('NG');
      expect(result.required).toBe(false);
    });

    it('returns nulls for unknown jurisdictions', () => {
      const result = engine.walletVerification('ZZ');
      expect(result.required).toBe(false);
      expect(result.threshold).toBeNull();
      expect(result.currency).toBeNull();
      expect(result.notes).toBeNull();
    });

    it('returns null threshold when verification applies at all amounts', () => {
      const result = engine.walletVerification('SG');
      expect(result.required).toBe(true);
      expect(result.threshold).toBeNull();
    });
  });

  describe('getBeneficiaryObligations', () => {
    it('returns obligations for a known jurisdiction', () => {
      const result = engine.getBeneficiaryObligations('DE');
      expect(result).not.toBeNull();
      expect(result!.countryCode).toBe('DE');
      expect(result!.mustVerifyOriginatorData).toBe(true);
      expect(result!.rejectIncompleteTransfers).toBe(true);
      expect(result!.recordKeepingYears).toBe(5);
    });

    it('returns null for jurisdictions without data', () => {
      expect(engine.getBeneficiaryObligations('ZZ')).toBeNull();
    });

    it('reflects US outlier — no beneficiary verification required', () => {
      const result = engine.getBeneficiaryObligations('US');
      expect(result).not.toBeNull();
      expect(result!.mustVerifyOriginatorData).toBe(false);
      expect(result!.rejectIncompleteTransfers).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(engine.getBeneficiaryObligations('de')).toEqual(engine.getBeneficiaryObligations('DE'));
    });
  });

  describe('getReporting', () => {
    it('returns reporting data for a known jurisdiction', () => {
      const result = engine.getReporting('US');
      expect(result).not.toBeNull();
      expect(result!.countryCode).toBe('US');
      expect(result!.str.required).toBe(true);
      expect(result!.str.threshold).toBe(2000);
      expect(result!.ctr).not.toBeNull();
      expect(result!.ctr!.threshold).toBe(10000);
    });

    it('returns null CTR for jurisdictions without automatic reporting', () => {
      const result = engine.getReporting('DE');
      expect(result).not.toBeNull();
      expect(result!.str.required).toBe(true);
      expect(result!.ctr).toBeNull();
    });

    it('returns null for jurisdictions without data', () => {
      expect(engine.getReporting('ZZ')).toBeNull();
    });

    it('is case-insensitive', () => {
      expect(engine.getReporting('us')).toEqual(engine.getReporting('US'));
    });
  });
});
