# Schema Reference

Detailed field-by-field documentation for all data types in this project. For an overview of the project, see [README.md](README.md).

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

## Beneficiary Obligations

Each file in `data/beneficiary-obligations/` describes what a **receiving** VASP must do when it gets an incoming transfer. Currently covers 41 jurisdictions (US, DE, GB, SG, AU, ZA).

```json
{
  "countryCode": "DE",
  "mustVerifyOriginatorData": true,
  "rejectIncompleteTransfers": true,
  "responseTimeHours": null,
  "recordKeepingYears": 5,
  "authorityUrl": "https://eur-lex.europa.eu/...",
  "notes": "EU TFR Article 17 requires beneficiary CASPs to detect missing or incomplete originator/beneficiary information..."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `mustVerifyOriginatorData` | `boolean` | Must the beneficiary VASP verify the originator information it receives? |
| `rejectIncompleteTransfers` | `boolean` | Must the VASP reject or hold transfers with missing data? |
| `responseTimeHours` | `number \| null` | Hours to respond/flag issues. `null` if not specified (most jurisdictions use "without undue delay"). |
| `recordKeepingYears` | `number` | How long records must be retained. |

```typescript
const obligations = engine.getBeneficiaryObligations('DE');
console.log(obligations?.mustVerifyOriginatorData); // true
console.log(obligations?.rejectIncompleteTransfers); // true
```

## Reporting Thresholds

Each file in `data/reporting/` describes the STR (Suspicious Transaction Report) and CTR (Cash Transaction Report) requirements. Currently covers 41 jurisdictions.

```json
{
  "countryCode": "US",
  "str": {
    "required": true,
    "threshold": 2000,
    "currency": "USD",
    "timeframeDays": 30,
    "authority": "FinCEN",
    "notes": "SAR required for MSBs (including VASPs) for suspicious transactions of USD 2,000 or more."
  },
  "ctr": {
    "required": true,
    "threshold": 10000,
    "currency": "USD",
    "authority": "FinCEN",
    "notes": "CTR required for physical cash transactions over USD 10,000."
  },
  "authorityUrl": "https://www.fincen.gov/..."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `str` | `ReportingThreshold` | Suspicious transaction reporting requirements. |
| `ctr` | `ReportingThreshold \| null` | Cash transaction reporting. `null` if the jurisdiction has no automatic reporting (e.g., DE, GB, SG). |

**ReportingThreshold:**

| Field | Type | Description |
|-------|------|-------------|
| `required` | `boolean` | Is reporting mandatory for VASPs? |
| `threshold` | `number` | Amount that triggers reporting. `0` = all suspicious transactions. |
| `currency` | `string` | ISO 4217 currency code. |
| `timeframeDays` | `number` | Filing deadline in days. `0` = immediately. |
| `authority` | `string` | Which authority receives the reports. |

```typescript
const reporting = engine.getReporting('US');
console.log(reporting?.str.threshold);  // 2000
console.log(reporting?.ctr?.threshold); // 10000
```
