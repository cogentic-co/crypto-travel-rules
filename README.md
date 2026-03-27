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

**209 jurisdictions** covered across all continents. Each file in `data/jurisdictions/` is named by [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) code.

### Highlights

| Region | Count | Notable |
|--------|-------|---------|
| Europe | 44 | All 27 EU member states + EEA + UK, CH, and microstates. EU states include pending 2026 TFR zero-threshold rules. |
| Asia-Pacific | 32 | JP, KR, SG, HK, AU, TW, and more. Mix of zero-threshold (JP, SG) and developing frameworks. |
| Americas | 36 | US, CA, BR, MX + Caribbean. Includes BTC legal tender jurisdictions (SV). |
| Middle East | 13 | AE, SA, QA, BH, IL. Bahrain has zero-threshold. |
| Africa | 42 | ZA, NG, KE, GH, MU + WAEMU/CEMAC regional frameworks. CAR has BTC legal tender status. |
| Oceania | 8 | NZ, FJ + Pacific island nations. |
| Territories | 10 | KY, BM, VG, GI, JE, GG, IM, CW + Crown Dependencies and OFCs. |

### Zero-Threshold Jurisdictions (all transfers)

`BH` · `BS` · `CF` · `CN` · `EU` (Jul 2026) · `GI` · `JP` · `SG` · `SV` · `VA` · `VE` + all EU/EEA states from Jul 2026

### Full Directory

| Code | Jurisdiction | Authority | Threshold | Status |
|------|-------------|-----------|-----------|--------|
| AD | Andorra | Andorran Financial Authority | EUR 1,000 | Active |
| AE | United Arab Emirates | Virtual Assets Regulatory Authority | AED 3,500 | Active |
| AF | Afghanistan | Da Afghanistan Bank | USD 1,000 | Active |
| AG | Antigua and Barbuda | Eastern Caribbean Central Bank | XCD 1,000 | Active |
| AI | Anguilla | ECCB / Anguilla Financial Services Commission | XCD 1,000 | Active |
| AL | Albania | Bank of Albania | EUR 1,500 | Active |
| AM | Armenia | Central Bank of Armenia | USD 1,000 | Active |
| AO | Angola | Banco Nacional de Angola | USD 1,000 | Active |
| AR | Argentina | Comisión Nacional de Valores | USD 1,000 | Active |
| AT | Austria | Finanzmarktaufsichtsbehörde | EUR 0 (all transfers) | Pending |
| AU | Australia | AUSTRAC | AUD 1,000 | Pending |
| AZ | Azerbaijan | Central Bank of Azerbaijan | USD 1,000 | Active |
| BA | Bosnia and Herzegovina | Banking Agency of FBiH / Banking Agency of RS | EUR 1,000 | Active |
| BB | Barbados | Central Bank of Barbados / Financial Services Commission | BBD 1,000 | Active |
| BD | Bangladesh | Bangladesh Bank | USD 1,000 | Active |
| BE | Belgium | Financial Services and Markets Authority | EUR 0 (all transfers) | Pending |
| BF | Burkina Faso | BCEAO | XOF 1,000 | Active |
| BG | Bulgaria | National Revenue Agency | EUR 0 (all transfers) | Pending |
| BH | Bahrain | Central Bank of Bahrain | BHD 0 (all transfers) | Active |
| BI | Burundi | Banque de la République du Burundi | USD 1,000 | Active |
| BJ | Benin | BCEAO | XOF 1,000 | Active |
| BM | Bermuda | Bermuda Monetary Authority | USD 1,000 | Active |
| BN | Brunei | Autoriti Monetari Brunei Darussalam | USD 1,000 | Active |
| BO | Bolivia | Autoridad de Supervisión del Sistema Financiero | USD 1,000 | Active |
| BR | Brazil | Banco Central do Brasil | BRL 5,000 | Active |
| BS | Bahamas | Securities Commission of The Bahamas | BSD 0 (all transfers) | Active |
| BT | Bhutan | Royal Monetary Authority of Bhutan | USD 1,000 | Active |
| BW | Botswana | Bank of Botswana | BWP 1,000 | Active |
| BY | Belarus | National Bank of the Republic of Belarus | USD 1,000 | Active |
| BZ | Belize | Central Bank of Belize | USD 1,000 | Active |
| CA | Canada | FINTRAC | CAD 1,000 | Active |
| CD | Congo (DRC) | Banque Centrale du Congo | USD 1,000 | Active |
| CF | Central African Republic | BEAC | XAF 0 (all transfers) | Active |
| CG | Congo (Republic) | BEAC | XAF 1,000 | Active |
| CH | Switzerland | FINMA | CHF 1,000 | Active |
| CI | Côte d'Ivoire | BCEAO | XOF 1,000 | Active |
| CL | Chile | Comisión para el Mercado Financiero | USD 1,000 | Active |
| CM | Cameroon | BEAC | XAF 1,000 | Active |
| CN | China | People's Bank of China | CNY 0 (all transfers) | Active |
| CO | Colombia | Superintendencia Financiera de Colombia | USD 1,000 | Active |
| CR | Costa Rica | SUGEF | USD 1,000 | Active |
| CU | Cuba | Banco Central de Cuba | USD 1,000 | Active |
| CV | Cabo Verde | Banco de Cabo Verde | CVE 1,000 | Active |
| CW | Curaçao | Central Bank of Curaçao and Sint Maarten | USD 1,000 | Active |
| CY | Cyprus | CySEC | EUR 0 (all transfers) | Pending |
| CZ | Czech Republic | Czech National Bank | EUR 0 (all transfers) | Pending |
| DE | Germany | BaFin | EUR 0 (all transfers) | Pending |
| DJ | Djibouti | Banque Centrale de Djibouti | USD 1,000 | Active |
| DK | Denmark | Finanstilsynet | EUR 0 (all transfers) | Pending |
| DM | Dominica | ECCB / Financial Services Unit | XCD 1,000 | Active |
| DO | Dominican Republic | Superintendencia de Bancos | DOP 1,000 | Active |
| DZ | Algeria | Banque d'Algérie | USD 1,000 | Active |
| EC | Ecuador | Superintendencia de Bancos del Ecuador | USD 1,000 | Active |
| EE | Estonia | Estonian Financial Intelligence Unit | EUR 0 (all transfers) | Pending |
| EG | Egypt | Central Bank of Egypt | USD 1,000 | Active |
| ER | Eritrea | Bank of Eritrea | USD 1,000 | Active |
| ES | Spain | Banco de España / CNMV | EUR 0 (all transfers) | Pending |
| ET | Ethiopia | National Bank of Ethiopia | USD 1,000 | Active |
| EU | European Union | European Banking Authority | EUR 0 (all transfers) | Pending |
| FI | Finland | FIN-FSA | EUR 0 (all transfers) | Pending |
| FJ | Fiji | Reserve Bank of Fiji | USD 1,000 | Active |
| FM | Micronesia | Department of Finance and Administration | USD 1,000 | Active |
| FR | France | Autorité des marchés financiers | EUR 0 (all transfers) | Pending |
| GA | Gabon | BEAC | XAF 1,000 | Active |
| GD | Grenada | ECCB / GARFIN | XCD 1,000 | Active |
| GE | Georgia | National Bank of Georgia | GEL 3,000 | Active |
| GG | Guernsey | Guernsey Financial Services Commission | GBP 1,000 | Active |
| GH | Ghana | Bank of Ghana / SEC | GHS 1,000 | Active |
| GI | Gibraltar | Gibraltar Financial Services Commission | GBP 0 (all transfers) | Active |
| GM | Gambia | Central Bank of The Gambia | USD 1,000 | Active |
| GN | Guinea | BCRG | USD 1,000 | Active |
| GQ | Equatorial Guinea | BEAC | XAF 1,000 | Active |
| GR | Greece | Hellenic Capital Market Commission | EUR 0 (all transfers) | Pending |
| GT | Guatemala | Superintendencia de Bancos de Guatemala | USD 1,000 | Active |
| GW | Guinea-Bissau | BCEAO | XOF 1,000 | Active |
| GY | Guyana | Bank of Guyana | USD 1,000 | Active |
| HK | Hong Kong | Securities and Futures Commission | HKD 8,000 | Active |
| HN | Honduras | CNBS | USD 1,000 | Active |
| HR | Croatia | Croatian National Bank / HANFA | EUR 0 (all transfers) | Pending |
| HT | Haiti | Banque de la République d'Haïti | USD 1,000 | Active |
| HU | Hungary | Magyar Nemzeti Bank | EUR 0 (all transfers) | Pending |
| ID | Indonesia | Otoritas Jasa Keuangan | IDR 5,000,000 | Active |
| IE | Ireland | Central Bank of Ireland | EUR 0 (all transfers) | Pending |
| IL | Israel | CMISA | ILS 5,000 | Active |
| IM | Isle of Man | Isle of Man Financial Services Authority | GBP 1,000 | Active |
| IN | India | FIU-IND | INR 50,000 | Active |
| IQ | Iraq | Central Bank of Iraq | USD 1,000 | Active |
| IR | Iran | Central Bank of Iran | USD 1,000 | Active |
| IS | Iceland | Financial Supervisory Authority of Iceland | EUR 0 (all transfers) | Pending |
| IT | Italy | Organismo Agenti e Mediatori / Banca d'Italia | EUR 0 (all transfers) | Pending |
| JE | Jersey | Jersey Financial Services Commission | GBP 1,000 | Active |
| JM | Jamaica | Bank of Jamaica / FSC | JMD 1,000 | Active |
| JO | Jordan | Central Bank of Jordan | USD 1,000 | Active |
| JP | Japan | JFSA | JPY 0 (all transfers) | Active |
| KE | Kenya | Capital Markets Authority | KES 100,000 | Active |
| KG | Kyrgyzstan | National Bank of the Kyrgyz Republic | USD 1,000 | Active |
| KH | Cambodia | National Bank of Cambodia | USD 1,000 | Active |
| KI | Kiribati | Ministry of Finance | AUD 1,000 | Active |
| KM | Comoros | Banque Centrale des Comores | USD 1,000 | Active |
| KN | Saint Kitts and Nevis | ECCB / FSRC | XCD 1,000 | Active |
| KR | South Korea | Financial Services Commission / KoFIU | KRW 1,000,000 | Active |
| KW | Kuwait | Capital Markets Authority of Kuwait | KWD 1,000 | Active |
| KY | Cayman Islands | CIMA | USD 1,000 | Active |
| KZ | Kazakhstan | ARDFM | USD 1,000 | Active |
| LA | Laos | Bank of the Lao PDR | USD 1,000 | Active |
| LB | Lebanon | Banque du Liban | USD 1,000 | Active |
| LC | Saint Lucia | ECCB / FSRA | XCD 1,000 | Active |
| LI | Liechtenstein | FMA Liechtenstein | EUR 0 (all transfers) | Pending |
| LK | Sri Lanka | Central Bank of Sri Lanka | USD 1,000 | Active |
| LR | Liberia | Central Bank of Liberia | USD 1,000 | Active |
| LS | Lesotho | Central Bank of Lesotho | USD 1,000 | Active |
| LT | Lithuania | Bank of Lithuania | EUR 0 (all transfers) | Pending |
| LU | Luxembourg | CSSF | EUR 0 (all transfers) | Pending |
| LV | Latvia | FKTK | EUR 0 (all transfers) | Pending |
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
| MN | Mongolia | Financial Regulatory Commission | USD 1,000 | Active |
| MR | Mauritania | Central Bank of Mauritania | USD 1,000 | Active |
| MS | Montserrat | ECCB / Financial Services Commission | XCD 1,000 | Active |
| MT | Malta | MFSA | EUR 0 (all transfers) | Pending |
| MU | Mauritius | Financial Services Commission | USD 1,000 | Active |
| MV | Maldives | Maldives Monetary Authority | USD 1,000 | Active |
| MW | Malawi | Reserve Bank of Malawi | USD 1,000 | Active |
| MX | Mexico | CNBV | MXN 8,000 | Active |
| MY | Malaysia | Securities Commission Malaysia | MYR 3,000 | Active |
| MZ | Mozambique | Banco de Moçambique | USD 1,000 | Active |
| NA | Namibia | Bank of Namibia | NAD 1,000 | Active |
| NE | Niger | BCEAO | XOF 1,000 | Active |
| NG | Nigeria | Securities and Exchange Commission | NGN 1,500,000 | Active |
| NI | Nicaragua | SIBOIF | USD 1,000 | Active |
| NL | Netherlands | De Nederlandsche Bank | EUR 0 (all transfers) | Pending |
| NO | Norway | Finanstilsynet | EUR 0 (all transfers) | Pending |
| NP | Nepal | Nepal Rastra Bank | USD 1,000 | Active |
| NR | Nauru | Department of Finance | AUD 1,000 | Active |
| NZ | New Zealand | Department of Internal Affairs | NZD 1,000 | Active |
| OM | Oman | Capital Market Authority of Oman | OMR 1,000 | Active |
| PA | Panama | Superintendencia del Mercado de Valores | USD 1,000 | Active |
| PE | Peru | SBS | USD 1,000 | Active |
| PG | Papua New Guinea | Bank of Papua New Guinea | USD 1,000 | Active |
| PH | Philippines | Bangko Sentral ng Pilipinas | PHP 50,000 | Active |
| PK | Pakistan | State Bank of Pakistan / SECP | USD 1,000 | Active |
| PL | Poland | KNF | EUR 0 (all transfers) | Pending |
| PS | Palestine | Palestine Monetary Authority | USD 1,000 | Active |
| PT | Portugal | Banco de Portugal | EUR 0 (all transfers) | Pending |
| PW | Palau | Ministry of Finance | USD 1,000 | Active |
| PY | Paraguay | Banco Central del Paraguay / SEPRELAD | USD 1,000 | Active |
| QA | Qatar | QFCRA | QAR 1,000 | Active |
| RO | Romania | National Bank of Romania / ASF | EUR 0 (all transfers) | Pending |
| RS | Serbia | National Bank of Serbia | EUR 1,000 | Active |
| RU | Russia | Central Bank of Russia | USD 1,000 | Active |
| RW | Rwanda | National Bank of Rwanda | USD 1,000 | Active |
| SA | Saudi Arabia | SAMA | SAR 1,000 | Active |
| SB | Solomon Islands | Central Bank of Solomon Islands | USD 1,000 | Active |
| SC | Seychelles | Financial Services Authority | USD 1,000 | Active |
| SD | Sudan | Central Bank of Sudan | USD 1,000 | Active |
| SE | Sweden | Finansinspektionen | EUR 0 (all transfers) | Pending |
| SG | Singapore | Monetary Authority of Singapore | SGD 0 (all transfers) | Active |
| SI | Slovenia | Bank of Slovenia / ATVP | EUR 0 (all transfers) | Pending |
| SK | Slovakia | National Bank of Slovakia | EUR 0 (all transfers) | Pending |
| SL | Sierra Leone | Bank of Sierra Leone | USD 1,000 | Active |
| SM | San Marino | Central Bank of San Marino | EUR 1,000 | Active |
| SN | Senegal | BCEAO | XOF 1,000 | Active |
| SO | Somalia | Central Bank of Somalia | USD 1,000 | Active |
| SR | Suriname | Centrale Bank van Suriname | USD 1,000 | Active |
| SS | South Sudan | Bank of South Sudan | USD 1,000 | Active |
| ST | São Tomé and Príncipe | Banco Central de São Tomé e Príncipe | USD 1,000 | Active |
| SV | El Salvador | Superintendencia del Sistema Financiero | USD 0 (all transfers) | Active |
| SY | Syria | Central Bank of Syria | USD 1,000 | Active |
| SZ | Eswatini | Central Bank of Eswatini | SZL 1,000 | Active |
| TC | Turks and Caicos Islands | Financial Services Commission | USD 1,000 | Active |
| TD | Chad | BEAC | XAF 1,000 | Active |
| TG | Togo | BCEAO | XOF 1,000 | Active |
| TH | Thailand | Securities and Exchange Commission | THB 50,000 | Active |
| TJ | Tajikistan | National Bank of Tajikistan | USD 1,000 | Active |
| TL | Timor-Leste | Central Bank of Timor-Leste | USD 1,000 | Active |
| TM | Turkmenistan | Central Bank of Turkmenistan | USD 1,000 | Active |
| TN | Tunisia | Banque Centrale de Tunisie | TND 1,000 | Active |
| TO | Tonga | National Reserve Bank of Tonga | USD 1,000 | Active |
| TR | Turkey | Capital Markets Board of Turkey | TRY 15,000 | Active |
| TT | Trinidad and Tobago | Central Bank of Trinidad and Tobago / TTSEC | TTD 1,000 | Active |
| TV | Tuvalu | Ministry of Finance | USD 1,000 | Active |
| TW | Taiwan | Financial Supervisory Commission | TWD 1,000,000 | Active |
| TZ | Tanzania | Bank of Tanzania | USD 1,000 | Active |
| UA | Ukraine | NSSMC | USD 1,000 | Active |
| UG | Uganda | Bank of Uganda | USD 1,000 | Active |
| UK | United Kingdom | Financial Conduct Authority | GBP 1,000 | Active |
| US | United States | FinCEN | USD 3,000 | Active |
| UY | Uruguay | Banco Central del Uruguay | USD 1,000 | Active |
| UZ | Uzbekistan | NAPP | USD 1,000 | Active |
| VA | Vatican City | Financial Information Authority | EUR 0 (all transfers) | Active |
| VC | Saint Vincent and the Grenadines | ECCB / FSA | XCD 1,000 | Active |
| VE | Venezuela | SUNACRIP | USD 0 (all transfers) | Active |
| VG | British Virgin Islands | BVI Financial Services Commission | USD 1,000 | Active |
| VN | Vietnam | State Bank of Vietnam | USD 1,000 | Active |
| VU | Vanuatu | Reserve Bank of Vanuatu / VFSC | USD 1,000 | Active |
| WS | Samoa | Central Bank of Samoa | USD 1,000 | Active |
| XK | Kosovo | Central Bank of Kosovo | EUR 1,000 | Active |
| YE | Yemen | Central Bank of Yemen | USD 1,000 | Active |
| ZA | South Africa | FSCA / FIC | ZAR 5,000 | Active |
| ZM | Zambia | Bank of Zambia / SEC | USD 1,000 | Active |
| ZW | Zimbabwe | Reserve Bank of Zimbabwe | USD 1,000 | Active |

Browse all files: [`data/jurisdictions/`](data/jurisdictions/)

See [Contributing](#contributing) to help improve data accuracy.

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
