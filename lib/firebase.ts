// lib/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// ✅ Firebase config from .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// ✅ Correct order: initialize first
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Type for evidence entries
type PendingEvidenceEntry = {
  evidenceID: string;
  submittedBy: 'Self' | 'Assistant';
  submittedAt: Timestamp;
  status: 'pending';
};

// ✅ Guest submission
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
      submittedBy: 'Assistant',
      submittedAt: Timestamp.now(),
      status: 'pending',
    };

    await updateDoc(runRef, {
      pendingEvidence: arrayUnion(evidenceEntry),
      guestAccessCode: accessCode,
      lastUpdatedAt: serverTimestamp(),
    });

    return 'ok';
  } catch (err) {
    console.error('🔥 Guest submission failed:', err);
    return 'error';
  }
}

// ✅ Agent submission
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
      submittedBy: 'Self',
      submittedAt: Timestamp.now(),
      status: 'pending',
    };

    await updateDoc(runRef, {
      pendingEvidence: arrayUnion(evidenceEntry),
      lastUpdatedAt: serverTimestamp(),
    });

    return 'ok';
  } catch (err) {
    console.error('🔥 Agent submission failed:', err);
    return 'error';
  }
}

// ✅ Evidence unlock via passcode
export async function unlockEvidenceForRun(runId: string, passcode: string): Promise<'ok' | 'alreadyUnlocked' | 'invalidCode' | 'error'> {
  try {
    const runRef = doc(db, 'runs', runId);
    const snap = await getDoc(runRef);
    if (!snap.exists()) return 'error';

    const codeToEvidence: Record<string, string> = {
      'ARX-29B': 'secret-evidence-5',
      'ZETA-314': 'audio-decrypt-4',
    };

    const evidenceId = codeToEvidence[passcode.trim().toUpperCase()];
    if (!evidenceId) return 'invalidCode';

    const data = snap.data();
    const unlocked: string[] = data.unlockedEvidence || [];

    if (unlocked.includes(evidenceId)) return 'alreadyUnlocked';

    await updateDoc(runRef, {
      unlockedEvidence: arrayUnion(evidenceId),
    });

    return 'ok';
  } catch (err) {
    console.error('❌ Unlock evidence failed:', err);
    return 'error';
  }
}

// ✅ Media asset URL fetch
export async function fetchEvidenceMediaUrls(caseId: string, evidenceId: string, fileType: string) {
  try {
    const basePath = `cases/${caseId}`;
    const thumbRef = ref(storage, `${basePath}/thumb${evidenceId}.jpg`);
    const fileRef = ref(storage, `${basePath}/file${evidenceId}.${fileType.toLowerCase()}`);

    const [thumbnailUrl, fileDownloadUrl] = await Promise.all([
      getDownloadURL(thumbRef),
      getDownloadURL(fileRef),
    ]);

    return { thumbnailUrl, fileDownloadUrl };
  } catch (err) {
    console.warn(`⚠️ Failed to load media for evidence ${evidenceId} in ${caseId}`, err);
    return {
      thumbnailUrl: '',
      fileDownloadUrl: '',
    };
  }
}
