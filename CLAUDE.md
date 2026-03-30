# CLAUDE.md — Project Guide for crypto-travel-rules

## What This Project Is

A machine-readable JSON directory of global Travel Rule requirements (FATF Recommendation 16) with a TypeScript SDK to handle the Sunrise Issue. 208 jurisdictions covered.

## Project Structure

```
data/jurisdictions/*.json   — One file per jurisdiction, named by ISO 3166-1 alpha-2 code
src/types.ts                — IVMS101-aligned TypeScript interfaces
src/engine.ts               — ComplianceEngine class (loads JSONs, resolves rules by date)
scripts/                    — One-time data generation/fix scripts (not part of the SDK)
```

## Key Conventions

### Country Codes
- Always ISO 3166-1 alpha-2 (e.g., `GB` not `UK`, `KR` not `KO`)
- No supranational entries (no `EU.json` — the TFR is enforced through individual member states)
- Filename must match the `countryCode` field inside the JSON

### JSON Schema Rules
- All dates: ISO 8601 `YYYY-MM-DD`
- All currency codes: ISO 4217
- Every rule must have an `authorityUrl` pointing to a primary regulatory source
- `effectiveTo: null` means the rule is currently open-ended
- `isZeroThreshold: true` only when regulation applies to ALL transfers regardless of amount
- PII fields must be from the allowed set: `fullName`, `dateOfBirth`, `placeOfBirth`, `idDocumentNumber`, `address`, `accountNumber`, `townAndCountry`

### Rule Versioning
- Each jurisdiction can have multiple rules with non-overlapping date ranges
- Active rule: currently in force. Pending rule: announced but not yet effective
- When a new rule takes effect, set `effectiveTo` on the previous rule to the day before
- Version IDs follow the pattern: `{CC}-{YYYY}-{NNN}` (e.g., `GB-2023-001`)

### Threshold Guidelines
- Thresholds should be in local currency
- Aim for approximate alignment with FATF-recommended USD/EUR 1,000 equivalent
- If a jurisdiction's threshold seems like a major outlier (>3x or <0.3x the FATF standard in USD terms), verify against primary source before committing
- Document the reasoning in the `notes` field if the threshold genuinely deviates

### Regional Frameworks
- WAEMU/BCEAO countries (BF, BJ, CI, GW, ML, NE, SN, TG) share the same central bank — keep thresholds consistent unless a specific country has divergent national law
- CEMAC/BEAC countries (CF, CG, CM, GA, GQ, TD) — same principle
- EU/EEA member states follow EU TFR — if updating one, consider whether the change applies to all

### Data Accuracy — Known Pitfalls
- **Do NOT confuse unhosted wallet verification thresholds with the general travel rule trigger threshold.** Many jurisdictions (EU/EEA, GB, CH, SG, HK, AU) have zero-threshold travel rules where ALL CASP-to-CASP transfers require data, but unhosted wallet verification only kicks in above a separate threshold (e.g., EUR 1,000).
- **Effective dates must reflect when the travel rule actually took effect**, not related but distinct regulations (e.g., KR's VAUPA vs the Specific Financial Information Act).
- **Unhosted wallet `verificationRequired`** should be `false` when the travel rule transmission obligation doesn't apply (no counterparty VASP). Record-keeping obligations are separate and should be documented in `notes`, not flagged as verification requirements.
- **Required fields that are alternatives** (e.g., address OR date of birth OR ID document number) should all be listed but documented as alternatives in `notes`, not presented as all simultaneously mandatory.
- **Always verify against primary regulatory sources** (eCFR, EUR-Lex, official gazette) before committing data changes. Secondary sources (compliance vendors, news articles) frequently contain inaccuracies.

### Publishing
- Package is published to GitHub Packages npm registry as `@cogentic-co/crypto-travel-rules`
- Publishing is automated via `.github/workflows/publish.yml` — triggered by creating a GitHub release
- To publish a new version: bump version in `package.json`, commit, push, then create a GitHub release (e.g., `gh release create v0.2.0 --title "v0.2.0" --notes "..."`)
- Do NOT run `npm publish` locally — use the GitHub Actions workflow

## Build & Validate

```bash
npm install
npm run build        # Compile TypeScript
npm run validate     # Type-check without emitting
```

## Common Tasks

### Adding a jurisdiction
1. Create `data/jurisdictions/{CC}.json` following the schema in `src/types.ts`
2. Run `npm run validate` to confirm types are correct
3. Verify the `countryCode` in the JSON matches the filename

### Updating a rule
1. Add a new rule entry to the `rules` array with `status: "pending"` and the future `effectiveFrom` date
2. The engine picks the correct rule by date automatically — no need to maintain `effectiveTo` or flip statuses

### Testing the engine
```typescript
import { TravelRuleEngine } from './src/engine';
const engine = new TravelRuleEngine();

// Evaluate a cross-border transfer
engine.evaluate({ from: 'US', to: 'AU', fiatEquivalent: 1000 }, '2026-08-01');

// Single jurisdiction lookup
engine.getApplicableRule('DE', '2026-08-01');
engine.isRuleTriggered('US', 5000);
```
