const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const www = path.join(root, 'www');
const src = path.join(root, 'index.html');
const dest = path.join(www, 'index.html');
const androidPublic = path.join(
  root,
  'android',
  'app',
  'src',
  'main',
  'assets',
  'public',
  'index.html'
);

if (!fs.existsSync(src)) {
  console.error('Missing index.html');
  process.exit(1);
}

fs.mkdirSync(www, { recursive: true });
fs.copyFileSync(src, dest);
console.log('✅ www/index.html');

if (fs.existsSync(path.dirname(androidPublic))) {
  fs.mkdirSync(path.dirname(androidPublic), { recursive: true });
  fs.copyFileSync(src, androidPublic);
  console.log('✅ android/.../public/index.html');
} else {
  console.log('ℹ️  android assets not present yet (run npx cap add android)');
}
