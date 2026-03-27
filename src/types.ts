export type PiiField =
  | 'fullName'
  | 'dateOfBirth'
  | 'placeOfBirth'
  | 'idDocumentNumber'
  | 'address'
  | 'accountNumber'
  | 'townAndCountry';

export interface TravelRuleVersion {
  versionId: string;
  status: 'active' | 'pending' | 'deprecated';
  effectiveFrom: string; // ISO YYYY-MM-DD
  effectiveTo: string | null;
  threshold: {
    amount: number;
    currency: string;
    isZeroThreshold: boolean;
  };
  requiredFields: {
    originator: PiiField[];
    beneficiary: PiiField[];
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

export interface WalletVerificationResult {
  required: boolean;
  threshold: number | null;
  currency: string | null;
  notes: string | null;
}

export interface BeneficiaryObligations {
  countryCode: string;
  mustVerifyOriginatorData: boolean;
  rejectIncompleteTransfers: boolean;
  responseTimeHours: number | null;
  recordKeepingYears: number;
  authorityUrl: string;
  notes: string;
}

export interface ReportingThreshold {
  required: boolean;
  threshold: number;
  currency: string;
  timeframeDays: number;
  authority: string;
  notes: string;
}

export interface ReportingData {
  countryCode: string;
  str: ReportingThreshold;
  ctr: ReportingThreshold | null;
  authorityUrl: string;
}

export interface EvaluationResult {
  triggered: boolean;
  from: {
    countryCode: string;
    rule: TravelRuleVersion | null;
    triggered: boolean;
  };
  to: {
    countryCode: string;
    rule: TravelRuleVersion | null;
    triggered: boolean;
  };
  requiredFields: {
    originator: PiiField[];
    beneficiary: PiiField[];
  };
}
