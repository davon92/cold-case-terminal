'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();

  const [code, setCode] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (code.trim() === '') {
      setError('Please enter a valid code.');
      return;
    }

    try {
      if (isGuest) {
        // Look up guest access code across all runs
        const allRuns = await getDocs(collection(db, 'runs'));
        let matchingRunId = null;

        allRuns.forEach((doc) => {
          const data = doc.data();
          if (data.guestAccessCode === code.trim()) {
            matchingRunId = doc.id;
          }
        });

        if (matchingRunId) {
          localStorage.setItem('runId', matchingRunId);
          localStorage.setItem('isGuest', 'true');
          localStorage.setItem('guestAccessCode', code.trim());
          router.push('/case-library');
        } else {
          setError('Incorrect guest access code.');
        }
      } else {
        // Agent login using code as runId
        const ref = doc(db, 'runs', code.trim());
        const snap = await getDoc(ref);

        if (snap.exists()) {
          localStorage.setItem('runId', code.trim());
          localStorage.setItem('isGuest', 'false');
          router.push('/case-library');
        } else {
          setError('Invalid Run ID.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <main className="h-screen bg-black flex items-center justify-center p-6 font-mono text-sm text-black">
      <div className="bg-[#c0c0c0] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] shadow-[2px_2px_0_#000] w-full max-w-md p-4">
        <div className="bg-[#e0e0e0] border-b border-[#666] px-2 py-1 font-bold text-xs uppercase tracking-wider">
          LOGIN TERMINAL
        </div>

        <div className="bg-[#c0c0c0] border border-[#999] p-4 space-y-4">
          <label className="block text-xs font-bold mb-1">
            {isGuest ? 'Guest Access Code:' : 'Agent Run ID:'}
          </label>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-2 pr-10 text-sm font-mono bg-white text-black caret-black border border-[#808080] shadow-[inset_1px_1px_0px_#fff,inset_-1px_-1px_0px_#000]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-black"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs pt-1">
            <input
              type="checkbox"
              checked={isGuest}
              id="guestCheck"
              onChange={(e) => setIsGuest(e.target.checked)}
              className="w-4 h-4 appearance-none bg-white border border-black checked:bg-white checked:border-black checked:[background-image:url('data:image/svg+xml,%3Csvg%20width%3D%2210%22%20height%3D%2210%22%20viewBox%3D%220%200%2010%2010%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%205l2%202l5-5%22%20stroke%3D%22black%22%20stroke-width%3D%222%22%20fill%3D%22none%22/%3E%3C/svg%3E')] bg-no-repeat bg-center shadow-[inset_1px_1px_0px_#fff,inset_-1px_-1px_0px_#000]"
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
