export interface Rule {
  id: string;
  citation: string;
  subject: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  penaltyAmount: number;
  automationLevel: 'full' | 'assisted' | 'flagged';
}

export interface RulePack {
  version: string;
  effectiveFrom: string;
  isActive: boolean;
  rules: Rule[];
}
