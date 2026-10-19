import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const publicDir = path.join(rootDir, 'public');
const nextDir = path.join(rootDir, '.next');
const standaloneDir = path.join(nextDir, 'standalone');
const nextStaticDir = path.join(nextDir, 'static');

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  if (process.env.VERCEL) {
    console.log('[copy-assets] Vercel serves public/ itself. EC2 asset copy skipped.');
  } else {
  console.log('[copy-assets] Injecting public & static assets into .next for deployment...');

  // 1. .next/public
  copyDirSync(publicDir, path.join(nextDir, 'public'));

  // 2. .next/static/assets
  copyDirSync(path.join(publicDir, 'assets'), path.join(nextStaticDir, 'assets'));

  // 3. .next/standalone/public
  if (fs.existsSync(standaloneDir)) {
    copyDirSync(publicDir, path.join(standaloneDir, 'public'));
    // 4. .next/standalone/.next/static
    copyDirSync(nextStaticDir, path.join(standaloneDir, '.next', 'static'));
  }

  console.log('[copy-assets] Successfully injected assets into .next build directories!');
  }
} catch (err) {
  console.error('[copy-assets] Error copying assets:', err);
}
