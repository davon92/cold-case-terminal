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
        typingTimeout = setTimeout(typeLine, 40); // Speed per character
      } else {
        // Lock the line and move to the next after a pause
        setLinesShown((prev) => [...prev, currentLine]);
        setCurrentTypedLine('');
        charIndex = 0;
        lineIndex++;

        if (lineIndex < bootLines.length) {
          lineTimeout = setTimeout(typeLine, 500); // Pause before next line
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
    <main className="h-screen bg-black text-green-500 font-mono p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl border border-green-600 p-4 bg-[#111] shadow-lg terminal-box">
        {linesShown.map((line, index) => (
          <p key={index} className="text-sm">{line}</p>
        ))}

        {/* Current typing line with blinking cursor */}
        {currentTypedLine && (
          <p className="text-sm blinking-cursor">{currentTypedLine}</p>
        )}

        {/* Final Connect Button */}
        {bootComplete && (
          <div className="mt-6 text-center">
            <button
              className="px-6 py-2 bg-green-700 hover:bg-green-600 text-black font-bold border-2 border-green-300"
              onClick={() => router.push('/')}
            >
              CONNECT
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
