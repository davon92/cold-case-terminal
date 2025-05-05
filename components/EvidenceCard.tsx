'use client';

import React from 'react';
import Image from 'next/image';
import { EvidenceData } from '@/lib/types';

type Props = {
  evidenceId: string;
  data: EvidenceData;
  unlocked: boolean;
  collected: boolean;
  onUnlockClick?: () => void;
  onSubmitClick?: () => void;
};

export default function EvidenceCard({
  evidenceId,
  data,
  unlocked,
  collected,
  onUnlockClick,
  onSubmitClick,
}: Props) {
  const isLocked = !unlocked && !collected;

  return (
    <div
      className={`border border-black bg-gray-200 p-4 w-full ${
        isLocked ? 'opacity-50 grayscale blur-sm cursor-not-allowed' : ''
      }`}
    >
      <div className="w-full h-40 relative">
        <Image
          src={data.thumbnailUrl}
          alt={isLocked ? 'Locked Evidence' : data.fileName}
          layout="fill"
          objectFit="cover"
          className={isLocked ? 'blur-sm' : ''}
        />
      </div>

      <h3 className="mt-2 text-sm font-bold">
        {isLocked ? 'Evidence Locked' : data.fileName}
      </h3>

      {!isLocked && (
        <div className="mt-2 flex gap-2">
          <a
            href={data.fileDownloadUrl}
            download
            className="bg-white border border-black px-2 py-1 text-xs"
          >
            Download
          </a>
          {unlocked && (
            <button
              onClick={onSubmitClick}
              className="bg-blue-100 border border-black px-2 py-1 text-xs"
            >
              Submit
            </button>
          )}
        </div>
      )}
    </div>
  );
}
