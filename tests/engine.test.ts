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
      expect(rule!.threshold.transmission.amount).toBe(3000);
      expect(rule!.threshold.transmission.currency).toBe('USD');
    });

    it('returns the correct rule based on date for multi-rule jurisdictions', () => {
      const before = engine.getApplicableRule('AU', '2026-06-15');
      expect(before!.threshold.transmission.amount).toBe(10000);

      const after = engine.getApplicableRule('AU', '2026-07-15');
      expect(after!.threshold.transmission.amount).toBe(1000);
    });

    it('returns the pending EU zero-threshold rule after July 2026', () => {
      const rule = engine.getApplicableRule('DE', '2026-08-01');
      expect(rule).not.toBeNull();
      expect(rule!.threshold.transmission.isZeroThreshold).toBe(true);
      expect(rule!.threshold.transmission.amount).toBe(0);
    });

    it('returns the EUR 1,000 rule before July 2026 for EU states', () => {
      const rule = engine.getApplicableRule('DE', '2025-06-01');
      expect(rule).not.toBeNull();
      expect(rule!.threshold.transmission.amount).toBe(1000);
      expect(rule!.threshold.transmission.isZeroThreshold).toBe(false);
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

    it('exposes both transmission and verification tiers', () => {
      const rule = engine.getApplicableRule('ZA', '2025-06-01');
      expect(rule).not.toBeNull();
      expect(rule!.threshold.transmission.amount).toBe(0);
      expect(rule!.threshold.transmission.isZeroThreshold).toBe(true);
      expect(rule!.threshold.verification.amount).toBe(5000);
      expect(rule!.threshold.verification.isZeroThreshold).toBe(false);
    });

    it('has requiredFields inside each tier', () => {
      const rule = engine.getApplicableRule('US', '2025-06-01');
      expect(rule).not.toBeNull();
      expect(rule!.threshold.transmission.requiredFields.originator).toContain('fullName');
      expect(rule!.threshold.verification.requiredFields.originator).toContain('fullName');
    });
  });

  describe('isRuleTriggered', () => {
    it('returns TriggerResult with both fields', () => {
      const result = engine.isRuleTriggered('US', 3000);
      expect(result).toHaveProperty('transmissionRequired');
      expect(result).toHaveProperty('verificationRequired');
    });

    it('triggers both when amount meets threshold (same tiers)', () => {
      const result = engine.isRuleTriggered('US', 3000);
      expect(result.transmissionRequired).toBe(true);
      expect(result.verificationRequired).toBe(true);
    });

    it('triggers neither below threshold', () => {
      const result = engine.isRuleTriggered('US', 2999);
      expect(result.transmissionRequired).toBe(false);
      expect(result.verificationRequired).toBe(false);
    });

    it('always triggers both for zero-threshold jurisdictions', () => {
      const result = engine.isRuleTriggered('SG', 1);
      expect(result.transmissionRequired).toBe(true);
      expect(result.verificationRequired).toBe(true);
    });

    it('returns both false for unknown jurisdictions', () => {
      const result = engine.isRuleTriggered('ZZ', 99999);
      expect(result.transmissionRequired).toBe(false);
      expect(result.verificationRequired).toBe(false);
    });

    it('triggers transmission but not verification for split-tier jurisdictions', () => {
      const result = engine.isRuleTriggered('ZA', 3000, '2025-06-01');
      expect(result.transmissionRequired).toBe(true);
      expect(result.verificationRequired).toBe(false);
    });

    it('triggers both tiers when amount exceeds verification threshold', () => {
      const result = engine.isRuleTriggered('ZA', 6000, '2025-06-01');
      expect(result.transmissionRequired).toBe(true);
      expect(result.verificationRequired).toBe(true);
    });
  });

  describe('evaluate', () => {
    it('triggers when either jurisdiction triggers transmission', () => {
      const result = engine.evaluate(
        { from: 'US', to: 'AU', fiatEquivalent: 1000 },
        '2026-08-01',
      );
      expect(result.triggered).toBe(true);
      expect(result.from.transmissionRequired).toBe(false);
      expect(result.to.transmissionRequired).toBe(true);
    });

    it('triggers both sides when amount exceeds both thresholds', () => {
      const result = engine.evaluate(
        { from: 'US', to: 'AU', fiatEquivalent: 5000 },
        '2026-08-01',
      );
      expect(result.triggered).toBe(true);
      expect(result.from.transmissionRequired).toBe(true);
      expect(result.to.transmissionRequired).toBe(true);
    });

    it('does not trigger when below both thresholds', () => {
      const result = engine.evaluate(
        { from: 'US', to: 'AU', fiatEquivalent: 500 },
        '2025-06-01',
      );
      expect(result.triggered).toBe(false);
      expect(result.requiredFields.transmission.originator).toEqual([]);
      expect(result.requiredFields.transmission.beneficiary).toEqual([]);
    });

    it('merges transmission fields from both jurisdictions', () => {
      const result = engine.evaluate(
        { from: 'US', to: 'AU', fiatEquivalent: 5000 },
        '2026-08-01',
      );
      expect(result.requiredFields.transmission.beneficiary).toContain('accountNumber');
      expect(result.requiredFields.transmission.beneficiary).toContain('fullName');
      expect(result.requiredFields.transmission.originator.length).toBeGreaterThan(0);
    });

    it('handles zero-threshold jurisdictions correctly', () => {
      const result = engine.evaluate(
        { from: 'GB', to: 'SG', fiatEquivalent: 1 },
      );
      expect(result.triggered).toBe(true);
      expect(result.from.transmissionRequired).toBe(false);
      expect(result.to.transmissionRequired).toBe(true);
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

    it('exposes verificationRequired at top level', () => {
      const result = engine.evaluate(
        { from: 'US', to: 'AU', fiatEquivalent: 5000 },
        '2026-08-01',
      );
      expect(result.verificationRequired).toBe(true);
    });

    it('splits requiredFields into transmission and verification', () => {
      const result = engine.evaluate(
        { from: 'US', to: 'AU', fiatEquivalent: 5000 },
        '2026-08-01',
      );
      expect(result.requiredFields).toHaveProperty('transmission');
      expect(result.requiredFields).toHaveProperty('verification');
      expect(result.requiredFields.transmission).toHaveProperty('originator');
      expect(result.requiredFields.verification).toHaveProperty('originator');
    });

    it('handles split-tier jurisdictions in cross-border evaluation', () => {
      const result = engine.evaluate(
        { from: 'US', to: 'ZA', fiatEquivalent: 3000 },
        '2025-06-01',
      );
      expect(result.triggered).toBe(true);
      expect(result.to.transmissionRequired).toBe(true);
      expect(result.to.verificationRequired).toBe(false);
      expect(result.requiredFields.transmission.originator.length).toBeGreaterThan(0);
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
});
