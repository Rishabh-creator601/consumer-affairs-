export interface OcrToken {
  text: string;
  bbox: number[];
  confidence: number;
  panel: string;
}

export interface ExtractedData {
  manufacturer: { declared: string; normalized: string; confidence: number };
  genericName: { declared: string; normalized: string; confidence: number };
  netQuantity: { declared: string; normalized: string; confidence: number };
  monthYear: { declared: string; normalized: string; confidence: number };
  mrp: { declared: string; normalized: string; confidence: number };
  consumerCare: { declared: string; normalized: string; confidence: number };
}

export interface ComplianceResult {
  ruleId: string;
  citation: string;
  check: string;
  found: string;
  required: string;
  verdict: 'PASS' | 'FAIL' | 'REVIEW' | 'NOT_APPLICABLE';
  confidence: number;
  overridden?: boolean;
  overrideVerdict?: string;
  overrideReason?: string;
}

export type InspectionStatus = 'draft' | 'extracted' | 'under_review' | 'adjudicated' | 'notice_issued' | 'closed';
export type Verdict = 'compliant' | 'non_compliant' | 'review' | 'draft';

export interface Inspection {
  _id: string;
  ref: string;
  officerId: string;
  productId: string;
  images: any[];
  extracted: ExtractedData;
  results: ComplianceResult[];
  verdict: Verdict;
  status: InspectionStatus;
  remarks: string;
  penalties: { total: number; breakdown: any[] };
  createdAt: string;
}
