# Crypto Travel Rules

A machine-readable JSON directory of global Travel Rule requirements with a TypeScript SDK to handle the **Sunrise Issue** — different jurisdictions enforcing rules at different times. [Contributions welcome](#contributing) — especially new jurisdictions and data accuracy improvements.

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
import { TravelRuleEngine } from './src/engine';

const engine = new TravelRuleEngine();

// Evaluate a cross-border transfer: US → AU, $1,000 equivalent
const result = engine.evaluate({ from: 'US', to: 'AU', fiatEquivalent: 1000 }, '2026-08-01');

console.log(result.triggered);
// true — AU threshold is AUD 1,000 (triggered), US threshold is USD 3,000 (not triggered)

console.log(result.requiredFields);
// {
//   originator: ["fullName", "dateOfBirth", "accountNumber", "address"],
//   beneficiary: ["fullName", "accountNumber", "townAndCountry"]
// }
// Union of both jurisdictions' requirements (strictest of the two)

// Check unhosted wallet verification requirements
const wallet = engine.walletVerification('DE', '2026-08-01');
console.log(wallet);
// {
//   required: true,
//   threshold: 1000,
//   currency: "EUR",
//   notes: "Full EU TFR enforcement..."
// }

// You can also check a single jurisdiction's rule directly
const rule = engine.getApplicableRule('DE', '2026-08-01');
console.log(rule?.threshold);
// { amount: 0, currency: 'EUR', isZeroThreshold: true }

engine.isRuleTriggered('US', 5000);
// true
```

## Project Structure

```
data/
  jurisdictions/    # One JSON file per country/jurisdiction
    AU.json
    DE.json
    GB.json
    HK.json
    SG.json
    US.json
    ... (208 total)
src/
  types.ts          # TypeScript interfaces (IVMS101-aligned)
  engine.ts         # ComplianceEngine class
```

## Jurisdiction Coverage

**208 jurisdictions** covered across all continents. Each file in `data/jurisdictions/` is named by [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) code (e.g., `GB.json` for the United Kingdom, not "UK").

### Highlights

| Region | Count | Notable |
|--------|-------|---------|
| Europe | 43 | All 27 EU member states + EEA + GB, CH, and microstates. EU TFR (EUR 1,000) active since Dec 2024; zero-threshold expansion pending Jul 2026. |
| Asia-Pacific | 32 | JP, KR, SG, HK, AU, TW, and more. Mix of zero-threshold (JP, SG) and developing frameworks. |
| Americas | 36 | US, CA, BR, MX + Caribbean. Includes BTC legal tender jurisdictions (SV). |
| Middle East | 13 | AE, SA, QA, BH, IL. Bahrain has zero-threshold. |
| Africa | 42 | ZA, NG, KE, GH, MU + WAEMU/CEMAC regional frameworks. CAR has BTC legal tender status. |
| Oceania | 8 | NZ, FJ + Pacific island nations. |
| Territories | 10 | KY, BM, VG, GI, JE, GG, IM, CW + Crown Dependencies and OFCs. |

### Zero-Threshold Jurisdictions (all transfers)

`BH` · `BS` · `CN` · `GI` · `JP` · `SG` · `SV` · `VA` · `VE` + all EU/EEA states from Jul 2026

**[View full directory (208 jurisdictions) →](data/DIRECTORY.md)**

## The Jurisdiction Object

Each file in `data/jurisdictions/` contains a single `JurisdictionData` object. See `src/types.ts` for the TypeScript definitions.

```json
{
  "countryCode": "DE",
  "name": "Germany",
  "authority": "Bundesanstalt für Finanzdienstleistungsaufsicht (BaFin)",
  "rules": [
    {
      "versionId": "DE-2024-001",
      "status": "active",
      "effectiveFrom": "2024-12-30",
      "effectiveTo": "2026-06-30",
      "threshold": { "amount": 1000, "currency": "EUR", "isZeroThreshold": false },
      "requiredFields": {
        "originator": ["fullName", "accountNumber", "address"],
        "beneficiary": ["fullName", "accountNumber"]
      },
      "unhostedWallets": {
        "verificationRequired": true,
        "verificationThreshold": 1000,
        "notes": "BaFin enforces EU TFR with KryptoWTransferV requirements."
      },
      "authorityUrl": "https://www.bafin.de/..."
    },
    {
      "versionId": "DE-2026-001",
      "status": "pending",
      "effectiveFrom": "2026-07-01",
      "effectiveTo": null,
      "threshold": { "amount": 0, "currency": "EUR", "isZeroThreshold": true },
      "requiredFields": {
        "originator": ["fullName", "accountNumber", "address", "dateOfBirth", "placeOfBirth", "idDocumentNumber"],
        "beneficiary": ["fullName", "accountNumber"]
      },
      "unhostedWallets": {
        "verificationRequired": true,
        "verificationThreshold": 1000,
        "notes": "Full EU TFR enforcement. Zero threshold for CASP-to-CASP."
      },
      "authorityUrl": "https://www.bafin.de/..."
    }
  ]
}
```

### Attributes

**countryCode** `string` **required**

ISO 3166-1 alpha-2 country code. Must match the filename (e.g., `GB.json` contains `"countryCode": "GB"`). Use `XK` for Kosovo (user-assigned code).

---

**name** `string` **required**

Full English name of the jurisdiction.

---

**authority** `string` **required**

Name of the primary regulatory authority responsible for travel rule enforcement. Include the abbreviation in parentheses, e.g., `"Financial Conduct Authority (FCA)"`. For dual-authority jurisdictions, separate with ` / `.

---

**rules** `TravelRuleVersion[]` **required**

Array of one or more travel rule versions. Each entry represents a distinct regulatory period with its own thresholds, required fields, and effective dates. Rules should have non-overlapping date ranges — the `ComplianceEngine` selects the applicable rule based on the query date.

---

## The TravelRuleVersion Object

Each entry in the `rules` array describes a specific regulatory version.

```json
{
  "versionId": "SG-2024-001",
  "status": "active",
  "effectiveFrom": "2024-01-28",
  "effectiveTo": null,
  "threshold": { "amount": 0, "currency": "SGD", "isZeroThreshold": true },
  "requiredFields": {
    "originator": ["fullName", "accountNumber", "address", "idDocumentNumber", "dateOfBirth"],
    "beneficiary": ["fullName", "accountNumber"]
  },
  "unhostedWallets": {
    "verificationRequired": true,
    "notes": "MAS Notice PSN02 requires wallet ownership verification via cryptographic signature or equivalent."
  },
  "authorityUrl": "https://www.mas.gov.sg/regulation/notices/psn02"
}
```

### Attributes

**versionId** `string` **required**

Unique identifier following the pattern `{CC}-{YYYY}-{NNN}` — country code, year of enactment, and a sequential number (e.g., `DE-2024-001`).

---

**status** `enum` **required**

Current lifecycle status of this rule version.

| Value | Description |
|-------|-------------|
| `active` | Currently in force and enforceable |
| `pending` | Announced/enacted but not yet effective |
| `deprecated` | Previously active, now superseded |

---

**effectiveFrom** `string` **required**

Date the rule becomes enforceable. ISO 8601 format `YYYY-MM-DD`.

---

**effectiveTo** `string | null` **required**

Date the rule ceases to be enforceable. Set to `null` for the currently open-ended rule. When a successor rule is announced, set this to the day before the new rule's `effectiveFrom`.

---

**threshold** `object` **required**

Describes the amount at which the travel rule is triggered.

| Field | Type | Description |
|-------|------|-------------|
| `amount` | `number` | Threshold in local currency. Set to `0` for zero-threshold jurisdictions. |
| `currency` | `string` | ISO 4217 currency code (e.g., `EUR`, `USD`, `GBP`). |
| `isZeroThreshold` | `boolean` | `true` if the rule applies to **all** transfers regardless of amount. Only set `true` when `amount` is `0`. |

> Thresholds should approximate the FATF-recommended USD/EUR 1,000 equivalent in local currency. If a threshold deviates significantly (>3x or <0.3x), verify against the primary regulatory source.

---

**requiredFields** `object` **required**

PII fields required when the travel rule is triggered, split by party.

| Field | Type | Description |
|-------|------|-------------|
| `originator` | `PiiField[]` | Fields required for the sender of the transfer |
| `beneficiary` | `PiiField[]` | Fields required for the recipient of the transfer |

**Allowed `PiiField` values** (IVMS101-aligned):

| Value | Description |
|-------|-------------|
| `fullName` | Legal full name of the natural or legal person |
| `dateOfBirth` | Date of birth (`YYYY-MM-DD`) |
| `placeOfBirth` | City/country of birth |
| `idDocumentNumber` | National ID, passport, or equivalent document number |
| `address` | Residential or registered address |
| `accountNumber` | Wallet address, IBAN, or account identifier |
| `townAndCountry` | Town/city and country (when full address is not required) |

---

**unhostedWallets** `object` **required**

Policy for transfers involving unhosted wallets (also called self-hosted or self-custodial wallets). "Unhosted" is the standard FATF/regulatory term used in official guidance and legislation.

| Field | Type | Description |
|-------|------|-------------|
| `verificationRequired` | `boolean` | Whether the VASP must verify wallet ownership |
| `verificationThreshold` | `number` *(optional)* | Amount above which verification kicks in. Omit if verification applies at all amounts or is not required. |
| `notes` | `string` *(optional)* | Verification methods (e.g., cryptographic signature, Satoshi test) or other regulatory details |

---

**authorityUrl** `string` **required**

URL to the primary regulatory text, guidance, or authority page. Must link directly to the relevant regulator — not a news article or third-party summary.

---

### Rule Versioning

A jurisdiction can have multiple rules. The `ComplianceEngine` automatically selects the correct one based on `effectiveFrom` dates — it picks the most recently effective rule for the query date. You don't need to manually flip statuses or maintain `effectiveTo` boundaries.

**To add a future rule:** just append it to the `rules` array with its `effectiveFrom` date. The engine will start using it automatically when that date arrives.

The `status` field is **informational** (for humans browsing the JSON):
- `active` — currently in force
- `pending` — announced, not yet effective
- `deprecated` — superseded by a newer rule

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
2. That's it — the engine picks the correct rule by date automatically

### Quality Standards

- All dates must be ISO 8601 (`YYYY-MM-DD`)
- All currency codes must be ISO 4217
- Every rule must include an `authorityUrl` pointing to the primary regulatory source
- Use `isZeroThreshold: true` only when the regulation applies to all transfers regardless of amount

## Disclaimer

This project is provided for informational purposes only and does not constitute legal, regulatory, or compliance advice. While every effort is made to keep the data accurate and up to date, regulatory requirements change frequently. Always verify rules against the primary regulatory sources cited in each jurisdiction file before making compliance decisions.

## License

MIT
