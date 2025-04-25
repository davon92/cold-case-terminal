// /app/case-library/page.tsx
'use client';

import { useState } from 'react';
import EvidenceCard from '@/components/EvidenceCard';

const sampleCases = [
  { id: 'CASE-001', title: 'Subway Strangler', unlocked: true },
  { id: 'CASE-002', title: 'Pinehurst Mystery', unlocked: false },
  { id: 'CASE-003', title: 'The Green Note', unlocked: false },
];

export default function CaseLibraryPage() {
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-black text-black font-mono p-8">
      <div className="bg-[#c0c0c0] border-4 border-[#9f9f9f] shadow-inner max-w-4xl mx-auto p-6">
        <div className="bg-[#e0e0e0] border-b border-[#666] px-3 py-1 font-bold text-xs uppercase tracking-wider">
          Case Library
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
          {sampleCases.map((caseFile) => (
            <button
              key={caseFile.id}
              disabled={!caseFile.unlocked}
              onClick={() => setActiveCaseId(caseFile.id)}
              className={`flex flex-col items-center justify-center p-4 h-32 border text-xs font-bold uppercase tracking-wide
                ${caseFile.unlocked ? 'bg-white text-black hover:bg-[#e0e0e0]' : 'bg-[#999] text-[#666] cursor-not-allowed'}
                border-t-white border-l-white border-b-[#808080] border-r-[#808080]`}>
              <div className="mb-2 text-lg">📁</div>
              {caseFile.title}
            </button>
          ))}
        </div>

        {activeCaseId && (
          <div className="mt-6 bg-white border border-[#666] p-4">
            <h2 className="text-lg font-bold mb-2">Opened Case: {activeCaseId}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <EvidenceCard
                    evidenceId="5"
                    fileName="witness_log.pdf"
                    fileType="Transcript"
                    thumbnailUrl="/evidence/thumb5.jpg"
                    fileDownloadUrl="/evidence/witness_log.pdf"
                  />
                  <EvidenceCard
                    evidenceId="6"
                    thumbnailUrl="/evidence/thumb2.jpg"
                    fileName="surveillance_footage.mp4"
                    fileType="Video"
                    fileDownloadUrl="/evidence/surveillance_footage.mp4"
                  />
                  <EvidenceCard
                    evidenceId="3"
                    thumbnailUrl="/evidence/thumb3.jpg"
                    fileName="transcript.txt"
                    fileType="Notes"
                    fileDownloadUrl="/evidence/transcript.txt"
                  />
          </div>
          </div>
        )}
      </div>
    </main>
  );
}