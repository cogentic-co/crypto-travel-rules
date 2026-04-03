# Contributing

Contributions welcome — especially new jurisdictions and data accuracy improvements.

## How to Contribute

1. **Fork** and create a branch: `git checkout -b add/XX-country-name`
2. **Create** the JSON file(s) using the [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country code:
   - `data/jurisdictions/XX.json` — travel rule thresholds and required fields
   - `data/beneficiary-obligations/XX.json` — what the receiving VASP must do
   - `data/reporting/XX.json` — STR/SAR and CTR reporting requirements
3. **Follow the schema** — see [SCHEMA.md](SCHEMA.md) for field-by-field documentation, or `src/types.ts` for the TypeScript definitions
4. **Include** an `authorityUrl` pointing to the official regulatory text (not news articles)
5. **Validate**: `npm run validate && npm run validate:data`
6. **Open a PR** with a note on which regulatory text you referenced

You don't need to add all three file types at once — any single contribution is valuable.

**Updating an existing jurisdiction?** Just add a new entry to the `rules` array with `status: "pending"` and the future `effectiveFrom` date. The engine picks the correct rule by date automatically.

## Help Wanted: Beneficiary Obligations & Reporting Thresholds

We have **208 jurisdictions** covered for travel rule thresholds — but only **41** have beneficiary obligation and reporting threshold data. Help us close the gap.

| Data type | Directory | Current coverage | Target |
|---|---|---|---|
| Travel Rule thresholds | `data/jurisdictions/` | ✅ 208 | — |
| Beneficiary VASP obligations | `data/beneficiary-obligations/` | 41 / 208 | 208 |
| Reporting thresholds (STR/CTR) | `data/reporting/` | 41 / 208 | 208 |

Use existing files as templates: [`data/beneficiary-obligations/DE.json`](data/beneficiary-obligations/DE.json), [`data/reporting/US.json`](data/reporting/US.json).

### 🔴 Critical — Top crypto markets

- [ ] 🇯🇵 Japan (JP) — Zero-threshold, FSA/JFSA, large VASP population
- [ ] 🇰🇷 South Korea (KR) — Active enforcement, KFIU
- [ ] 🇭🇰 Hong Kong (HK) — SFC/HKMA dual regime
- [ ] 🇧🇷 Brazil (BR) — CVM/Banco Central, growing market
- [ ] 🇮🇳 India (IN) — FIU-IND, rapidly evolving framework
- [ ] 🇲🇽 Mexico (MX) — CNBV, Fintech Law
- [ ] 🇹🇷 Turkey (TR) — MASAK, new VASP regulations

### 🟠 High — G20 & major financial centres

- [ ] 🇮🇩 Indonesia (ID) — Bappebti/OJK transition
- [ ] 🇸🇦 Saudi Arabia (SA) — SAMA
- [ ] 🇦🇷 Argentina (AR) — CNV/UIF
- [ ] 🇷🇺 Russia (RU) — Rosfinmonitoring (complex sanctions context)
- [ ] 🇮🇹 Italy (IT) — OAM, EU TFR implementation
- [ ] 🇳🇱 Netherlands (NL) — DNB, EU TFR implementation
- [ ] 🇵🇱 Poland (PL) — KNF, EU TFR implementation
- [ ] 🇮🇪 Ireland (IE) — CBI, EU TFR implementation
- [ ] 🇱🇺 Luxembourg (LU) — CSSF, major fund domicile

### 🟡 Medium — Regional hubs & emerging markets

- [ ] 🇹🇭 Thailand (TH) — SEC Thailand
- [ ] 🇵🇭 Philippines (PH) — BSP
- [ ] 🇻🇳 Vietnam (VN) — SBV, framework in development
- [ ] 🇳🇬 Nigeria (NG) — SEC Nigeria, large P2P market
- [ ] 🇰🇪 Kenya (KE) — CMA
- [ ] 🇿🇦 South Africa (ZA) — FSCA/FIC
- [ ] 🇨🇱 Chile (CL) — CMF, new Fintech Law
- [ ] 🇨🇴 Colombia (CO) — SFC/UIAF
- [ ] 🇧🇭 Bahrain (BH) — CBB, zero-threshold regime
- [ ] 🇶🇦 Qatar (QA) — QFCRA/QCB

## Questions?

Open an issue if you're unsure about a jurisdiction's requirements or need help interpreting regulatory text. We're happy to help.
