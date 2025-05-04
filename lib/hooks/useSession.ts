'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SubmittedCase } from '../types';

export interface SessionData {
  runId: string;
  agentName: string;
  currentCaseId: string;
  submittedCases: SubmittedCase[];
  unlockedCases: string[];
  unlockedEvidence: string[];
  collectedEvidence: string[];
  isGuest: boolean;
}

export function useSession(): SessionData | null {
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    const runId = localStorage.getItem('runId');
    const isGuest = localStorage.getItem('guestAccess') === 'true';
    if (!runId) return;

    const fetchSession = async () => {
      const docRef = doc(db, 'runs', runId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const collectedMap = data.currentCaseProgress?.collectedEvidence ?? {};
        const collectedEvidence = Object.keys(collectedMap);

        const sessionData: SessionData = {
          runId,
          agentName: data.agentName ?? 'Unknown Agent',
          currentCaseId: data.currentCaseProgress?.caseId ?? '001',
          submittedCases: data.submittedCases ?? [],
          unlockedCases: data.unlockedCases ?? [],
          unlockedEvidence: data.unlockedEvidence ?? [],
          collectedEvidence,
          isGuest,
        };

        setSession(sessionData);
      } else {
        console.warn(`Run ${runId} not found in Firestore.`);
      }
    };

    fetchSession();
  }, []);

  return session;
}
