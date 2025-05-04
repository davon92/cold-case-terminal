'use client';

import Image from 'next/image';
import { EvidenceData } from '@/lib/types';

export default function EvidenceCard({
  data,
  evidenceId,
  unlocked,
  onUnlockClick,
  onSubmitClick,
}: {
  data: EvidenceData;
  evidenceId: string;
  unlocked: boolean;
  onUnlockClick: (evidenceId: string) => void;
  onSubmitClick: (evidenceId: string) => Promise<void>;
}) {
  const isLocked = !!data.unlockCode && !unlocked;

  return (
    <div className="w-full bg-white border border-black shadow-md p-2 text-xs space-y-2">
      <div className="relative w-full h-40 border border-black overflow-hidden">
        <Image
          src={data.thumbnailUrl}
          alt={data.fileName}
          fill
          className={`object-cover ${isLocked ? 'blur-sm grayscale' : ''}`}
        />
      </div>

      {isLocked ? (
        <button
          onClick={() => onUnlockClick(evidenceId)}
          className="w-full border border-black text-xs p-1 bg-yellow-200 hover:bg-yellow-300"
        >
          UNLOCK
        </button>
      ) : (
        <>
          <a
            href={data.fileDownloadUrl}
            download
            className="block w-full text-center border border-black text-xs p-1 bg-gray-300 hover:bg-gray-200"
          >
            DOWNLOAD
          </a>

          <button
            onClick={() => onSubmitClick(evidenceId)}
            className="w-full border border-black text-xs p-1 bg-gray-300 hover:bg-gray-200"
          >
            SUBMIT
          </button>
        </>
      )}
    </div>
  );
}
