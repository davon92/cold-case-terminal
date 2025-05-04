import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const evidencePath = path.resolve(__dirname, '../evidence');
const bucket = 'gs://coldcasesync.firebasestorage.app';

if (!fs.existsSync(evidencePath)) {
  console.error('❌ Local evidence folder does not exist:', evidencePath);
  process.exit(1);
}

try {
  console.log(`🚀 Uploading local evidence folder to Firebase Storage...`);
  console.log('Uploading from path:', evidencePath);
  console.log('Running:', `gsutil -m cp -r ${evidencePath} ${bucket}/`);
  
  execSync(`gsutil -m cp -r ${evidencePath} ${bucket}/`, {
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
