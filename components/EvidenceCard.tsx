'use client';

import { useState } from 'react';
import UnlockModal from './UnlockModal';
import { submitGuestEvidence, submitAgentEvidence } from '@/lib/firebase';

type EvidenceCardProps = {
  caseId: string;
  evidenceId: string;
  evidenceData: {
    fileName: string;
    fileType: string;
    thumbnailUrl: string;
    fileDownloadUrl: string;
    code?: string; // Optional: if present, this item is locked
  };
  isUnlocked: boolean;
  onUnlock: () => void;
};

export default function EvidenceCard({
  caseId,
  evidenceId,
  evidenceData,
  isUnlocked,
  onUnlock,
}: EvidenceCardProps) {
  const [showUnlock, setShowUnlock] = useState(false);

  const isGuest =
    typeof window !== 'undefined' && localStorage.getItem('isGuest') === 'true';
  const accessCode = localStorage.getItem('guestAccessCode');

  const handleSubmit = async () => {
    const runId = localStorage.getItem('runId');
    if (!runId) return alert('Run ID not found. Please log in.');

    let result: 'ok' | 'duplicate' | 'error' = 'error';

    if (isGuest && accessCode) {
      result = await submitGuestEvidence(runId, evidenceId, accessCode);
    } else {
      result = await submitAgentEvidence(runId, evidenceId);
    }

    if (result === 'ok') {
      alert('Evidence submitted successfully!');
    } else if (result === 'duplicate') {
      alert('This evidence has already been submitted.');
    } else {
      alert('Something went wrong. Try again.');
    }
  };

  const handleClickLocked = () => {
    setShowUnlock(true);
  };

  return (
    <div className="bg-white relative border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#000] p-3 w-full max-w-xs">
      {/* Locked Overlay */}
      {!isUnlocked && (
        <div
          className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white font-bold text-sm z-10 cursor-pointer"
          onClick={handleClickLocked}
        >
          🔒 Locked — Enter Code
        </div>
      )}

      <img
        src={evidenceData.thumbnailUrl}
        alt={`${evidenceData.fileName} thumbnail`}
        className="w-full h-32 object-cover mb-2 border border-[#999]"
      />
      <div className="text-xs font-bold mb-1">{evidenceData.fileName}</div>
      <div className="text-[10px] mb-2">Type: {evidenceData.fileType}</div>

      {isUnlocked && (
        <div className="flex justify-between gap-2">
          <a
            href={evidenceData.fileDownloadUrl}
            download
            className="win95-button text-[10px] px-2"
          >
            Download
          </a>
          <button
            onClick={handleSubmit}
            className="win95-button text-[10px] px-2"
          >
            Submit
          </button>
        </div>
      )}

      {/* Unlock Modal */}
      {showUnlock && (
        <UnlockModal
          caseId={caseId}
          evidenceId={evidenceId}
          onClose={() => setShowUnlock(false)}
          onUnlock={() => {
            onUnlock(); // will refresh parent state
            setShowUnlock(false);
          }}
        />
      )}
    </div>
  );
}
