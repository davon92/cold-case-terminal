import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { FirebaseOptions } from 'firebase/app';
import { PendingEvidence } from './types';
import { RunDocument } from '@/lib/types';

// Firebase client config (browser-safe version)
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);


// 🔓 Unlock evidence using a code (adds to unlockedEvidence array)
export async function unlockEvidenceForRun(
  runId: string,
  code: string
): Promise<'ok' | 'alreadyUnlocked' | 'invalidCode' | 'error'> {
  try {
    const runRef = doc(db, 'runs', runId);
    const runSnap = await getDoc(runRef);
    if (!runSnap.exists()) return 'error';

    const runData = runSnap.data() as RunDocument;

    const casesRef = doc(db, 'cases', runData.currentCaseProgress?.caseId ?? '');
    const caseSnap = await getDoc(casesRef);
    if (!caseSnap.exists()) return 'error';

    const caseData = caseSnap.data();
    const evidence = caseData?.evidence ?? {};

    const unlockedEvidence = new Set(runData.unlockedEvidence ?? []);

    for (const [evidenceId, entry] of Object.entries(evidence)) {
      if (
        (entry as { unlockCode?: string }).unlockCode === code &&
        !unlockedEvidence.has(evidenceId)
      ) {
        await updateDoc(runRef, {
          unlockedEvidence: arrayUnion(evidenceId),
        });
        return 'ok';
      }

      if (
        (entry as { unlockCode?: string }).unlockCode === code &&
        unlockedEvidence.has(evidenceId)
      ) {
        return 'alreadyUnlocked';
      }
    }

    return 'invalidCode';
  } catch (err) {
    console.error('Unlock error:', err);
    return 'error';
  }
}

// 📨 Submit pending evidence from agent or guest
export async function submitEvidence(
  runId: string,
  evidenceId: string,
  submittedBy: 'Self' | 'Assistant'
): Promise<'ok' | 'duplicate' | 'error'> {
  try {
    const ref = doc(db, 'runs', runId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return 'error';

    const data = snap.data() as RunDocument;

    const isCollected = !!data.currentCaseProgress?.collectedEvidence?.[evidenceId];

    const isPending = Array.isArray(data.pendingEvidence)
      ? data.pendingEvidence.some(
          (e: PendingEvidence) => e.evidenceID === evidenceId
        )
      : false;

    if (isCollected || isPending) return 'duplicate';

    const newEntry: PendingEvidence = {
      evidenceID: evidenceId,
      submittedBy,
      status: 'pending',
      submittedAt: Timestamp.now(),
    };

    await updateDoc(ref, {
      pendingEvidence: arrayUnion(newEntry),
    });

    return 'ok';
  } catch (err) {
    console.error('Failed to submit evidence:', err);
    return 'error';
  }
}
