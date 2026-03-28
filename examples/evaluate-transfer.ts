/**
 * Example: Evaluating travel rule requirements for cross-border transfers.
 *
 * Run:
 *   npx ts-node examples/evaluate-transfer.ts
 */
import { TravelRuleEngine } from '../src/engine';

const engine = new TravelRuleEngine();

// ── 1. Cross-border transfer: US → Australia, $1,000 ────────────────
console.log('=== US → AU transfer ($1,000) on 2026-08-01 ===\n');

const usToAu = engine.evaluate(
  { from: 'US', to: 'AU', fiatEquivalent: 1000 },
  '2026-08-01',
);

console.log('Triggered:', usToAu.triggered);
console.log('Verification required:', usToAu.verificationRequired);
console.log('  US transmission:', usToAu.from.transmissionRequired, '(threshold: USD 3,000)');
console.log('  AU transmission:', usToAu.to.transmissionRequired, '(threshold: AUD 1,000)');
console.log('Transmission fields:', usToAu.requiredFields.transmission);
console.log('Verification fields:', usToAu.requiredFields.verification);

// ── 2. Same transfer but $5,000 — now both sides trigger ───────────
console.log('\n=== US → AU transfer ($5,000) on 2026-08-01 ===\n');

const usToAuLarge = engine.evaluate(
  { from: 'US', to: 'AU', fiatEquivalent: 5000 },
  '2026-08-01',
);

console.log('Triggered:', usToAuLarge.triggered);
console.log('Verification required:', usToAuLarge.verificationRequired);
console.log('  US transmission:', usToAuLarge.from.transmissionRequired);
console.log('  AU transmission:', usToAuLarge.to.transmissionRequired);

// ── 3. Transfer within the EU — zero threshold after July 2026 ─────
console.log('\n=== DE → FR transfer (€50) on 2026-08-01 ===\n');

const deToFr = engine.evaluate(
  { from: 'DE', to: 'FR', fiatEquivalent: 50 },
  '2026-08-01',
);

console.log('Triggered:', deToFr.triggered, '(zero threshold — all CASP-to-CASP transfers)');
console.log('Verification required:', deToFr.verificationRequired);
console.log('Transmission fields:', deToFr.requiredFields.transmission);

// ── 4. Same EU transfer but before the zero-threshold date ──────────
console.log('\n=== DE → FR transfer (€50) on 2025-06-01 ===\n');

const deToFrEarly = engine.evaluate(
  { from: 'DE', to: 'FR', fiatEquivalent: 50 },
  '2025-06-01',
);

console.log('Triggered:', deToFrEarly.triggered, '(€50 is below the EUR 1,000 threshold)');

// ── 5. Transfer to Singapore — always triggered ─────────────────────
console.log('\n=== GB → SG transfer (£100) ===\n');

const gbToSg = engine.evaluate(
  { from: 'GB', to: 'SG', fiatEquivalent: 100 },
);

console.log('Triggered:', gbToSg.triggered, '(SG has zero threshold)');
console.log('  GB transmission:', gbToSg.from.transmissionRequired, '(£100 < GBP 1,000)');
console.log('  SG transmission:', gbToSg.to.transmissionRequired, '(zero threshold)');
console.log('Transmission fields:', gbToSg.requiredFields.transmission);

// ── 6. Split-tier jurisdiction: South Africa ─────────────────────────
console.log('\n=== US → ZA transfer (ZAR 3,000) ===\n');

const usToZa = engine.evaluate(
  { from: 'US', to: 'ZA', fiatEquivalent: 3000 },
  '2025-06-01',
);

console.log('Triggered:', usToZa.triggered);
console.log('Verification required:', usToZa.verificationRequired);
console.log('  ZA transmission:', usToZa.to.transmissionRequired, '(ZAR 0 — all transfers)');
console.log('  ZA verification:', usToZa.to.verificationRequired, '(ZAR 5,000 — not triggered)');
console.log('Transmission fields (reduced set):', usToZa.requiredFields.transmission);
console.log('Verification fields (empty — not triggered):', usToZa.requiredFields.verification);

// ── 7. Unhosted wallet verification ─────────────────────────────────
console.log('\n=== Unhosted wallet verification ===\n');

const deWallet = engine.walletVerification('DE', '2026-08-01');
console.log('DE:', deWallet);

const usWallet = engine.walletVerification('US');
console.log('US:', usWallet);

const sgWallet = engine.walletVerification('SG');
console.log('SG:', sgWallet);

// ── 8. Direct trigger check ──────────────────────────────────────────
console.log('\n=== isRuleTriggered examples ===\n');

const usTrigger = engine.isRuleTriggered('US', 3000);
console.log('US $3,000:', usTrigger);

const zaTriggerLow = engine.isRuleTriggered('ZA', 3000, '2025-06-01');
console.log('ZA ZAR 3,000:', zaTriggerLow, '(transmission yes, verification no)');

const zaTriggerHigh = engine.isRuleTriggered('ZA', 6000, '2025-06-01');
console.log('ZA ZAR 6,000:', zaTriggerHigh, '(both yes)');
