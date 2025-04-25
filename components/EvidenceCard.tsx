'use client';
import { submitGuestEvidence } from '@/lib/firebase';
import { submitAgentEvidence } from '@/lib/firebase';
type EvidenceCardProps = {
  evidenceId: string;
  thumbnailUrl: string;
  fileName: string;
  fileType: string;
  fileDownloadUrl: string;
};

export default function EvidenceCard({
  evidenceId,
  thumbnailUrl,
  fileName,
  fileType,
  fileDownloadUrl,
}: EvidenceCardProps) {
  const isGuest = typeof window !== 'undefined' && localStorage.getItem('isGuest') === 'true';
  const accessCode = localStorage.getItem('guestAccessCode');
  
  const handleSubmit = async () => {
    const runId = localStorage.getItem('runId');
    if (!runId) return alert('Run ID not found. Please log in.');
  
    console.log('Submitting evidence:', { runId, evidenceId, isGuest, accessCode });

    let result: 'ok' | 'duplicate' | 'error' = 'error';

    if (isGuest && accessCode) {
      result = await submitGuestEvidence(runId, evidenceId, accessCode);
    } else {
      result = await submitAgentEvidence(runId, evidenceId);
    }

    console.log('Firebase submission result:', result);
  
    if (result === 'ok') {
      alert('Evidence submitted successfully!');
    } else if (result === 'duplicate') {
      alert('This evidence has already been submitted.');
    } else {
      alert('Something went wrong. Try again.');
    }
  };

  return (
    <div className="bg-white border border-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#000] p-3 w-full max-w-xs">
      <img
        src={thumbnailUrl}
        alt={`${fileName} thumbnail`}
        className="w-full h-32 object-cover mb-2 border border-[#999]"
      />
      <div className="text-xs font-bold mb-1">{fileName}</div>
      <div className="text-[10px] mb-2">Type: {fileType}</div>
      <div className="flex justify-between gap-2">
        <a href={fileDownloadUrl} download className="win95-button text-[10px] px-2">
          Download
        </a>
        <button onClick={handleSubmit} className="win95-button text-[10px] px-2">
          Submit
        </button>
      </div>
    </div>
  );
}
