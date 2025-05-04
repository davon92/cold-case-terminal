// lib/hooks/useUnlockedCases.ts
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function useUnlockedCases(runId: string | null) {
  const [unlockedCases, setUnlockedCases] = useState<string[]>([]);

  useEffect(() => {
    if (!runId) return;

    const docRef = doc(db, 'runs', runId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUnlockedCases(data.unlockedCases || []);
      }
    });

    return () => unsubscribe();
  }, [runId]);

  return unlockedCases;
}
