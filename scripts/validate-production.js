/**
 * Validates production configuration before EAS build.
 * Usage: node scripts/validate-production.js [--profile production|preview]
 */
const fs = require('fs');
const path = require('path');

const profile = process.argv.includes('--profile')
  ? process.argv[process.argv.indexOf('--profile') + 1]
  : 'production';

const root = path.join(__dirname, '..');
const errors = [];
const warnings = [];

function readEnv(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return {};
  const vars = {};
  for (const line of fs.readFileSync(full, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return vars;
}

const mobileEnv = readEnv('.env');
const required =
  profile === 'production'
    ? ['EXPO_PUBLIC_API_URL', 'EXPO_PUBLIC_API_KEY', 'EXPO_PUBLIC_PRIVACY_URL']
    : ['EXPO_PUBLIC_API_URL'];

for (const key of required) {
  const val = mobileEnv[key] || process.env[key];
  if (!val || val.includes('your-') || val.includes('example.com')) {
    errors.push(`Missing or placeholder: ${key}`);
  }
}

const apiUrl = mobileEnv.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || '';
if (profile === 'production' && apiUrl.startsWith('http://')) {
  errors.push('EXPO_PUBLIC_API_URL must use HTTPS in production');
}
if (
  profile === 'production' &&
  (mobileEnv.EXPO_PUBLIC_PRIVACY_URL || '').includes('YOUR_GITHUB_USERNAME')
) {
  errors.push('EXPO_PUBLIC_PRIVACY_URL still has YOUR_GITHUB_USERNAME — run scripts/release-setup.ps1');
}

const assets = ['assets/icon.png', 'assets/adaptive-icon.png', 'assets/splash.png'];
for (const asset of assets) {
  if (!fs.existsSync(path.join(root, asset))) {
    warnings.push(`Missing asset: ${asset} (run: npm run generate:icons)`);
  }
}

if (!mobileEnv.EAS_PROJECT_ID && !process.env.EAS_PROJECT_ID) {
  warnings.push('EAS_PROJECT_ID not set — run: eas init');
}

console.log(`\nProduction validation [${profile}]\n`);

if (warnings.length) {
  console.log('Warnings:');
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}

if (errors.length) {
  console.log('\nErrors:');
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  console.log('\nFix .env and eas.json before building.\n');
  process.exit(1);
}

console.log('✓ Configuration looks good for build.\n');
