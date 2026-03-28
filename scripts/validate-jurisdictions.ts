import * as fs from 'fs';
import * as path from 'path';
import type { JurisdictionData, PiiField, ThresholdTier } from '../src/types';

const DATA_DIR = path.join(__dirname, '..', 'data', 'jurisdictions');
const VALID_PII_FIELDS: PiiField[] = [
  'fullName', 'dateOfBirth', 'placeOfBirth', 'idDocumentNumber',
  'address', 'accountNumber', 'townAndCountry',
];

// EU/EEA member states that should have consistent TFR rules
const EU_EEA = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR',
  'GR', 'HR', 'HU', 'IE', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV', 'MT',
  'NL', 'NO', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
];

// WAEMU/BCEAO countries — should share consistent thresholds
const WAEMU = ['BF', 'BJ', 'CI', 'GW', 'ML', 'NE', 'SN', 'TG'];

// CEMAC/BEAC countries — should share consistent thresholds
const CEMAC = ['CF', 'CG', 'CM', 'GA', 'GQ', 'TD'];

// Approximate USD exchange rates for threshold sanity checks
const USD_RATES: Record<string, number> = {
  USD: 1, EUR: 1.08, GBP: 1.27, JPY: 0.0067, AUD: 0.65,
  CAD: 0.74, SGD: 0.75, HKD: 0.13, CHF: 1.13, KRW: 0.00074,
  BRL: 0.18, MXN: 0.057, INR: 0.012, ZAR: 0.055, AED: 0.27,
  THB: 0.029, MYR: 0.22, PHP: 0.018, IDR: 0.000063, NZD: 0.60,
  SEK: 0.096, NOK: 0.094, DKK: 0.145, PLN: 0.25, CZK: 0.043,
  HUF: 0.0027, RON: 0.22, BGN: 0.55, HRK: 0.14, ISK: 0.0073,
  TRY: 0.029, NGN: 0.00063, KES: 0.0077, GHS: 0.065, XOF: 0.0016,
  XAF: 0.0016, BWP: 0.074, MUR: 0.022, TZS: 0.00038, UGX: 0.00027,
  RWF: 0.00074, ETB: 0.008, MAD: 0.10, TND: 0.32, EGP: 0.020,
  BHD: 2.65, QAR: 0.27, OMR: 2.60, KWD: 3.25, SAR: 0.27,
  JOD: 1.41, ILS: 0.28, LBP: 0.000011, PKR: 0.0036, BDT: 0.0083,
  LKR: 0.0033, MMK: 0.00048, KHR: 0.00024, LAK: 0.000046, VND: 0.000040,
  TWD: 0.031, CNY: 0.14, MNT: 0.00029, KZT: 0.0020, UZS: 0.000078,
  GEL: 0.37, AMD: 0.0026, AZN: 0.59, FJD: 0.44, PGK: 0.25,
  WST: 0.36, TOP: 0.42, VUV: 0.0084, SBD: 0.12,
  TTD: 0.15, JMD: 0.0063, BBD: 0.50, BSD: 1.0, BZD: 0.50,
  GYD: 0.0048, SRD: 0.028, ARS: 0.00094, CLP: 0.0010, COP: 0.00024,
  PEN: 0.27, UYU: 0.024, PYG: 0.00013, BOB: 0.14, VES: 0.027,
  CRC: 0.0019, HNL: 0.040, NIO: 0.027, GTQ: 0.13, DOP: 0.017,
  PAB: 1.0, CUP: 0.042, HTG: 0.0076, SVC: 0.11, BMD: 1.0,
  KYD: 1.22, AWG: 0.56, ANG: 0.56, XCD: 0.37, CDF: 0.00035,
  MZN: 0.016, AOA: 0.0011, ZMW: 0.037, MWK: 0.00058, BIF: 0.00034,
  DJF: 0.0056, ERN: 0.067, GMD: 0.014, GNF: 0.00012, LRD: 0.0052,
  LSL: 0.055, MGA: 0.00022, NAD: 0.055, SCR: 0.072, SLL: 0.000045,
  SOS: 0.0018, STN: 0.043, SZL: 0.055, CVE: 0.0098, KMF: 0.0022,
  MVR: 0.065, AFN: 0.014, NPR: 0.0075, BTN: 0.012, BND: 0.75,
};

interface Issue {
  jurisdiction: string;
  severity: 'error' | 'warning';
  message: string;
}

const issues: Issue[] = [];

function addIssue(jurisdiction: string, severity: 'error' | 'warning', message: string) {
  issues.push({ jurisdiction, severity, message });
}

function thresholdToUsd(amount: number, currency: string): number | null {
  const rate = USD_RATES[currency];
  if (!rate) return null;
  return amount * rate;
}

function validateTier(
  code: string,
  versionId: string,
  tierName: 'transmission' | 'verification',
  tier: ThresholdTier,
): void {
  // isZeroThreshold consistency
  if (tier.isZeroThreshold && tier.amount !== 0) {
    addIssue(code, 'error', `${tierName}: isZeroThreshold is true but amount is ${tier.amount} in ${versionId}`);
  }
  if (!tier.isZeroThreshold && tier.amount === 0) {
    addIssue(code, 'warning', `${tierName}: amount is 0 but isZeroThreshold is false in ${versionId}`);
  }

  // PII fields are valid
  for (const field of tier.requiredFields.originator) {
    if (!VALID_PII_FIELDS.includes(field)) {
      addIssue(code, 'error', `${tierName}: Invalid originator PII field "${field}" in ${versionId}`);
    }
  }
  for (const field of tier.requiredFields.beneficiary) {
    if (!VALID_PII_FIELDS.includes(field)) {
      addIssue(code, 'error', `${tierName}: Invalid beneficiary PII field "${field}" in ${versionId}`);
    }
  }

  // Must have fullName and accountNumber at minimum
  if (!tier.requiredFields.originator.includes('fullName')) {
    addIssue(code, 'warning', `${tierName}: Originator missing fullName in ${versionId}`);
  }
  if (!tier.requiredFields.originator.includes('accountNumber')) {
    addIssue(code, 'warning', `${tierName}: Originator missing accountNumber in ${versionId}`);
  }

  // USD threshold sanity check (non-zero thresholds)
  if (!tier.isZeroThreshold && tier.amount > 0) {
    const usdEquiv = thresholdToUsd(tier.amount, tier.currency);
    if (usdEquiv !== null) {
      if (usdEquiv > 3000) {
        addIssue(code, 'warning', `${tierName}: Threshold ~$${usdEquiv.toFixed(0)} USD seems high (>3x FATF $1,000) in ${versionId}`);
      }
      if (usdEquiv < 300) {
        addIssue(code, 'warning', `${tierName}: Threshold ~$${usdEquiv.toFixed(0)} USD seems low (<0.3x FATF $1,000) in ${versionId}`);
      }
    } else {
      addIssue(code, 'warning', `${tierName}: Unknown currency "${tier.currency}" — cannot validate threshold in ${versionId}`);
    }
  }
}

// Load all jurisdictions
const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
const jurisdictions = new Map<string, JurisdictionData>();

for (const file of files) {
  const code = file.replace('.json', '');
  const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
  let data: JurisdictionData;
  try {
    data = JSON.parse(raw);
  } catch {
    addIssue(code, 'error', `Invalid JSON in ${file}`);
    continue;
  }
  jurisdictions.set(code, data);

  // 1. Filename matches countryCode
  if (data.countryCode !== code) {
    addIssue(code, 'error', `Filename ${file} does not match countryCode "${data.countryCode}"`);
  }

  // 2. Must have at least one rule
  if (!data.rules || data.rules.length === 0) {
    addIssue(code, 'error', 'No rules defined');
    continue;
  }

  // 3. Check each rule
  for (const rule of data.rules) {
    // Version ID pattern
    if (!/^[A-Z]{2}-\d{4}-\d{3}$/.test(rule.versionId)) {
      addIssue(code, 'warning', `Version ID "${rule.versionId}" does not match pattern {CC}-{YYYY}-{NNN}`);
    }

    // Version ID starts with country code
    if (!rule.versionId.startsWith(code)) {
      addIssue(code, 'error', `Version ID "${rule.versionId}" does not start with country code ${code}`);
    }

    // Status is valid
    if (!['active', 'pending', 'deprecated'].includes(rule.status)) {
      addIssue(code, 'error', `Invalid status "${rule.status}" in ${rule.versionId}`);
    }

    // Dates are valid ISO
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rule.effectiveFrom)) {
      addIssue(code, 'error', `Invalid effectiveFrom date "${rule.effectiveFrom}" in ${rule.versionId}`);
    }
    if (rule.effectiveTo !== null && !/^\d{4}-\d{2}-\d{2}$/.test(rule.effectiveTo)) {
      addIssue(code, 'error', `Invalid effectiveTo date "${rule.effectiveTo}" in ${rule.versionId}`);
    }

    // Validate each tier independently
    validateTier(code, rule.versionId, 'transmission', rule.threshold.transmission);
    validateTier(code, rule.versionId, 'verification', rule.threshold.verification);

    // Cross-tier checks (only meaningful when both tiers are non-zero)
    const tx = rule.threshold.transmission;
    const vx = rule.threshold.verification;

    // Currencies must match between tiers
    if (!tx.isZeroThreshold && !vx.isZeroThreshold && tx.currency !== vx.currency) {
      addIssue(code, 'error', `Threshold currency mismatch: transmission is ${tx.currency} but verification is ${vx.currency} in ${rule.versionId}`);
    }

    // Transmission amount must be <= verification amount (unless verification is zero-threshold)
    if (!tx.isZeroThreshold && !vx.isZeroThreshold && tx.currency === vx.currency) {
      if (tx.amount > vx.amount) {
        addIssue(code, 'error', `Transmission threshold (${tx.amount}) must be <= verification threshold (${vx.amount}) in ${rule.versionId}`);
      }
    }

    // authorityUrl present and looks like a URL
    if (!rule.authorityUrl || !rule.authorityUrl.startsWith('http')) {
      addIssue(code, 'error', `Missing or invalid authorityUrl in ${rule.versionId}`);
    }
  }
}

// 4. Regional consistency: EU/EEA should all have a pending zero-threshold rule for 2026
console.log('\n=== EU/EEA Zero-Threshold Consistency Check ===');
const euMissing: string[] = [];
for (const cc of EU_EEA) {
  const jur = jurisdictions.get(cc);
  if (!jur) {
    addIssue(cc, 'warning', 'EU/EEA member state file missing');
    euMissing.push(cc);
    continue;
  }
  const hasZeroThreshold = jur.rules.some(
    r => r.threshold.transmission.isZeroThreshold && (r.status === 'pending' || r.status === 'active')
  );
  if (!hasZeroThreshold) {
    addIssue(cc, 'warning', 'EU/EEA member state missing pending/active zero-threshold rule (EU TFR Jul 2026)');
    euMissing.push(cc);
  }
}
if (euMissing.length === 0) {
  console.log('All EU/EEA states have a zero-threshold rule ✓');
} else {
  console.log(`Missing zero-threshold rule: ${euMissing.join(', ')}`);
}

// 5. Regional consistency: WAEMU
console.log('\n=== WAEMU Consistency Check ===');
const waemuThresholds = WAEMU.map(cc => {
  const jur = jurisdictions.get(cc);
  if (!jur) return { cc, threshold: 'MISSING' };
  const active = jur.rules.find(r => r.status === 'active');
  return {
    cc,
    threshold: active
      ? `${active.threshold.transmission.amount} ${active.threshold.transmission.currency}`
      : 'NO_ACTIVE',
  };
});
const waemuUnique = new Set(waemuThresholds.map(t => t.threshold));
if (waemuUnique.size === 1) {
  console.log(`All WAEMU states consistent: ${[...waemuUnique][0]} ✓`);
} else {
  console.log('WAEMU states have inconsistent thresholds:');
  for (const t of waemuThresholds) console.log(`  ${t.cc}: ${t.threshold}`);
}

// 6. Regional consistency: CEMAC
console.log('\n=== CEMAC Consistency Check ===');
const cemacThresholds = CEMAC.map(cc => {
  const jur = jurisdictions.get(cc);
  if (!jur) return { cc, threshold: 'MISSING' };
  const active = jur.rules.find(r => r.status === 'active');
  return {
    cc,
    threshold: active
      ? `${active.threshold.transmission.amount} ${active.threshold.transmission.currency}`
      : 'NO_ACTIVE',
  };
});
const cemacUnique = new Set(cemacThresholds.map(t => t.threshold));
if (cemacUnique.size === 1) {
  console.log(`All CEMAC states consistent: ${[...cemacUnique][0]} ✓`);
} else {
  console.log('CEMAC states have inconsistent thresholds:');
  for (const t of cemacThresholds) console.log(`  ${t.cc}: ${t.threshold}`);
}

// Print summary
console.log('\n=== Validation Summary ===');
const errors = issues.filter(i => i.severity === 'error');
const warnings = issues.filter(i => i.severity === 'warning');
console.log(`Total jurisdictions: ${jurisdictions.size}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length > 0) {
  console.log('\n--- ERRORS ---');
  for (const e of errors) console.log(`  [${e.jurisdiction}] ${e.message}`);
}

if (warnings.length > 0) {
  console.log('\n--- WARNINGS ---');
  for (const w of warnings) console.log(`  [${w.jurisdiction}] ${w.message}`);
}

process.exit(errors.length > 0 ? 1 : 0);
