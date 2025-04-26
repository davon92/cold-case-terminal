// Top: setup
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';


// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Types
type PendingEvidenceEntry = {
  evidenceID: string;
  submittedBy: "Self" | "Assistant";
  submittedAt: Timestamp;
  status: "pending";
};

// Guest evidence submission
export async function submitGuestEvidence(runId: string, evidenceId: string, accessCode: string) {
  try {
    const runRef = doc(db, 'runs', runId);
    const snap = await getDoc(runRef);
    if (!snap.exists()) return 'error';

    const data = snap.data();
    const alreadyCollected: string[] = data.currentCaseProgress?.collectedEvidence || [];
    const alreadyPending: string[] = (data.pendingEvidence as PendingEvidenceEntry[] || []).map(e => e.evidenceID);

    if (alreadyCollected.includes(evidenceId) || alreadyPending.includes(evidenceId)) {
      return 'duplicate';
    }

    const evidenceEntry: PendingEvidenceEntry = {
      evidenceID: evidenceId,
      submittedBy: "Assistant",
      submittedAt: Timestamp.now(), // ✅ Correct way to set inside arrayUnion
      status: "pending"
    };

    await updateDoc(runRef, {
      pendingEvidence: arrayUnion(evidenceEntry),
      guestAccessCode: accessCode, // still needed for Firestore security match
      lastUpdatedAt: serverTimestamp() // ✅ optional: tracks server time for last write
    });

    return 'ok';
  } catch (err) {
    console.error('🔥 Guest submission failed:', err);
    return 'error';
  }
}

// Agent evidence submission
export async function submitAgentEvidence(runId: string, evidenceId: string): Promise<'ok' | 'duplicate' | 'error'> {
  try {
    const runRef = doc(db, 'runs', runId);
    const snap = await getDoc(runRef);
    if (!snap.exists()) return 'error';

    const data = snap.data();
    const alreadyPending: string[] = (data.pendingEvidence as PendingEvidenceEntry[] || []).map(e => e.evidenceID);

    if (alreadyPending.includes(evidenceId)) {
      return 'duplicate';
    }

    const evidenceEntry: PendingEvidenceEntry = {
      evidenceID: evidenceId,
      submittedBy: "Self",
      submittedAt: Timestamp.now(), // ✅ Same correction here
      status: "pending"
    };

    await updateDoc(runRef, {
      pendingEvidence: arrayUnion(evidenceEntry),
      lastUpdatedAt: serverTimestamp() // ✅ optional, useful
    });

    return 'ok';
  } catch (err) {
    console.error('🔥 Agent submission failed:', err);
    return 'error';
  }
}
