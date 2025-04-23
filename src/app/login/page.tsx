'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');

    const normalized = code.trim().toUpperCase();
    try {
      if (isGuest) {
        const q = query(collection(db, 'runs'), where('guestAccessCode', '==', normalized));
        const snap = await getDocs(q);

        if (snap.empty) {
          setError('No run found for that guest access code.');
          return;
        }

        const doc = snap.docs[0];
        const runId = doc.id;
        const data = doc.data();

        localStorage.setItem('runId', runId);
        localStorage.setItem('agentName', data.agentName || 'Unknown');
        localStorage.setItem('isGuest', 'true');

        router.push('/case');
      } else {
        const runRef = doc(db, 'runs', normalized);
        const runSnap = await getDoc(runRef);

        if (!runSnap.exists()) {
          setError('Run ID not found.');
          return;
        }

        const data = runSnap.data();

        localStorage.setItem('runId', runSnap.id);
        localStorage.setItem('agentName', data.agentName || 'Unknown');
        localStorage.setItem('isGuest', 'false');

        router.push('/case');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
        setError(err.message || 'Something went wrong.');
      } else {
        console.error(err);
        setError('Something went wrong.');
      }
    }
  };

  return (
    <main className="max-w-md mx-auto mt-20 p-6">
      <div className="terminal-box">
        <h1 className="text-2xl font-bold text-center mb-4">WELCOME TO THE COLD CASE INTERFACE</h1>

        <div className="mb-4">
          <label className="block mb-1 text-sm">ACCESS CODE:</label>
          <input
            type="text"
            placeholder={isGuest ? 'GUEST ACCESS CODE' : 'RUN ID'}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            id="guestToggle"
            checked={isGuest}
            onChange={(e) => setIsGuest(e.target.checked)}
          />
          <label htmlFor="guestToggle" className="text-sm">I AM A GUEST</label>
        </div>

        {error && (
          <div className="text-xs text-red-400 mb-2">{error}</div>
        )}

        <button onClick={handleLogin} className="w-full">
          CONNECT
        </button>
      </div>
    </main>
  );
}
