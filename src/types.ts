export type PiiField =
  | 'fullName'
  | 'dateOfBirth'
  | 'placeOfBirth'
  | 'idDocumentNumber'
  | 'address'
  | 'accountNumber'
  | 'townAndCountry';

export interface ThresholdTier {
  amount: number;
  currency: string;
  isZeroThreshold: boolean;
  requiredFields: {
    originator: PiiField[];
    beneficiary: PiiField[];
  };
}

export interface TravelRuleVersion {
  versionId: string;
  status: 'active' | 'pending' | 'deprecated';
  effectiveFrom: string; // ISO YYYY-MM-DD
  effectiveTo: string | null;
  threshold: {
    transmission: ThresholdTier;
    verification: ThresholdTier;
  };
  unhostedWallets: {
    verificationRequired: boolean;
    verificationThreshold?: number;
    notes?: string;
  };
  authorityUrl: string;
}

export interface JurisdictionData {
  countryCode: string;
  name: string;
  authority: string;
  rules: TravelRuleVersion[];
}

export interface TransferRequest {
  from: string;
  to: string;
  fiatEquivalent: number;
}

export interface TriggerResult {
  transmissionRequired: boolean;
  verificationRequired: boolean;
}

export interface WalletVerificationResult {
  required: boolean;
  threshold: number | null;
  currency: string | null;
  notes: string | null;
}

export interface EvaluationResult {
  triggered: boolean;
  verificationRequired: boolean;
  from: {
    countryCode: string;
    rule: TravelRuleVersion | null;
    transmissionRequired: boolean;
    verificationRequired: boolean;
  };
  to: {
    countryCode: string;
    rule: TravelRuleVersion | null;
    transmissionRequired: boolean;
    verificationRequired: boolean;
  };
  requiredFields: {
    transmission: {
      originator: PiiField[];
      beneficiary: PiiField[];
    };
    verification: {
      originator: PiiField[];
      beneficiary: PiiField[];
    };
  };
}
