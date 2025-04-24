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
      setError('Something went wrong.');
      console.error(err);
    }
  };

  return (
    <main className="h-screen bg-black flex items-center justify-center p-6 font-mono text-sm text-black">
      <div className="bg-[#c0c0c0] border-4 border-[#9f9f9f] shadow-inner w-full max-w-2xl p-8">
        <div className="bg-[#e0e0e0] border-b-2 border-[#666] px-2 py-1 font-bold text-xs uppercase tracking-wider">
          LOGIN TERMINAL
        </div>

        <div className="bg-[#c0c0c0] border border-[#999] p-4 space-y-4">
          <label className="block text-xs font-bold mb-1">
            {isGuest ? 'Guest Access Code:' : 'Agent Run ID:'}
          </label>

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 text-sm font-mono bg-white text-black caret-black border border-[#808080] shadow-[inset_1px_1px_0px_#fff,inset_-1px_-1px_0px_#000] outline-none"
          />

          <div className="flex items-center gap-2 text-xs pt-1">
            <input
              type="checkbox"
              checked={isGuest}
              id="guestCheck"
              onChange={(e) => setIsGuest(e.target.checked)}
              className="accent-[#000] w-4 h-4 border border-[#000] bg-white shadow-[inset_1px_1px_0px_#fff,inset_-1px_-1px_0px_#000]"
            />
            <label htmlFor="guestCheck">Log in as guest</label>
          </div>

          {error && (
            <div className="text-red-700 text-xs mt-1 font-semibold">
              {error}
            </div>
          )}

          <div className="text-center pt-2">
            <button onClick={handleLogin} className="win95-button">
              CONNECT
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
