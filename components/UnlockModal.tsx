'use client';

import { useState } from 'react';
import { unlockEvidenceForRun } from '@/lib/firebase';

export default function UnlockModal({
  runId,
  onClose,
}: {
  runId: string;
  onClose: () => void;
}) {
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async () => {
    if (!code.trim()) {
      setFeedback('❌ Enter a code.');
      return;
    }

    const result = await unlockEvidenceForRun(runId, code.trim());

    switch (result) {
      case 'ok':
        setFeedback('✅ Evidence unlocked!');
        break;
      case 'alreadyUnlocked':
        setFeedback('⚠️ Already unlocked.');
        break;
      case 'invalidCode':
        setFeedback('❌ Invalid code.');
        break;
      default:
        setFeedback('❌ An error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-200 border border-black p-4 w-80 space-y-3 text-xs text-black relative">
        <button
          onClick={onClose}
          className="absolute top-1 right-1 border border-black px-2 bg-white text-xs"
        >
          ✖
        </button>

        <h2 className="text-sm font-bold mb-2">UNLOCK ARCHIVE</h2>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-1 border border-black bg-white"
          placeholder="Enter unlock code"
        />

        <button
          onClick={handleSubmit}
          className="w-full border border-black bg-gray-300 hover:bg-gray-200 p-1"
        >
          SUBMIT
        </button>

        {feedback && <p className="text-xs text-center mt-1">{feedback}</p>}
      </div>
    </div>
  );
}
