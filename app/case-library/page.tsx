'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/hooks/useSession';
import { useUnlockedCases } from '@/lib/hooks/useUnlockedCases';
import { useUnlockedEvidence } from '@/lib/hooks/useUnlockedEvidence';
import UnlockModal from '@/components/UnlockModal';
import EvidenceCard from '@/components/EvidenceCard';
import { submitEvidence } from '@/lib/firebase';
import { EvidenceData } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CaseLibraryPage() {
  const session = useSession();

  // Always call hooks with fallback value
  const runId = session?.runId ?? '';
  const unlockedCases = useUnlockedCases(runId);
  const unlockedEvidence = useUnlockedEvidence(runId);
  const submittedBy = session?.isGuest ? 'Assistant' : 'Self';

  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<Record<string, EvidenceData>>({});
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    const loadCaseData = async () => {
      if (!selectedCase) return;
      const caseRef = doc(db, 'cases', selectedCase);
      const caseSnap = await getDoc(caseRef);
      const rawData = caseSnap.data();
  
      const rawEvidence = (rawData?.evidence ?? {}) as Record<string, unknown>;
      const normalizedEvidence: Record<string, EvidenceData> = {};
  
      for (const [key, value] of Object.entries(rawEvidence)) {
        if (
          typeof value === 'object' &&
          value !== null &&
          'fileName' in value &&
          'fileType' in value &&
          'thumbnailUrl' in value
        ) {
          normalizedEvidence[String(key)] = value as EvidenceData;
        }
      }
      console.log('Normalized Evidence Keys:', Object.keys(normalizedEvidence));
      setCaseData(normalizedEvidence);
    };
  
    loadCaseData();
  }, [selectedCase]);

  if (!session) return <div>Loading...</div>;

  const handleSubmitEvidence = async (evidenceId: string) => {
    const result = await submitEvidence(runId, evidenceId, submittedBy);
    if (result === 'ok') {
      alert('✅ Evidence submitted!');
    } else if (result === 'duplicate') {
      alert('⚠️ Already submitted!');
    } else {
      alert('❌ Failed to submit evidence.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-2 font-bold text-lg">CASE LIBRARY</h2>
      <div className="flex gap-4">
        {unlockedCases.map((caseId) => (
          <button
            key={caseId}
            className="bg-gray-300 border border-black p-4"
            onClick={() => setSelectedCase(caseId)}
          >
            {caseId === '001' ? 'The Lake Side Murder' : `Case ${caseId}`}
          </button>
        ))}
      </div>

      {selectedCase && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {Object.entries(caseData).map(([evidenceId, data]) => (
              <EvidenceCard
              key={evidenceId}
              evidenceId={evidenceId}
              data={data}
              unlocked={unlockedEvidence.includes(evidenceId)}
              collected={session.collectedEvidence.includes(evidenceId)}
              onUnlockClick={() => setShowUnlockModal(true)}
              onSubmitClick={() => handleSubmitEvidence(evidenceId)}
            />
        
          ))}
        </div>
      )}

      {showUnlockModal && (
        <UnlockModal runId={runId} onClose={() => setShowUnlockModal(false)} />
      )}
    </div>
  );
}
