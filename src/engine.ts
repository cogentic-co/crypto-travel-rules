import * as fs from 'fs';
import * as path from 'path';
import {
  EvaluationResult,
  JurisdictionData,
  PiiField,
  TransferRequest,
  TravelRuleVersion,
  TriggerResult,
  WalletVerificationResult,
} from './types';

function mergeFields(a: PiiField[], b: PiiField[]): PiiField[] {
  return [...new Set([...a, ...b])];
}

export class TravelRuleEngine {
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
   * Checks whether a transaction amount triggers transmission and/or
   * verification requirements for a given jurisdiction and date.
   */
  isRuleTriggered(
    countryCode: string,
    amount: number,
    date: string | Date = new Date(),
  ): TriggerResult {
    const rule = this.getApplicableRule(countryCode, date);
    if (!rule) return { transmissionRequired: false, verificationRequired: false };

    const { transmission, verification } = rule.threshold;

    const transmissionRequired = transmission.isZeroThreshold || amount >= transmission.amount;
    const verificationRequired = verification.isZeroThreshold || amount >= verification.amount;

    return { transmissionRequired, verificationRequired };
  }

  /**
   * Returns the unhosted (self-hosted / self-custodial) wallet verification
   * requirements for a jurisdiction on a given date.
   */
  walletVerification(
    countryCode: string,
    date: string | Date = new Date(),
  ): WalletVerificationResult {
    const rule = this.getApplicableRule(countryCode, date);
    if (!rule) {
      return { required: false, threshold: null, currency: null, notes: null };
    }
    return {
      required: rule.unhostedWallets.verificationRequired,
      threshold: rule.unhostedWallets.verificationThreshold ?? null,
      currency: rule.threshold.transmission.currency,
      notes: rule.unhostedWallets.notes ?? null,
    };
  }

  /**
   * Evaluates a cross-border transfer against both the originator and
   * beneficiary jurisdictions. Returns the union of required fields
   * (the stricter of the two) for both transmission and verification
   * tiers, and whether each tier is triggered by either side.
   */
  evaluate(
    transfer: TransferRequest,
    date: string | Date = new Date(),
  ): EvaluationResult {
    const fromRule = this.getApplicableRule(transfer.from, date);
    const toRule = this.getApplicableRule(transfer.to, date);

    const fromTrigger = this.isRuleTriggered(transfer.from, transfer.fiatEquivalent, date);
    const toTrigger = this.isRuleTriggered(transfer.to, transfer.fiatEquivalent, date);

    const triggered = fromTrigger.transmissionRequired || toTrigger.transmissionRequired;
    const verificationRequired = fromTrigger.verificationRequired || toTrigger.verificationRequired;

    const transmissionOriginatorFields = mergeFields(
      fromTrigger.transmissionRequired && fromRule ? fromRule.threshold.transmission.requiredFields.originator : [],
      toTrigger.transmissionRequired && toRule ? toRule.threshold.transmission.requiredFields.originator : [],
    );
    const transmissionBeneficiaryFields = mergeFields(
      fromTrigger.transmissionRequired && fromRule ? fromRule.threshold.transmission.requiredFields.beneficiary : [],
      toTrigger.transmissionRequired && toRule ? toRule.threshold.transmission.requiredFields.beneficiary : [],
    );

    const verificationOriginatorFields = mergeFields(
      fromTrigger.verificationRequired && fromRule ? fromRule.threshold.verification.requiredFields.originator : [],
      toTrigger.verificationRequired && toRule ? toRule.threshold.verification.requiredFields.originator : [],
    );
    const verificationBeneficiaryFields = mergeFields(
      fromTrigger.verificationRequired && fromRule ? fromRule.threshold.verification.requiredFields.beneficiary : [],
      toTrigger.verificationRequired && toRule ? toRule.threshold.verification.requiredFields.beneficiary : [],
    );

    return {
      triggered,
      verificationRequired,
      from: {
        countryCode: transfer.from.toUpperCase(),
        rule: fromRule,
        transmissionRequired: fromTrigger.transmissionRequired,
        verificationRequired: fromTrigger.verificationRequired,
      },
      to: {
        countryCode: transfer.to.toUpperCase(),
        rule: toRule,
        transmissionRequired: toTrigger.transmissionRequired,
        verificationRequired: toTrigger.verificationRequired,
      },
      requiredFields: {
        transmission: {
          originator: transmissionOriginatorFields,
          beneficiary: transmissionBeneficiaryFields,
        },
        verification: {
          originator: verificationOriginatorFields,
          beneficiary: verificationBeneficiaryFields,
        },
      },
    };
  }
}
