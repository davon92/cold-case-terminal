'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const bootLines = [
  'SYSTEM BOOTING...',
  'LOADING MODULES...',
  'CHECKING FIREBASE LINK...',
  'INITIATING LINK...',
  'VERIFYING ACCESS...',
  'DECRYPTING CASE FILES...',
  'ACCESS CHANNEL OPENED'
];

export default function LandingPage() {
  const router = useRouter();
  const [linesShown, setLinesShown] = useState<string[]>([]);
  const [currentTypedLine, setCurrentTypedLine] = useState('');
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    let lineIndex = 0;
    let charIndex = 0;
    let typingTimeout: NodeJS.Timeout;
    let lineTimeout: NodeJS.Timeout;

    const typeLine = () => {
      const currentLine = bootLines[lineIndex];
      if (charIndex <= currentLine.length) {
        setCurrentTypedLine(currentLine.slice(0, charIndex));
        charIndex++;
        typingTimeout = setTimeout(typeLine, 25); 
      } else {
        setLinesShown((prev) => [...prev, currentLine]);
        setCurrentTypedLine('');
        charIndex = 0;
        lineIndex++;
        if (lineIndex < bootLines.length) {
          lineTimeout = setTimeout(typeLine, 250);
        } else {
          setTimeout(() => setBootComplete(true), 600);
        }
      }
    };

    typeLine();
    return () => {
      clearTimeout(typingTimeout);
      clearTimeout(lineTimeout);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 font-mono text-sm text-black">
    <div className="bg-[#c0c0c0] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] shadow-[2px_2px_0_#000] max-w-2xl w-full p-4">
      <div className="bg-[#e0e0e0] border-b border-[#666] px-2 py-1 font-bold text-xs uppercase tracking-wider">
        BOOT TERMINAL
      </div>
  
      <div className="bg-white border border-[#999] p-4 min-h-[200px] space-y-1 text-black">
        {linesShown.map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
        <p className="min-h-[1.5rem] w-full block">
          {currentTypedLine}{'\u00A0'}
        </p>
      </div>
  
      {bootComplete && (
        <div className="mt-4 text-center">
          <button onClick={() => router.push('/login')} className="win95-button">
            CONNECT
          </button>
        </div>
      )}
    </div>
  </main>
  );
}
