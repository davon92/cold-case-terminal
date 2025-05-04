'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function LoginPage() {
  const [runId, setRunId] = useState('');
  const [guestCode, setGuestCode] = useState('');
  const [mode, setMode] = useState<'agent' | 'guest'>('agent');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'agent') {
        const docRef = doc(db, 'runs', runId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          localStorage.setItem('runId', runId);
          localStorage.removeItem('guestAccess');
          router.push('/case-library');
        } else {
          setError('Invalid Run ID');
        }
      } else {
        const snapshot = await getDocs(collection(db, 'runs'));
        let found = false;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.guestAccessCode === guestCode) {
            localStorage.setItem('runId', data.runId);
            localStorage.setItem('guestAccess', 'true');
            found = true;
            router.push('/case-library');
          }
        });

        if (!found) {
          setError('Invalid Guest Code');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-96 p-4 bg-gray-200 text-black border border-black shadow-md space-y-4">
        <h1 className="text-lg font-bold border-b border-black pb-1">COLD CASE TERMINAL LOGIN</h1>

        <div className="flex justify-around text-xs">
          <button
            onClick={() => setMode('agent')}
            className={`px-2 py-1 border border-black ${
              mode === 'agent' ? 'bg-white' : 'bg-gray-300'
            }`}
          >
            AGENT LOGIN
          </button>
          <button
            onClick={() => setMode('guest')}
            className={`px-2 py-1 border border-black ${
              mode === 'guest' ? 'bg-white' : 'bg-gray-300'
            }`}
          >
            GUEST ACCESS
          </button>
        </div>

        {mode === 'agent' ? (
          <div className="space-y-2">
            <label className="text-xs font-bold">RUN ID</label>
            <input
              type="password"
              value={runId}
              onChange={(e) => setRunId(e.target.value)}
              className="w-full p-1 border border-black bg-white text-black"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-bold">GUEST ACCESS CODE</label>
            <input
              type="password"
              value={guestCode}
              onChange={(e) => setGuestCode(e.target.value)}
              className="w-full p-1 border border-black bg-white text-black"
            />
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-2 border border-black bg-gray-300 hover:bg-gray-200 p-1 text-xs"
        >
          {loading ? 'CONNECTING...' : 'CONNECT'}
        </button>

        {error && <p className="text-red-600 text-xs">{error}</p>}
      </div>
    </div>
  );
}
