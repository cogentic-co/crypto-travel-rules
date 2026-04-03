# Crypto Travel Rules

Machine-readable JSON directory of global Travel Rule requirements with a TypeScript SDK.

The FATF Travel Rule requires VASPs to exchange originator and beneficiary information during crypto transfers — but 208+ jurisdictions are implementing it at different times, with different thresholds, and different data requirements. This is the **Sunrise Problem**. This project provides structured, IVMS101-aligned data for every jurisdiction and a compliance engine that resolves which rules apply for a given country and date.

This data powers [VaspTrack](https://www.vasptrack.org) — a live, open VASP directory with 5,600+ entities, built by [Cogentic](https://www.cogentic.co).

## Quick Start

```bash
npm install @cogentic-co/crypto-travel-rules
```

```typescript
import { TravelRuleEngine } from '@cogentic-co/crypto-travel-rules';

const engine = new TravelRuleEngine();

// Evaluate a cross-border transfer: US → AU, $1,000 equivalent
const result = engine.evaluate({ from: 'US', to: 'AU', fiatEquivalent: 1000 }, '2026-08-01');

console.log(result.triggered);       // true — AU threshold is AUD 1,000 (triggered)
console.log(result.requiredFields);  // Union of both jurisdictions' requirements
```

> **Currency conversion is your responsibility.** Thresholds are in local currency (e.g., AUD for Australia, EUR for Germany). The engine compares `fiatEquivalent` directly against each jurisdiction's threshold — it does **not** perform currency conversion. Convert amounts to the destination jurisdiction's currency before calling `evaluate()`, or use `isRuleTriggered()` per jurisdiction with the appropriate converted amount.

## Coverage

**208 jurisdictions** across all continents. Each file in `data/jurisdictions/` is named by [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) code.

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

## Contributing

Contributions welcome — especially new jurisdictions and data accuracy improvements.

1. **Fork** and create a branch: `git checkout -b add/XX-country-name`
2. **Create** the JSON file(s) using the [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country code:
   - `data/jurisdictions/XX.json` — travel rule thresholds and required fields
   - `data/beneficiary-obligations/XX.json` — what the receiving VASP must do
   - `data/reporting/XX.json` — STR/SAR and CTR reporting requirements
3. **Follow the schema** — see [SCHEMA.md](SCHEMA.md) for field-by-field documentation, or `src/types.ts` for the TypeScript definitions
4. **Include** an `authorityUrl` pointing to the official regulatory text (not news articles)
5. **Validate**: `npm run validate && npm run validate:data`
6. **Open a PR** with a note on which regulatory text you referenced

**Updating an existing jurisdiction?** Just add a new entry to the `rules` array with `status: "pending"` and the future `effectiveFrom` date. The engine picks the correct rule by date automatically.

## Documentation

- **[SCHEMA.md](SCHEMA.md)** — Detailed field-by-field documentation for all data types (jurisdiction objects, PII fields, beneficiary obligations, reporting thresholds)
- **[data/DIRECTORY.md](data/DIRECTORY.md)** — Full directory of all 208 jurisdictions with status and thresholds

# Help Wanted: Expand Coverage for Beneficiary Obligations & Reporting Thresholds

We have **208 jurisdictions** covered for Travel Rule thresholds and required fields — but only **41** have beneficiary obligation and reporting threshold data. Help us close the gap.

## What's needed

Each jurisdiction needs up to three JSON files in `data/`:

| Data type | Directory | Current coverage | Target |
|---|---|---|---|
| Travel Rule thresholds | `data/jurisdictions/` | ✅ 208 | — |
| Beneficiary VASP obligations | `data/beneficiary-obligations/` | 41 / 208 | 208 |
| Reporting thresholds (STR/CTR) | `data/reporting/` | 41 / 208 | 208 |

## Priority jurisdictions

These are the highest-impact gaps — major crypto markets and G20 economies missing beneficiary obligation and/or reporting data. Pick one and open a PR.

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

## How to contribute

1. **Fork** the repo, create a branch: `git checkout -b add/XX-country-name`
2. **Pick a jurisdiction** from the list above
3. **Create the JSON file(s)** — use existing files as templates:
   - [`data/beneficiary-obligations/DE.json`](data/beneficiary-obligations/DE.json) — beneficiary obligations template
   - [`data/reporting/US.json`](data/reporting/US.json) — reporting thresholds template
4. **Include an `authorityUrl`** pointing to the primary regulatory text (not a news article)
5. **Validate**: `npm run validate && npm run validate:data`
6. **Open a PR** with a note on which regulatory source you referenced

You don't need to add all file types at once — a single beneficiary obligations or reporting file for one jurisdiction is a valuable contribution.

## Schema reference

See [`src/types.ts`](src/types.ts) for the full TypeScript type definitions. The README has detailed field-by-field documentation.

## Questions?

Open an issue if you're unsure about a jurisdiction's requirements or need help interpreting regulatory text. We're happy to help.

## Disclaimer

This project is provided for informational purposes only and does not constitute legal, regulatory, or compliance advice. While every effort is made to keep the data accurate and up to date, regulatory requirements change frequently. Always verify rules against the primary regulatory sources cited in each jurisdiction file before making compliance decisions.

## License

MIT
