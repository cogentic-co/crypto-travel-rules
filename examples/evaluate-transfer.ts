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
console.log('  US triggered:', usToAu.from.triggered, '(threshold: USD 3,000)');
console.log('  AU triggered:', usToAu.to.triggered, '(threshold: AUD 1,000)');
console.log('Required fields:', usToAu.requiredFields);

// ── 2. Same transfer but $5,000 — now both sides trigger ───────────
console.log('\n=== US → AU transfer ($5,000) on 2026-08-01 ===\n');

const usToAuLarge = engine.evaluate(
  { from: 'US', to: 'AU', fiatEquivalent: 5000 },
  '2026-08-01',
);

console.log('Triggered:', usToAuLarge.triggered);
console.log('  US triggered:', usToAuLarge.from.triggered);
console.log('  AU triggered:', usToAuLarge.to.triggered);
console.log('Required fields:', usToAuLarge.requiredFields);

// ── 3. Transfer within the EU — zero threshold ─────────────────────
console.log('\n=== DE → FR transfer (€50) on 2026-08-01 ===\n');

const deToFr = engine.evaluate(
  { from: 'DE', to: 'FR', fiatEquivalent: 50 },
  '2026-08-01',
);

console.log('Triggered:', deToFr.triggered, '(zero threshold — all CASP-to-CASP transfers)');
console.log('Required fields:', deToFr.requiredFields);

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
console.log('  GB triggered:', gbToSg.from.triggered, '(£100 < GBP 1,000)');
console.log('  SG triggered:', gbToSg.to.triggered, '(zero threshold)');
console.log('Required fields:', gbToSg.requiredFields);

// ── 6. Unhosted wallet verification ─────────────────────────────────
console.log('\n=== Unhosted wallet verification ===\n');

const deWallet = engine.walletVerification('DE', '2026-08-01');
console.log('DE:', deWallet);

const usWallet = engine.walletVerification('US');
console.log('US:', usWallet);

const sgWallet = engine.walletVerification('SG');
console.log('SG:', sgWallet);
