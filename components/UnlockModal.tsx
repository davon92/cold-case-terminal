'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';

type UnlockModalProps = {
  caseId: string;
  evidenceId: string;
  onClose: () => void;
  onUnlock: () => void;
};

export default function UnlockModal({
  caseId,
  evidenceId,
  onClose,
  onUnlock,
}: UnlockModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const runId = localStorage.getItem('runId');
      if (!runId) {
        setError('No run ID found.');
        setLoading(false);
        return;
      }

      const caseRef = doc(collection(db, 'cases'), caseId);
      const caseSnap = await getDoc(caseRef);
      if (!caseSnap.exists()) {
        setError('Case not found.');
        setLoading(false);
        return;
      }

      const data = caseSnap.data();
      const ev = data.caseEvidence?.[evidenceId]; // ✅ fixed access path

      if (!ev || typeof ev.code !== 'string') {
        setError('Evidence not found or no code required.');
        setLoading(false);
        return;
      }

      if (ev.code.trim().toLowerCase() !== code.trim().toLowerCase()) {
        setError('Incorrect passcode.');
        setLoading(false);
        return;
      }

      const runRef = doc(collection(db, 'runs'), runId);
      await updateDoc(runRef, {
        unlockedEvidence: arrayUnion(evidenceId),
      });

      onUnlock(); // Refresh local state
      onClose(); // Close modal
    } catch (err) {
      console.error('Error unlocking evidence:', err);
      setError('An error occurred. Try again.');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-[#c0c0c0] p-6 border-4 border-[#808080] shadow-md max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">Enter Passcode</h2>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full mb-3 px-2 py-1 border border-black bg-white text-black text-sm"
        />
        {error && <p className="text-red-700 text-xs mb-2">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="win95-button bg-white border text-xs px-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="win95-button bg-white border text-xs px-2"
          >
            {loading ? 'Checking...' : 'Unlock'}
          </button>
        </div>
      </div>
    </div>
  );
}
