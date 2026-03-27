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
      // AU has two rules: AUD 10,000 until 2026-06-30, then AUD 1,000
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
    it('triggers when amount meets threshold', () => {
      expect(engine.isRuleTriggered('US', 3000)).toBe(true);
      expect(engine.isRuleTriggered('US', 5000)).toBe(true);
    });

    it('does not trigger below threshold', () => {
      expect(engine.isRuleTriggered('US', 2999)).toBe(false);
      expect(engine.isRuleTriggered('US', 100)).toBe(false);
    });

    it('always triggers for zero-threshold jurisdictions', () => {
      expect(engine.isRuleTriggered('SG', 1)).toBe(true);
      expect(engine.isRuleTriggered('SG', 0)).toBe(true);
      expect(engine.isRuleTriggered('JP', 50)).toBe(true);
    });

    it('returns false for unknown jurisdictions', () => {
      expect(engine.isRuleTriggered('ZZ', 99999)).toBe(false);
    });
  });

  describe('evaluate', () => {
    it('triggers when either jurisdiction triggers', () => {
      // $1,000: below US threshold ($3k) but meets AU threshold (AUD 1k post-reform)
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
      // $500: below US ($3k) and below AU pre-reform ($10k)
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
      // US requires address on beneficiary, AU requires townAndCountry
      expect(result.requiredFields.beneficiary).toContain('accountNumber');
      expect(result.requiredFields.beneficiary).toContain('fullName');
      // Should have union of both sets
      expect(result.requiredFields.originator.length).toBeGreaterThan(0);
    });

    it('handles zero-threshold jurisdictions correctly', () => {
      // Even €1 to Singapore triggers
      const result = engine.evaluate(
        { from: 'GB', to: 'SG', fiatEquivalent: 1 },
      );
      expect(result.triggered).toBe(true);
      expect(result.from.triggered).toBe(false); // below GBP 1,000
      expect(result.to.triggered).toBe(true);     // SG zero threshold
    });

    it('includes correct country codes in result', () => {
      const result = engine.evaluate(
        { from: 'us', to: 'sg', fiatEquivalent: 100 },
      );
      expect(result.from.countryCode).toBe('US');
      expect(result.to.countryCode).toBe('SG');
    });

    it('demonstrates the Sunrise Issue — same transfer, different dates', () => {
      // DE→FR €50: not triggered before July 2026, triggered after
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
    it('returns verification requirements for a jurisdiction', () => {
      const result = engine.walletVerification('DE', '2026-08-01');
      expect(result.required).toBe(true);
      expect(result.threshold).toBe(1000);
      expect(result.currency).toBe('EUR');
      expect(result.notes).toBeDefined();
    });

    it('returns required=false when not required', () => {
      // Find a jurisdiction where verification is not required
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
      expect(result.threshold).toBeNull(); // no specific threshold — applies to all
    });
  });
});
