// scripts/uploadAndLink.ts

import { execSync } from 'child_process';
import * as path from 'path';

const evidencePath = path.resolve(__dirname, '../evidence');
const bucket = 'coldcasesync.appspot.com';

try {
  console.log(`🚀 Uploading local evidence folder to Firebase Storage...`);
  execSync(`npx firebase storage:upload ${evidencePath} --bucket ${bucket} --recursive`, {
    stdio: 'inherit',
  });

  console.log(`✅ Upload complete. Now linking assets...`);
  execSync(`npx tsx scripts/linkAssetsToFirestore.ts`, {
    stdio: 'inherit',
  });

  console.log(`🎉 All done: evidence uploaded and linked.`);
} catch (err) {
  console.error('❌ Upload or linking failed:', err);
  process.exit(1);
}
