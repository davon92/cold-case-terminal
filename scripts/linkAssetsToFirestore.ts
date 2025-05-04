// scripts/linkAssetsToFirestore.ts

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as caseManifest from './caseManifest.json';

// Load env file
dotenv.config({ path: path.resolve(__dirname, './.env') });

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('❌ Missing GOOGLE_APPLICATION_CREDENTIALS in scripts/.env');
  process.exit(1);
}

// Initialize Firebase Admin using service account file
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = getFirestore();
const bucket = getStorage().bucket('coldcasesync.firebasestorage.app');

// 📁 Expected structure: evidence/CASE_ID/EVIDENCE_ID/filename.ext
async function linkAllAssets() {
  const [files] = await bucket.getFiles({ prefix: 'evidence/' });

  for (const file of files) {
    const match = file.name.match(/^evidence\/([^/]+)\/([^/]+)\/(.+\.(jpg|png|mp3|mp4|pdf|txt))$/);
    if (!match) continue;

    const [, caseId, evidenceId, fileName] = match;
    const ext = fileName.split('.').pop() || 'file';
    const type = getTypeFromExtension(ext);

    const mainFileUrl = (await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2030',
    }))[0];

    // Default thumbnail is blank
    let thumbnailUrl = '';

    // Try to find thumbnail.jpg in the same folder
    const thumbnailFilePath = `evidence/${caseId}/${evidenceId}/thumbnail.jpg`;
    const thumbnailFile = files.find(f => f.name === thumbnailFilePath);

    if (thumbnailFile) {
      thumbnailUrl = (await thumbnailFile.getSignedUrl({
        action: 'read',
        expires: '03-01-2030',
      }))[0];
    } else if (ext === 'jpg' || ext === 'png') {
      thumbnailUrl = mainFileUrl;
    }

    const caseRef = db.collection('cases').doc(caseId);
    const doc = await caseRef.get();

    // 🛠️ Only this part changed — adding the title from manifest
    if (!doc.exists) {
      console.warn(`⚠️ No Firestore document found for case ${caseId}. Creating it.`);

      const meta = (caseManifest as Record<string, { title: string }>)[caseId];
      const title = meta?.title || 'Untitled Case';

      await caseRef.set({
        title,
        evidence: {}
      });
    }

    await caseRef.update({
      [`evidence.${evidenceId}`]: {
        fileName,
        fileType: type,
        thumbnailUrl,
        fileDownloadUrl: mainFileUrl,
      },
    });

    console.log(`✅ Linked: ${file.name} → ${caseId} / ${evidenceId}`);
  }

  console.log('🎉 Done linking all assets!');
}

function getTypeFromExtension(ext: string): string {
  switch (ext.toLowerCase()) {
    case 'jpg':
    case 'png':
      return 'Image';
    case 'mp3':
      return 'Audio';
    case 'mp4':
      return 'Video';
    case 'pdf':
    case 'txt':
      return 'Document';
    default:
      return 'Unknown';
  }
}

linkAllAssets().catch((err) => {
  console.error('❌ Script failed:', err);
});
