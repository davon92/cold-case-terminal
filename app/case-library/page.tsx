'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import EvidenceCard from '@/components/EvidenceCard';

type EvidenceData = {
  fileName: string;
  fileType: string;
  thumbnailUrl: string;
  fileDownloadUrl: string;
  code?: string;
};

type CaseData = {
  title: string;
  evidence: Record<string, EvidenceData>;
};

export default function CaseLibraryPage() {
  const [cases, setCases] = useState<Record<string, CaseData>>({});
  const [unlockedCases, setUnlockedCases] = useState<string[]>([]);
  const [unlockedEvidence, setUnlockedEvidence] = useState<string[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  const runId =
    typeof window !== 'undefined' ? localStorage.getItem('runId') : null;

  // 🔄 Fetch all case metadata and unlocked state
  useEffect(() => {
    async function fetchData() {
      const caseSnapshot = await getDocs(collection(db, 'cases'));
      const newCases: Record<string, CaseData> = {};

      for (const caseDoc of caseSnapshot.docs) {
        const caseId = caseDoc.id;
        const caseData = caseDoc.data() as CaseData;
        newCases[caseId] = {
          title: caseData.title,
          evidence: caseData.evidence,
        };
      }

      setCases(newCases);

      if (runId) {
        const runDoc = await getDoc(doc(db, 'runs', runId));
        if (runDoc.exists()) {
          const data = runDoc.data();
          setUnlockedCases(data.unlockedCases || []);
          setUnlockedEvidence(data.unlockedEvidence || []);
        }
      }
    }

    fetchData();
  }, [runId]);

  // 🔁 Manual refresh for unlocked evidence (from modal unlocks)
  const handleRefreshEvidence = async () => {
    if (!runId) return;
    const runDoc = await getDoc(doc(db, 'runs', runId));
    if (runDoc.exists()) {
      const data = runDoc.data();
      setUnlockedEvidence(data.unlockedEvidence || []);
    }
  };

  // 🎯 Only show cases that are unlocked
  const visibleCases = Object.entries(cases).filter(([caseId]) =>
    unlockedCases.includes(caseId)
  );

  return (
    <main className="min-h-screen bg-black text-black font-mono p-8">
      <div className="bg-[#c0c0c0] border-4 border-[#9f9f9f] shadow-inner max-w-4xl mx-auto p-6">
        <div className="bg-[#e0e0e0] border-b border-[#666] px-3 py-1 font-bold text-xs uppercase tracking-wider">
          Case Library
        </div>

        {/* 📁 Case Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
          {visibleCases.map(([caseId, caseData]) => (
            <button
              key={caseId}
              onClick={() => setActiveCaseId(caseId)}
              className="flex flex-col items-center justify-center p-4 h-32 border text-xs font-bold uppercase tracking-wide bg-white text-black hover:bg-[#e0e0e0] border-t-white border-l-white border-b-[#808080] border-r-[#808080]"
            >
              <div className="mb-2 text-lg">📁</div>
              {caseData.title}
            </button>
          ))}
        </div>

        {/* 🔍 Evidence Grid */}
        {activeCaseId && cases[activeCaseId] && (
          <div className="mt-6 bg-white border border-[#666] p-4">
            <h2 className="text-lg font-bold mb-2">
              Opened Case: {cases[activeCaseId].title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {Object.entries(cases[activeCaseId].evidence).map(
                ([evidenceId, evidenceData]) => {
                  const isUnlocked =
                    !evidenceData.code || unlockedEvidence.includes(evidenceId);

                  return (
                    <EvidenceCard
                      key={evidenceId}
                      caseId={activeCaseId}
                      evidenceId={evidenceId}
                      evidenceData={evidenceData}
                      isUnlocked={isUnlocked}
                      onUnlock={handleRefreshEvidence}
                    />
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
