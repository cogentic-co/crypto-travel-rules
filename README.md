# Crypto Travel Rules

[![npm version](https://img.shields.io/npm/v/@cogentic-co/crypto-travel-rules?registry_uri=https%3A%2F%2Fnpm.pkg.github.com)](https://github.com/cogentic-co/crypto-travel-rules/packages) [![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![jurisdictions](https://img.shields.io/badge/jurisdictions-208-brightgreen)](data/DIRECTORY.md)

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

Contributions welcome — especially for the **167 jurisdictions** still missing beneficiary obligation and reporting threshold data. Fork, add a JSON file, validate, and open a PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide and priority jurisdiction list.

## Documentation

- **[SCHEMA.md](SCHEMA.md)** — Detailed field-by-field documentation for all data types (jurisdiction objects, PII fields, beneficiary obligations, reporting thresholds)
- **[data/DIRECTORY.md](data/DIRECTORY.md)** — Full directory of all 208 jurisdictions with status and thresholds

## Disclaimer

This project is provided for informational purposes only and does not constitute legal, regulatory, or compliance advice. While every effort is made to keep the data accurate and up to date, regulatory requirements change frequently. Always verify rules against the primary regulatory sources cited in each jurisdiction file before making compliance decisions.

## License

MIT
