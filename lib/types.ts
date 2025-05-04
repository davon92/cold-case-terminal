import { Timestamp } from 'firebase-admin/firestore';

  export interface EvidenceData {
    fileName: string;
    fileType: string;
    fileDownloadUrl: string;
    thumbnailUrl: string;
    unlockCode?: string; // if undefined, evidence is public
  }
  
  export interface CaseData {
    title: string;
    evidence: Record<string, EvidenceData>;
  }
  
  export type PendingEvidence = {
    evidenceID: string;
    submittedBy: 'Self' | 'Assistant';
    submittedAt: Timestamp;
    status: 'pending';
  };

  export interface RunDocument {
    runId?: string;
    agentName?: string;
    createdAt?: FirebaseFirestore.Timestamp;
    lastUpdatedAt?: FirebaseFirestore.Timestamp;
    guestAccessCode?: string;
    gameMode?: string;
    expired?: boolean;
    totalFails?: number;
    submittedCases?: string[];
    unlockedCases?: string[];
    unlockedEvidence?: string[];
    startingEvidence?: Record<string, boolean>;
    currentCaseId?: string;
    currentCaseProgress?: {
      caseId?: string;
      collectedEvidence?: Record<string, boolean>;
    };
    pendingEvidence?: PendingEvidence[];
  }

  export interface SubmittedCase {
    caseId: string;
    collectedEvidence: Record<string, boolean>;
    score?: number;
    submittedAt?: Timestamp;
  }
  
  