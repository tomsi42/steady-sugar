// LoadSkiaWeb() fetches /canvaskit.wasm from the web root by default. Metro doesn't
// serve node_modules, so this copies the binary into public/ (served as-is by Expo web)
// after every install, keeping it in sync with the installed canvaskit-wasm version.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', 'canvaskit-wasm', 'bin', 'full', 'canvaskit.wasm');
const destDir = path.join(__dirname, '..', 'public');
const dest = path.join(destDir, 'canvaskit.wasm');

if (!fs.existsSync(src)) {
  console.warn('[copy-canvaskit-wasm] canvaskit-wasm binary not found, skipping:', src);
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('[copy-canvaskit-wasm] Copied canvaskit.wasm to public/');
