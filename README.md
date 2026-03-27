# Crypto Travel Rules

A machine-readable JSON directory of global Travel Rule requirements with a TypeScript SDK to handle the **Sunrise Issue** — different jurisdictions enforcing rules at different times.

## Why This Exists

The FATF Travel Rule requires Virtual Asset Service Providers (VASPs) to exchange originator and beneficiary information during crypto transfers. However, over 200 jurisdictions are implementing this at different times, with different thresholds, and different data requirements. This project provides:

- **Structured data** for each jurisdiction's travel rule (threshold, required PII fields, unhosted wallet policy)
- **A compliance engine** that resolves which rule applies for a given country and date
- **IVMS101-aligned schemas** so the data maps cleanly to the interVASP messaging standard

## Quick Start

```bash
npm install
npm run build
```

```typescript
import { ComplianceEngine } from './src/engine';

const engine = new ComplianceEngine();

// Get the rule active in the EU on a specific date
const rule = engine.getApplicableRule('EU', '2026-08-01');
console.log(rule?.threshold);
// { amount: 0, currency: 'EUR', isZeroThreshold: true }

// Check if a transaction triggers the travel rule
const triggered = engine.isRuleTriggered('AU', 1500, '2026-08-01');
console.log(triggered); // true (threshold is AUD 1,000 after AUSTRAC reform)
```

## Project Structure

```
data/
  jurisdictions/    # One JSON file per country/jurisdiction
    AU.json
    EU.json
    HK.json
    SG.json
    UK.json
src/
  types.ts          # TypeScript interfaces (IVMS101-aligned)
  engine.ts         # ComplianceEngine class
```

## Jurisdiction Coverage

| Code | Jurisdiction     | Authority | Threshold         | Status  |
|------|------------------|-----------|--------------------|---------|
| AU   | Australia        | AUSTRAC   | AUD 1,000 (Jul 2026) | Pending |
| EU   | European Union   | EBA       | EUR 0 (Jul 2026)  | Pending |
| SG   | Singapore        | MAS       | SGD 0              | Active  |
| HK   | Hong Kong        | SFC       | HKD 8,000          | Active  |
| UK   | United Kingdom   | FCA       | GBP 1,000          | Active  |

**Goal: 200+ jurisdictions.** See [Contributing](#contributing) below.

## JSON Schema

Each jurisdiction file follows this structure:

```json
{
  "countryCode": "XX",
  "name": "Country Name",
  "authority": "Regulatory Authority",
  "rules": [
    {
      "versionId": "XX-YYYY-NNN",
      "status": "active | pending | deprecated",
      "effectiveFrom": "YYYY-MM-DD",
      "effectiveTo": "YYYY-MM-DD | null",
      "threshold": {
        "amount": 1000,
        "currency": "XXX",
        "isZeroThreshold": false
      },
      "requiredFields": {
        "originator": ["fullName", "accountNumber", "..."],
        "beneficiary": ["fullName", "accountNumber", "..."]
      },
      "unhostedWallets": {
        "verificationRequired": true,
        "verificationThreshold": 1000,
        "notes": "..."
      },
      "authorityUrl": "https://..."
    }
  ]
}
```

### Allowed PII Fields (IVMS101-aligned)

`fullName` · `dateOfBirth` · `placeOfBirth` · `idDocumentNumber` · `address` · `accountNumber` · `townAndCountry`

### Rule Versioning

Each jurisdiction can have multiple rules with non-overlapping date ranges. The engine selects the correct version based on the query date. Use `effectiveTo: null` for the currently open-ended rule.

## Contributing

We need help reaching 200+ jurisdictions. Here's how to contribute:

### Adding a New Jurisdiction

1. **Fork** this repo and create a branch: `git checkout -b add/XX-country-name`
2. **Create** `data/jurisdictions/XX.json` using the [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country code
3. **Follow the schema** exactly as shown above — use the TypeScript types in `src/types.ts` as the source of truth
4. **Include**:
   - The correct regulatory authority name
   - Accurate thresholds and currencies
   - The PII fields actually required by the regulation
   - A link to the official regulatory text (`authorityUrl`)
   - Proper `effectiveFrom` / `effectiveTo` dates
5. **Validate** your JSON parses and the project builds: `npm run validate`
6. **Open a PR** with:
   - The jurisdiction JSON file
   - A brief note on which regulatory text you referenced
   - Any pending rules that have been announced but not yet effective

### Updating an Existing Jurisdiction

If a country announces new rules or amends thresholds:

1. Add a new entry to the `rules` array with `status: "pending"` and the future `effectiveFrom` date
2. Set `effectiveTo` on the current active rule to the day before the new rule takes effect
3. Update `status` from `"active"` to `"deprecated"` once the old rule expires

### Quality Standards

- All dates must be ISO 8601 (`YYYY-MM-DD`)
- All currency codes must be ISO 4217
- Every rule must include an `authorityUrl` pointing to the primary regulatory source
- Use `isZeroThreshold: true` only when the regulation applies to all transfers regardless of amount

## License

MIT
