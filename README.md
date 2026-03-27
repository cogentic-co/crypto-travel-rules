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

// Get the rule active in Germany on a specific date
const rule = engine.getApplicableRule('DE', '2026-08-01');
console.log(rule?.threshold);
// { amount: 0, currency: 'EUR', isZeroThreshold: true }  (EU TFR zero-threshold)

// Check if a transaction triggers the travel rule
const triggered = engine.isRuleTriggered('AU', 1500, '2026-08-01');
console.log(triggered); // true (threshold is AUD 1,000 after AUSTRAC reform)
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

### Full Directory

| Code | Jurisdiction | Authority | Threshold | Status |
|------|-------------|-----------|-----------|--------|
| AD | Andorra | Andorran Financial Authority (AFA) | EUR 1,000 | Active |
| AE | United Arab Emirates | VARA | AED 3,500 | Active |
| AF | Afghanistan | Da Afghanistan Bank | USD 1,000 | Active |
| AG | Antigua and Barbuda | ECCB | XCD 1,000 | Active |
| AI | Anguilla | ECCB / Anguilla Financial Services Commission | XCD 1,000 | Active |
| AL | Albania | Bank of Albania | EUR 1,500 | Active |
| AM | Armenia | Central Bank of Armenia | USD 1,000 | Active |
| AO | Angola | Banco Nacional de Angola (BNA) | USD 1,000 | Active |
| AR | Argentina | UIF | USD 1,000 | Active |
| AT | Austria | Finanzmarktaufsichtsbehörde (FMA) | EUR 1,000 | Active (update pending) |
| AU | Australia | AUSTRAC | AUD 10,000 | Active (update pending) |
| AZ | Azerbaijan | Central Bank of Azerbaijan (CBAR) | USD 1,000 | Active |
| BA | Bosnia and Herzegovina | Banking Agency of FBiH / Banking Agency of RS | EUR 1,000 | Active |
| BB | Barbados | Central Bank of Barbados / Financial Services C... | BBD 1,000 | Active |
| BD | Bangladesh | Bangladesh Bank | USD 1,000 | Active |
| BE | Belgium | FSMA | EUR 1,000 | Active (update pending) |
| BF | Burkina Faso | BCEAO (Central Bank of West African States) | XOF 1,000 | Active |
| BG | Bulgaria | National Revenue Agency (NRA) | EUR 1,000 | Active (update pending) |
| BH | Bahrain | Central Bank of Bahrain (CBB) | BHD 0 (all transfers) | Active |
| BI | Burundi | Banque de la République du Burundi | USD 1,000 | Active |
| BJ | Benin | BCEAO | XOF 1,000 | Active |
| BM | Bermuda | Bermuda Monetary Authority (BMA) | USD 1,000 | Active |
| BN | Brunei | AMBD | USD 1,000 | Active |
| BO | Bolivia | ASFI | USD 1,000 | Active |
| BR | Brazil | BCB | BRL 5,000 | Active |
| BS | Bahamas | SCB | BSD 0 (all transfers) | Active |
| BT | Bhutan | Royal Monetary Authority of Bhutan | USD 1,000 | Active |
| BW | Botswana | Bank of Botswana | BWP 1,000 | Active |
| BY | Belarus | National Bank of the Republic of Belarus | USD 1,000 | Active |
| BZ | Belize | Central Bank of Belize | USD 1,000 | Active |
| CA | Canada | FINTRAC | CAD 1,000 | Active |
| CD | Congo (DRC) | Banque Centrale du Congo | USD 1,000 | Active |
| CF | Central African Republic | BEAC (Bank of Central African States) | XAF 1,000 | Active |
| CG | Congo (Republic) | BEAC | XAF 1,000 | Active |
| CH | Switzerland | FINMA | CHF 1,000 | Active |
| CI | Côte d'Ivoire | BCEAO | XOF 1,000 | Active |
| CL | Chile | CMF | USD 1,000 | Active |
| CM | Cameroon | BEAC | XAF 1,000 | Active |
| CN | China | People's Bank of China (PBoC) | CNY 0 (all transfers) | Active |
| CO | Colombia | SFC | USD 1,000 | Active |
| CR | Costa Rica | SUGEF | USD 1,000 | Active |
| CU | Cuba | Banco Central de Cuba | USD 1,000 | Active |
| CV | Cabo Verde | Banco de Cabo Verde | CVE 1,000 | Active |
| CW | Curaçao | CBCS | USD 1,000 | Active |
| CY | Cyprus | Cyprus Securities and Exchange Commission (CySEC) | EUR 1,000 | Active (update pending) |
| CZ | Czech Republic | Czech National Bank (CNB) | EUR 1,000 | Active (update pending) |
| DE | Germany | Bundesanstalt für Finanzdienstleistungsaufsicht... | EUR 1,000 | Active (update pending) |
| DJ | Djibouti | Banque Centrale de Djibouti | USD 1,000 | Active |
| DK | Denmark | Danish Financial Supervisory Authority (Finanst... | EUR 1,000 | Active (update pending) |
| DM | Dominica | ECCB / Financial Services Unit | XCD 1,000 | Active |
| DO | Dominican Republic | Superintendencia de Bancos (SB) | DOP 1,000 | Active |
| DZ | Algeria | Banque d'Algérie | USD 1,000 | Active |
| EC | Ecuador | Superintendencia de Bancos del Ecuador | USD 1,000 | Active |
| EE | Estonia | FIU | EUR 1,000 | Active (update pending) |
| EG | Egypt | Central Bank of Egypt (CBE) | USD 1,000 | Active |
| ER | Eritrea | Bank of Eritrea | USD 1,000 | Active |
| ES | Spain | Banco de España / CNMV | EUR 1,000 | Active (update pending) |
| ET | Ethiopia | National Bank of Ethiopia | USD 1,000 | Active |
| FI | Finland | FIN-FSA | EUR 1,000 | Active (update pending) |
| FJ | Fiji | Reserve Bank of Fiji | USD 1,000 | Active |
| FM | Micronesia | Department of Finance and Administration | USD 1,000 | Active |
| FR | France | ACPR | EUR 1,000 | Active (update pending) |
| GA | Gabon | BEAC | XAF 1,000 | Active |
| GB | United Kingdom | Financial Conduct Authority (FCA) | GBP 1,000 | Active |
| GD | Grenada | GARFIN | XCD 1,000 | Active |
| GE | Georgia | National Bank of Georgia | GEL 3,000 | Active |
| GG | Guernsey | GFSC | GBP 1,000 | Active |
| GH | Ghana | Bank of Ghana / Securities and Exchange Commission | GHS 1,000 | Active |
| GI | Gibraltar | GFSC | GBP 0 (all transfers) | Active |
| GM | Gambia | Central Bank of The Gambia | USD 1,000 | Active |
| GN | Guinea | BCRG (Central Bank of Guinea) | USD 1,000 | Active |
| GQ | Equatorial Guinea | BEAC | XAF 1,000 | Active |
| GR | Greece | HCMC | EUR 1,000 | Active (update pending) |
| GT | Guatemala | Superintendencia de Bancos de Guatemala | USD 1,000 | Active |
| GW | Guinea-Bissau | BCEAO | XOF 1,000 | Active |
| GY | Guyana | Bank of Guyana | USD 1,000 | Active |
| HK | Hong Kong | Securities and Futures Commission (SFC) | HKD 8,000 | Active |
| HN | Honduras | CNBS | USD 1,000 | Active |
| HR | Croatia | Croatian National Bank (HNB) / HANFA | EUR 1,000 | Active (update pending) |
| HT | Haiti | Banque de la République d'Haïti | USD 1,000 | Active |
| HU | Hungary | Magyar Nemzeti Bank (MNB) | EUR 1,000 | Active (update pending) |
| ID | Indonesia | Otoritas Jasa Keuangan (OJK) / Bappebti | IDR 16,000,000 | Active |
| IE | Ireland | Central Bank of Ireland (CBI) | EUR 1,000 | Active (update pending) |
| IL | Israel | CMISA | ILS 5,000 | Active |
| IM | Isle of Man | IOMFSA | GBP 1,000 | Active |
| IN | India | FIU-IND | INR 50,000 | Active |
| IQ | Iraq | Central Bank of Iraq | USD 1,000 | Active |
| IR | Iran | Central Bank of Iran | USD 1,000 | Active |
| IS | Iceland | FME | EUR 1,000 | Active (update pending) |
| IT | Italy | OAM | EUR 1,000 | Active (update pending) |
| JE | Jersey | JFSC | GBP 1,000 | Active |
| JM | Jamaica | Bank of Jamaica / Financial Services Commission | JMD 1,000 | Active |
| JO | Jordan | Central Bank of Jordan | USD 1,000 | Active |
| JP | Japan | Japan Financial Services Agency (JFSA) | JPY 0 (all transfers) | Active |
| KE | Kenya | Capital Markets Authority (CMA) | KES 100,000 | Active |
| KG | Kyrgyzstan | National Bank of the Kyrgyz Republic | USD 1,000 | Active |
| KH | Cambodia | National Bank of Cambodia (NBC) | USD 1,000 | Active |
| KI | Kiribati | Ministry of Finance | AUD 1,000 | Active |
| KM | Comoros | Banque Centrale des Comores | USD 1,000 | Active |
| KN | Saint Kitts and Nevis | ECCB / Financial Services Regulatory Commission | XCD 1,000 | Active |
| KR | South Korea | FSC | KRW 1,000,000 | Active |
| KW | Kuwait | Capital Markets Authority of Kuwait | KWD 300 | Active |
| KY | Cayman Islands | Cayman Islands Monetary Authority (CIMA) | USD 1,000 | Active |
| KZ | Kazakhstan | ARDFM | USD 1,000 | Active |
| LA | Laos | Bank of the Lao PDR | USD 1,000 | Active |
| LB | Lebanon | Banque du Liban | USD 1,000 | Active |
| LC | Saint Lucia | ECCB / Financial Sector Regulatory Authority | XCD 1,000 | Active |
| LI | Liechtenstein | FMA | EUR 1,000 | Active (update pending) |
| LK | Sri Lanka | Central Bank of Sri Lanka | USD 1,000 | Active |
| LR | Liberia | Central Bank of Liberia | USD 1,000 | Active |
| LS | Lesotho | Central Bank of Lesotho | USD 1,000 | Active |
| LT | Lithuania | Bank of Lithuania | EUR 1,000 | Active (update pending) |
| LU | Luxembourg | CSSF | EUR 1,000 | Active (update pending) |
| LV | Latvia | FKTK | EUR 1,000 | Active (update pending) |
| LY | Libya | Central Bank of Libya | USD 1,000 | Active |
| MA | Morocco | Bank Al-Maghrib | MAD 1,000 | Active |
| MC | Monaco | CCAF | EUR 1,000 | Active |
| MD | Moldova | National Bank of Moldova | USD 1,000 | Active |
| ME | Montenegro | Central Bank of Montenegro | EUR 1,000 | Active |
| MG | Madagascar | Banque Centrale de Madagascar | USD 1,000 | Active |
| MH | Marshall Islands | Banking Commission | USD 1,000 | Active |
| MK | North Macedonia | National Bank of North Macedonia | EUR 1,000 | Active |
| ML | Mali | BCEAO | XOF 1,000 | Active |
| MM | Myanmar | Central Bank of Myanmar | USD 1,000 | Active |
| MN | Mongolia | Financial Regulatory Commission of Mongolia | USD 1,000 | Active |
| MR | Mauritania | Central Bank of Mauritania | USD 1,000 | Active |
| MS | Montserrat | ECCB / Financial Services Commission | XCD 1,000 | Active |
| MT | Malta | MFSA | EUR 1,000 | Active (update pending) |
| MU | Mauritius | FSC | USD 1,000 | Active |
| MV | Maldives | Maldives Monetary Authority (MMA) | USD 1,000 | Active |
| MW | Malawi | Reserve Bank of Malawi | USD 1,000 | Active |
| MX | Mexico | CNBV | MXN 8,000 | Active |
| MY | Malaysia | Securities Commission Malaysia (SC) | MYR 3,000 | Active |
| MZ | Mozambique | Banco de Moçambique | USD 1,000 | Active |
| NA | Namibia | Bank of Namibia | NAD 1,000 | Active |
| NE | Niger | BCEAO | XOF 1,000 | Active |
| NG | Nigeria | SEC | NGN 1,500,000 | Active |
| NI | Nicaragua | SIBOIF | USD 1,000 | Active |
| NL | Netherlands | De Nederlandsche Bank (DNB) | EUR 1,000 | Active (update pending) |
| NO | Norway | Finanstilsynet (Financial Supervisory Authority... | EUR 1,000 | Active (update pending) |
| NP | Nepal | Nepal Rastra Bank | USD 1,000 | Active |
| NR | Nauru | Department of Finance | AUD 1,000 | Active |
| NZ | New Zealand | Department of Internal Affairs (DIA) | NZD 1,000 | Active |
| OM | Oman | Capital Market Authority of Oman (CMA) | OMR 1,000 | Active |
| PA | Panama | SMV | USD 1,000 | Active |
| PE | Peru | SBS | USD 1,000 | Active |
| PG | Papua New Guinea | Bank of Papua New Guinea | USD 1,000 | Active |
| PH | Philippines | Bangko Sentral ng Pilipinas (BSP) | PHP 50,000 | Active |
| PK | Pakistan | State Bank of Pakistan (SBP) / SECP | USD 1,000 | Active |
| PL | Poland | KNF | EUR 1,000 | Active (update pending) |
| PS | Palestine | Palestine Monetary Authority (PMA) | USD 1,000 | Active |
| PT | Portugal | Banco de Portugal | EUR 1,000 | Active (update pending) |
| PW | Palau | Ministry of Finance | USD 1,000 | Active |
| PY | Paraguay | Banco Central del Paraguay / SEPRELAD | USD 1,000 | Active |
| QA | Qatar | QFCRA | QAR 1,000 | Active |
| RO | Romania | National Bank of Romania (BNR) / ASF | EUR 1,000 | Active (update pending) |
| RS | Serbia | National Bank of Serbia (NBS) | EUR 1,000 | Active |
| RU | Russia | Central Bank of Russia / Ministry of Finance | USD 1,000 | Active |
| RW | Rwanda | National Bank of Rwanda | USD 1,000 | Active |
| SA | Saudi Arabia | SAMA | SAR 1,000 | Active |
| SB | Solomon Islands | Central Bank of Solomon Islands | USD 1,000 | Active |
| SC | Seychelles | FSA | USD 1,000 | Active |
| SD | Sudan | Central Bank of Sudan | USD 1,000 | Active |
| SE | Sweden | Finansinspektionen (FI) | EUR 1,000 | Active (update pending) |
| SG | Singapore | Monetary Authority of Singapore (MAS) | SGD 0 (all transfers) | Active |
| SI | Slovenia | ATVP | EUR 1,000 | Active (update pending) |
| SK | Slovakia | National Bank of Slovakia (NBS) | EUR 1,000 | Active (update pending) |
| SL | Sierra Leone | Bank of Sierra Leone | USD 1,000 | Active |
| SM | San Marino | Central Bank of San Marino (BCSM) | EUR 1,000 | Active |
| SN | Senegal | BCEAO | XOF 1,000 | Active |
| SO | Somalia | Central Bank of Somalia | USD 1,000 | Active |
| SR | Suriname | Centrale Bank van Suriname | USD 1,000 | Active |
| SS | South Sudan | Bank of South Sudan | USD 1,000 | Active |
| ST | São Tomé and Príncipe | Banco Central de São Tomé e Príncipe | USD 1,000 | Active |
| SV | El Salvador | SSF | USD 0 (all transfers) | Active |
| SY | Syria | Central Bank of Syria | USD 1,000 | Active |
| SZ | Eswatini | Central Bank of Eswatini | SZL 1,000 | Active |
| TC | Turks and Caicos Islands | Financial Services Commission (FSC) | USD 1,000 | Active |
| TD | Chad | BEAC | XAF 1,000 | Active |
| TG | Togo | BCEAO | XOF 1,000 | Active |
| TH | Thailand | SEC | THB 50,000 | Active |
| TJ | Tajikistan | National Bank of Tajikistan | USD 1,000 | Active |
| TL | Timor-Leste | Central Bank of Timor-Leste (BCTL) | USD 1,000 | Active |
| TM | Turkmenistan | Central Bank of Turkmenistan | USD 1,000 | Active |
| TN | Tunisia | Banque Centrale de Tunisie | TND 1,000 | Active |
| TO | Tonga | National Reserve Bank of Tonga | USD 1,000 | Active |
| TR | Turkey | Capital Markets Board of Turkey (SPK) | TRY 15,000 | Active |
| TT | Trinidad and Tobago | Central Bank of Trinidad and Tobago / Trinidad ... | TTD 1,000 | Active |
| TV | Tuvalu | Ministry of Finance | USD 1,000 | Active |
| TW | Taiwan | Financial Supervisory Commission (FSC) | TWD 30,000 | Active |
| TZ | Tanzania | Bank of Tanzania | USD 1,000 | Active |
| UA | Ukraine | NSSMC | USD 1,000 | Active |
| UG | Uganda | Bank of Uganda | USD 1,000 | Active |
| US | United States | Financial Crimes Enforcement Network (FinCEN) | USD 3,000 | Active |
| UY | Uruguay | Banco Central del Uruguay | USD 1,000 | Active |
| UZ | Uzbekistan | NAPP | USD 1,000 | Active |
| VA | Vatican City | Financial Information Authority (AIF) | EUR 0 (all transfers) | Active |
| VC | Saint Vincent and the Grenadines | FSA | XCD 1,000 | Active |
| VE | Venezuela | SUNACRIP | USD 0 (all transfers) | Active |
| VG | British Virgin Islands | BVI Financial Services Commission (FSC) | USD 1,000 | Active |
| VN | Vietnam | State Bank of Vietnam (SBV) | USD 1,000 | Active |
| VU | Vanuatu | VFSC | USD 1,000 | Active |
| WS | Samoa | Central Bank of Samoa | USD 1,000 | Active |
| XK | Kosovo | Central Bank of Kosovo | EUR 1,000 | Active |
| YE | Yemen | Central Bank of Yemen | USD 1,000 | Active |
| ZA | South Africa | FSCA | ZAR 18,000 | Active |
| ZM | Zambia | Bank of Zambia / Securities and Exchange Commis... | USD 1,000 | Active |
| ZW | Zimbabwe | Reserve Bank of Zimbabwe | USD 1,000 | Active |

Browse all files: [`data/jurisdictions/`](data/jurisdictions/)

See [Contributing](#contributing) to help improve data accuracy.

## The Jurisdiction Object

Each file in `data/jurisdictions/` contains a single `JurisdictionData` object. See `src/types.ts` for the TypeScript definitions.

<table>
<tr><td width="500">

### Attributes

---

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

Array of one or more travel rule versions for this jurisdiction. Each entry represents a distinct regulatory period. Rules should have non-overlapping date ranges. The `ComplianceEngine` selects the applicable rule based on `effectiveFrom` / `effectiveTo` dates.

---

</td><td width="450">

**THE JURISDICTION OBJECT**

```json
{
  "countryCode": "DE",
  "name": "Germany",
  "authority": "Bundesanstalt für Finanz­dienstleistungsaufsicht (BaFin)",
  "rules": [
    {
      "versionId": "DE-2024-001",
      "status": "active",
      "effectiveFrom": "2024-12-30",
      "effectiveTo": "2026-06-30",
      "threshold": {
        "amount": 1000,
        "currency": "EUR",
        "isZeroThreshold": false
      },
      "requiredFields": {
        "originator": [
          "fullName",
          "accountNumber",
          "address"
        ],
        "beneficiary": [
          "fullName",
          "accountNumber"
        ]
      },
      "unhostedWallets": {
        "verificationRequired": true,
        "verificationThreshold": 1000,
        "notes": "BaFin enforces EU TFR..."
      },
      "authorityUrl": "https://www.bafin.de/..."
    },
    {
      "versionId": "DE-2026-001",
      "status": "pending",
      "effectiveFrom": "2026-07-01",
      "effectiveTo": null,
      "threshold": {
        "amount": 0,
        "currency": "EUR",
        "isZeroThreshold": true
      },
      "requiredFields": {
        "originator": [
          "fullName",
          "accountNumber",
          "address",
          "dateOfBirth",
          "placeOfBirth",
          "idDocumentNumber"
        ],
        "beneficiary": [
          "fullName",
          "accountNumber"
        ]
      },
      "unhostedWallets": {
        "verificationRequired": true,
        "verificationThreshold": 1000,
        "notes": "Full EU TFR enforcement..."
      },
      "authorityUrl": "https://www.bafin.de/..."
    }
  ]
}
```

</td></tr>
</table>

## The TravelRuleVersion Object

Each entry in the `rules` array describes a specific regulatory version with its own effective dates, thresholds, and data requirements.

<table>
<tr><td width="500">

### Attributes

---

**versionId** `string` **required**

Unique identifier following the pattern `{CC}-{YYYY}-{NNN}`. The country code, year of enactment, and a sequential number (e.g., `DE-2024-001`).

---

**status** `enum` **required**

Current status of this rule version.

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

The monetary threshold at which the travel rule is triggered.

| Field | Type | Description |
|-------|------|-------------|
| `amount` | `number` | Threshold amount in local currency. Set to `0` for zero-threshold jurisdictions. |
| `currency` | `string` | ISO 4217 currency code (e.g., `EUR`, `USD`, `GBP`). |
| `isZeroThreshold` | `boolean` | `true` if the rule applies to **all** transfers regardless of amount. Only set to `true` when `amount` is `0`. |

Thresholds should approximate the FATF-recommended USD/EUR 1,000 equivalent in local currency. If a threshold deviates significantly (>3x or <0.3x), verify against the primary regulatory source.

---

**requiredFields** `object` **required**

PII fields that must be collected and transmitted, split by party.

| Field | Type | Description |
|-------|------|-------------|
| `originator` | `PiiField[]` | Fields required for the sender of the transfer. |
| `beneficiary` | `PiiField[]` | Fields required for the recipient of the transfer. |

**Allowed PiiField values** (IVMS101-aligned):

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

Policy for transfers involving self-hosted (non-custodial) wallets.

| Field | Type | Description |
|-------|------|-------------|
| `verificationRequired` | `boolean` | Whether the VASP must verify wallet ownership. |
| `verificationThreshold` | `number` *(optional)* | Amount above which verification is required. Omit if verification applies to all amounts or is not required. |
| `notes` | `string` *(optional)* | Free-text description of specific verification methods (e.g., cryptographic signature, Satoshi test) or other regulatory details. |

---

**authorityUrl** `string` **required**

URL to the primary regulatory text, guidance, or authority page. Must be a direct link to the relevant regulator — not a news article or third-party summary.

---

</td><td width="450">

**EXAMPLE: SINGLE ACTIVE RULE**

```json
{
  "versionId": "SG-2024-001",
  "status": "active",
  "effectiveFrom": "2024-01-28",
  "effectiveTo": null,
  "threshold": {
    "amount": 0,
    "currency": "SGD",
    "isZeroThreshold": true
  },
  "requiredFields": {
    "originator": [
      "fullName",
      "accountNumber",
      "address",
      "idDocumentNumber",
      "dateOfBirth"
    ],
    "beneficiary": [
      "fullName",
      "accountNumber"
    ]
  },
  "unhostedWallets": {
    "verificationRequired": true,
    "notes": "MAS Notice PSN02 requires
      wallet ownership verification
      via cryptographic signature
      or equivalent."
  },
  "authorityUrl": "https://www.mas.gov.sg/..."
}
```

---

**EXAMPLE: THRESHOLD-BASED RULE**

```json
{
  "versionId": "US-2024-001",
  "status": "active",
  "effectiveFrom": "2024-01-01",
  "effectiveTo": null,
  "threshold": {
    "amount": 3000,
    "currency": "USD",
    "isZeroThreshold": false
  },
  "requiredFields": {
    "originator": [
      "fullName",
      "accountNumber",
      "address"
    ],
    "beneficiary": [
      "fullName",
      "accountNumber",
      "address"
    ]
  },
  "unhostedWallets": {
    "verificationRequired": true,
    "verificationThreshold": 3000,
    "notes": "FinCEN CVC/LTDA
      recordkeeping and travel rule
      for transactions >= $3,000."
  },
  "authorityUrl": "https://www.fincen.gov/..."
}
```

</td></tr>
</table>

### Rule Versioning

Each jurisdiction can have multiple rules with non-overlapping date ranges. The `ComplianceEngine` selects the correct version based on the query date.

- Use `effectiveTo: null` for the currently open-ended rule
- When a new rule is announced, add it with `status: "pending"` and set `effectiveTo` on the current rule to the day before `effectiveFrom` of the new rule
- When the new rule takes effect, update statuses accordingly (`active` → `deprecated`, `pending` → `active`)

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
