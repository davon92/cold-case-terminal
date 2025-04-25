import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

// 🔐 Firebase config using env vars
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// ✅ Initialize Firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// ✅ Submit guest evidence (prevents duplicates)
export async function submitGuestEvidence(
    runId: string,
    evidenceId: string,
    accessCode: string
  ): Promise<'ok' | 'duplicate' | 'error'> {
    try {
      const runRef = doc(db, 'runs', runId);
      const snap = await getDoc(runRef);
  
      if (!snap.exists()) return 'error';
  
      const data = snap.data();
      const alreadyCollected = data.currentCaseProgress?.collectedEvidence || [];
      const alreadyPending = data.pendingEvidence || [];
  
      if (alreadyCollected.includes(evidenceId) || alreadyPending.includes(evidenceId)) {
        return 'duplicate';
      }
  
      await updateDoc(runRef, {
        pendingEvidence: arrayUnion(evidenceId),
        guestAccessCode: accessCode // 👈 Required by Firestore security rules
      });
  
      return 'ok';
    } catch (err) {
      console.error('Error submitting evidence:', err);
      return 'error';
    }
  }
  export async function submitAgentEvidence(
    runId: string,
    evidenceId: string
  ): Promise<'ok' | 'duplicate' | 'error'> {
    try {
      const runRef = doc(db, 'runs', runId);
      const snap = await getDoc(runRef);
      if (!snap.exists()) return 'error';
  
      const data = snap.data();
      const pending = data.pendingEvidence || [];
  
      if (pending.includes(evidenceId)) {
        return 'duplicate';
      }
  
      await updateDoc(runRef, {
        pendingEvidence: arrayUnion(evidenceId)
      });
  
      return 'ok';
    } catch (err) {
      console.error('Agent evidence submission failed:', err);
      return 'error';
    }
  }
  
