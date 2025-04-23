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

      if (charIndex < currentLine.length) {
        setCurrentTypedLine((prev) => prev + currentLine.charAt(charIndex));
        charIndex++;
        typingTimeout = setTimeout(typeLine, 40); // character speed
      } else {
        setLinesShown((prev) => [...prev, currentLine]);
        setCurrentTypedLine('');
        charIndex = 0;
        lineIndex++;

        if (lineIndex < bootLines.length) {
          lineTimeout = setTimeout(typeLine, 500); // pause before next line
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
    <main className="h-screen bg-black flex items-center justify-center p-6 font-mono text-sm text-black">
      <div className="bg-[#c0c0c0] border-4 border-[#9f9f9f] shadow-inner w-full max-w-xl p-4">
        <div className="bg-[#e0e0e0] border-b-2 border-[#666] px-2 py-1 font-bold text-xs uppercase tracking-wider">
          BOOT TERMINAL
        </div>

        <div className="bg-white border border-[#999] p-3 min-h-[200px] space-y-1">
          {linesShown.map((line, idx) => (
            <p key={idx} className="text-black">{line}</p>
          ))}
          {currentTypedLine && (
            <p className="text-black blinking-cursor">{currentTypedLine}</p>
          )}
        </div>

        {bootComplete && (
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/')}
              className="bg-[#d9d9d9] border border-[#777] px-6 py-2 text-xs font-bold hover:bg-[#e5e5e5] shadow"
            >
              CONNECT
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
