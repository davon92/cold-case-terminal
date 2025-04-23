'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

type CaseProgress = {
  caseId: string;
  collectedEvidence?: string[];
};

type RunData = {
  agentName: string;
  gameMode: string;
  guestAccessCode: string;
  totalFails: number;
  expired: boolean;
  submittedCases: string[];
  currentCaseProgress?: CaseProgress;
  pendingEvidence: string[];
};

export default function CasePage() {
  const [runId, setRunId] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [runData, setRunData] = useState<RunData | null>(null);
  const [evidenceId, setEvidenceId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedRunId = localStorage.getItem('runId');
    const storedAgentName = localStorage.getItem('agentName');
    const guest = localStorage.getItem('isGuest') === 'true';

    if (!storedRunId) {
      setMessage('No run session found.');
      return;
    }

    setRunId(storedRunId);
    setAgentName(storedAgentName);
    setIsGuest(guest);

    const runRef = doc(db, 'runs', storedRunId);
    getDoc(runRef).then((snap) => {
      if (snap.exists()) {
        setRunData(snap.data() as RunData);
      } else {
        setMessage('Run not found.');
      }
    });
  }, []);

  const handleSubmitEvidence = async () => {
    if (!runId || !evidenceId.trim()) return;

    const runRef = doc(db, 'runs', runId);

    try {
      await updateDoc(runRef, {
        pendingEvidence: arrayUnion(evidenceId.toUpperCase())
      });

      setMessage(`✅ Evidence "${evidenceId}" submitted.`);
      setEvidenceId('');
    } catch (error) {
      console.error(error);
      setMessage('❌ Error submitting evidence.');
    }
  };

  return (
    <main className="max-w-2xl mx-auto mt-12 p-6">
      <h1 className="text-3xl font-bold text-center mb-4">CASE ACCESS TERMINAL</h1>

      {message && <div className="text-sm text-center text-yellow-300">{message}</div>}

      {runData && (
        <div className="terminal-box">
          <div><strong>AGENT:</strong> {agentName}</div>
          <div><strong>RUN ID:</strong> {runId}</div>
          <div><strong>MODE:</strong> {runData.gameMode}</div>
          {runData.currentCaseProgress && (
            <div>
              <strong>CURRENT CASE:</strong> {runData.currentCaseProgress.caseId}
            </div>
          )}

          {isGuest && (
            <>
              <hr className="my-4 border-green-600" />
              <div>
                <label className="block mb-1">SUBMIT EVIDENCE CODE:</label>
                <input
                  type="text"
                  placeholder="EVIDENCE ID (e.g. 7)"
                  value={evidenceId}
                  onChange={(e) => setEvidenceId(e.target.value)}
                  className="w-full mb-2"
                />
                <button onClick={handleSubmitEvidence}>SUBMIT</button>
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}