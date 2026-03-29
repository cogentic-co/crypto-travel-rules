import * as fs from 'fs';
import * as path from 'path';
import type { BeneficiaryObligations, JurisdictionData, PiiField, ReportingData } from '../src/types';

const DATA_DIR = path.join(__dirname, '..', 'data', 'jurisdictions');
const REPORTING_DIR = path.join(__dirname, '..', 'data', 'reporting');
const OBLIGATIONS_DIR = path.join(__dirname, '..', 'data', 'beneficiary-obligations');
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

    // isZeroThreshold consistency
    if (rule.threshold.isZeroThreshold && rule.threshold.amount !== 0) {
      addIssue(code, 'error', `isZeroThreshold is true but amount is ${rule.threshold.amount} in ${rule.versionId}`);
    }
    if (!rule.threshold.isZeroThreshold && rule.threshold.amount === 0) {
      addIssue(code, 'warning', `amount is 0 but isZeroThreshold is false in ${rule.versionId}`);
    }

    // PII fields are valid
    for (const field of rule.requiredFields.originator) {
      if (!VALID_PII_FIELDS.includes(field)) {
        addIssue(code, 'error', `Invalid originator PII field "${field}" in ${rule.versionId}`);
      }
    }
    for (const field of rule.requiredFields.beneficiary) {
      if (!VALID_PII_FIELDS.includes(field)) {
        addIssue(code, 'error', `Invalid beneficiary PII field "${field}" in ${rule.versionId}`);
      }
    }

    // Must have fullName and accountNumber at minimum
    if (!rule.requiredFields.originator.includes('fullName')) {
      addIssue(code, 'warning', `Originator missing fullName in ${rule.versionId}`);
    }
    if (!rule.requiredFields.originator.includes('accountNumber')) {
      addIssue(code, 'warning', `Originator missing accountNumber in ${rule.versionId}`);
    }

    // USD threshold sanity check (non-zero thresholds)
    if (!rule.threshold.isZeroThreshold && rule.threshold.amount > 0) {
      const usdEquiv = thresholdToUsd(rule.threshold.amount, rule.threshold.currency);
      if (usdEquiv !== null) {
        if (usdEquiv > 3000) {
          addIssue(code, 'warning', `Threshold ~$${usdEquiv.toFixed(0)} USD seems high (>3x FATF $1,000) in ${rule.versionId}`);
        }
        if (usdEquiv < 300) {
          addIssue(code, 'warning', `Threshold ~$${usdEquiv.toFixed(0)} USD seems low (<0.3x FATF $1,000) in ${rule.versionId}`);
        }
      } else {
        addIssue(code, 'warning', `Unknown currency "${rule.threshold.currency}" — cannot validate threshold in ${rule.versionId}`);
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
    r => r.threshold.isZeroThreshold && (r.status === 'pending' || r.status === 'active')
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
      ? `${active.threshold.amount} ${active.threshold.currency}`
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
      ? `${active.threshold.amount} ${active.threshold.currency}`
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

// 7. Cross-directory coverage: reporting & beneficiary obligations
const PRIORITY_JURISDICTIONS = new Set([
  // G20
  'AR', 'AU', 'BR', 'CA', 'CN', 'DE', 'FR', 'GB', 'ID', 'IN', 'IT', 'JP',
  'KR', 'MX', 'RU', 'SA', 'TR', 'US', 'ZA',
  // Major crypto markets
  'AE', 'CH', 'HK', 'SG', 'NL', 'SE', 'NO', 'DK', 'AT', 'BE', 'IE', 'PT',
  'PL', 'CZ', 'FI', 'NZ', 'IL', 'TH', 'MY', 'PH', 'NG', 'KE', 'TW', 'ES',
]);

function loadAndValidateDir<T extends { countryCode: string }>(
  dir: string,
  label: string,
  validateFn: (code: string, data: T) => void,
): Set<string> {
  const loaded = new Set<string>();
  if (!fs.existsSync(dir)) return loaded;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const code = file.replace('.json', '');
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    let data: T;
    try {
      data = JSON.parse(raw);
    } catch {
      addIssue(code, 'error', `Invalid JSON in ${label}/${file}`);
      continue;
    }
    loaded.add(code);

    // Filename matches countryCode
    if (data.countryCode !== code) {
      addIssue(code, 'error', `${label} filename ${file} does not match countryCode "${data.countryCode}"`);
    }

    // Must have a matching jurisdiction
    if (!jurisdictions.has(code)) {
      addIssue(code, 'error', `${label}/${file} has no matching jurisdiction file`);
    }

    validateFn(code, data);
  }
  return loaded;
}

// Validate reporting files
const reportingCodes = loadAndValidateDir<ReportingData>(REPORTING_DIR, 'reporting', (code, data) => {
  // STR must exist and be required
  if (!data.str) {
    addIssue(code, 'error', 'Reporting data missing STR section');
    return;
  }
  if (!data.str.required) {
    addIssue(code, 'warning', 'STR marked as not required — unusual');
  }
  if (data.str.timeframeDays < 0) {
    addIssue(code, 'error', `STR timeframeDays is negative: ${data.str.timeframeDays}`);
  }
  if (!data.str.authority) {
    addIssue(code, 'error', 'STR missing authority name');
  }

  // CTR validation (if present)
  if (data.ctr) {
    if (data.ctr.threshold <= 0) {
      addIssue(code, 'warning', `CTR threshold is ${data.ctr.threshold} — expected a positive amount`);
    }
    if (!data.ctr.authority) {
      addIssue(code, 'error', 'CTR missing authority name');
    }
  }

  // authorityUrl
  if (!data.authorityUrl || !data.authorityUrl.startsWith('http')) {
    addIssue(code, 'error', 'Reporting data missing or invalid authorityUrl');
  }
});

// Validate beneficiary obligations files
const obligationsCodes = loadAndValidateDir<BeneficiaryObligations>(OBLIGATIONS_DIR, 'beneficiary-obligations', (code, data) => {
  if (typeof data.mustVerifyOriginatorData !== 'boolean') {
    addIssue(code, 'error', 'mustVerifyOriginatorData must be a boolean');
  }
  if (typeof data.rejectIncompleteTransfers !== 'boolean') {
    addIssue(code, 'error', 'rejectIncompleteTransfers must be a boolean');
  }
  if (data.recordKeepingYears <= 0) {
    addIssue(code, 'error', `recordKeepingYears is ${data.recordKeepingYears} — expected positive`);
  }
  if (!data.authorityUrl || !data.authorityUrl.startsWith('http')) {
    addIssue(code, 'error', 'Beneficiary obligations missing or invalid authorityUrl');
  }
  if (!data.notes || data.notes.trim().length === 0) {
    addIssue(code, 'warning', 'Beneficiary obligations missing notes');
  }
});

// Coverage report
const allCodes = Array.from(jurisdictions.keys()).sort();
const missingReporting = allCodes.filter(c => !reportingCodes.has(c));
const missingObligations = allCodes.filter(c => !obligationsCodes.has(c));
const priorityMissingReporting = missingReporting.filter(c => PRIORITY_JURISDICTIONS.has(c));
const priorityMissingObligations = missingObligations.filter(c => PRIORITY_JURISDICTIONS.has(c));

console.log('\n=== Data Coverage Report ===');
console.log(`Jurisdictions:              ${jurisdictions.size}`);
console.log(`Reporting data:             ${reportingCodes.size}/${jurisdictions.size} (${(reportingCodes.size / jurisdictions.size * 100).toFixed(1)}%)`);
console.log(`Beneficiary obligations:    ${obligationsCodes.size}/${jurisdictions.size} (${(obligationsCodes.size / jurisdictions.size * 100).toFixed(1)}%)`);

if (priorityMissingReporting.length > 0) {
  console.log(`\nPriority jurisdictions missing reporting data: ${priorityMissingReporting.join(', ')}`);
}
if (priorityMissingObligations.length > 0) {
  console.log(`Priority jurisdictions missing beneficiary obligations: ${priorityMissingObligations.join(', ')}`);
}
if (missingReporting.length > 0) {
  console.log(`\nAll jurisdictions missing reporting data (${missingReporting.length}): ${missingReporting.join(', ')}`);
}
if (missingObligations.length > 0) {
  console.log(`All jurisdictions missing beneficiary obligations (${missingObligations.length}): ${missingObligations.join(', ')}`);
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
