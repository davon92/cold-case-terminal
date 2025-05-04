import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useUnlockedEvidence(runId: string | null): string[] {
  const [unlockedEvidence, setUnlockedEvidence] = useState<string[]>([]);

  useEffect(() => {
    if (!runId) return;

    const runRef = doc(db, 'runs', runId);
    const unsubscribe = onSnapshot(runRef, (snapshot) => {
      const data = snapshot.data();
      if (data && Array.isArray(data.unlockedEvidence)) {
        setUnlockedEvidence(data.unlockedEvidence);
      }
    });

    return () => unsubscribe();
  }, [runId]);

  return unlockedEvidence;
}
