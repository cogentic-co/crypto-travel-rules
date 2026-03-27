import * as fs from 'fs';
import * as path from 'path';
import { JurisdictionData, TravelRuleVersion } from './types';

export class ComplianceEngine {
  private jurisdictions: Map<string, JurisdictionData> = new Map();

  constructor(dataDir?: string) {
    const dir = dataDir ?? path.resolve(__dirname, '..', 'data', 'jurisdictions');
    this.loadJurisdictions(dir);
  }

  private loadJurisdictions(dir: string): void {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const data: JurisdictionData = JSON.parse(raw);
      this.jurisdictions.set(data.countryCode.toUpperCase(), data);
    }
  }

  getJurisdiction(countryCode: string): JurisdictionData | undefined {
    return this.jurisdictions.get(countryCode.toUpperCase());
  }

  listJurisdictions(): string[] {
    return Array.from(this.jurisdictions.keys()).sort();
  }

  /**
   * Returns the applicable travel rule for a jurisdiction on a given date.
   * Rules are matched by effectiveFrom/effectiveTo date range and sorted
   * so the most recently effective rule wins when ranges overlap.
   */
  getApplicableRule(
    countryCode: string,
    date: string | Date = new Date(),
  ): TravelRuleVersion | null {
    const jurisdiction = this.jurisdictions.get(countryCode.toUpperCase());
    if (!jurisdiction) return null;

    const target = typeof date === 'string' ? date : date.toISOString().slice(0, 10);

    const matching = jurisdiction.rules
      .filter((rule) => {
        if (rule.effectiveFrom > target) return false;
        if (rule.effectiveTo !== null && rule.effectiveTo < target) return false;
        return true;
      })
      .sort((a, b) => (a.effectiveFrom > b.effectiveFrom ? -1 : 1));

    return matching[0] ?? null;
  }

  /**
   * Checks whether a transaction amount triggers the travel rule
   * for a given jurisdiction and date. Returns true when the rule
   * applies (amount meets or exceeds the threshold, or the threshold
   * is zero).
   */
  isRuleTriggered(
    countryCode: string,
    amount: number,
    date: string | Date = new Date(),
  ): boolean {
    const rule = this.getApplicableRule(countryCode, date);
    if (!rule) return false;
    if (rule.threshold.isZeroThreshold) return true;
    return amount >= rule.threshold.amount;
  }
}
