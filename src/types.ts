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
