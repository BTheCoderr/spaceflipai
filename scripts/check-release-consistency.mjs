import fs from 'node:fs';

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const readText = (path) => fs.readFileSync(path, 'utf8');

const app = readJson('app.json');
const pkg = readJson('package.json');
const eas = readJson('eas.json');
const submissionPack = readText('APP_STORE_SUBMISSION_PACK.md');

const expo = app.expo ?? {};
const errors = [];
const check = (condition, message) => {
  if (!condition) errors.push(message);
};

const EXPECTED_NAME = 'SpaceFlip Pro';
const EXPECTED_SLUG = 'spaceflip-pro';
const EXPECTED_BUNDLE = 'com.spaceflip.pro';
const EXPECTED_EAS_PROJECT = 'e8a0f765-6613-49b6-a8fe-a3a4a1566661';
const EXPECTED_SUPABASE_REF = 'fslxwcehapelumttwmcf';
const EXPECTED_SUPABASE_URL = `https://${EXPECTED_SUPABASE_REF}.supabase.co`;

check(expo.name === EXPECTED_NAME, `expo.name must stay "${EXPECTED_NAME}"`);
check(expo.slug === EXPECTED_SLUG, `expo.slug must stay "${EXPECTED_SLUG}"`);
check(expo.version === pkg.version, 'app.json expo.version must match package.json version');
check(expo.ios?.bundleIdentifier === EXPECTED_BUNDLE, `iOS bundleIdentifier must stay ${EXPECTED_BUNDLE}`);
check(expo.android?.package === EXPECTED_BUNDLE, `Android package must stay ${EXPECTED_BUNDLE}`);
check(expo.ios?.bundleIdentifier === expo.android?.package, 'iOS and Android application identifiers must match');
check(expo.extra?.eas?.projectId === EXPECTED_EAS_PROJECT, 'EAS projectId does not match the SpaceFlip project');
check(eas.cli?.appVersionSource === 'remote', 'EAS appVersionSource must be "remote" so build numbers remain unique');
check(eas.build?.production?.autoIncrement === true, 'Production EAS builds must auto-increment developer build numbers');

for (const profile of ['development', 'preview', 'production']) {
  const env = eas.build?.[profile]?.env ?? {};
  check(
    env.EXPO_PUBLIC_SUPABASE_URL === EXPECTED_SUPABASE_URL,
    `${profile} EAS profile must point to the live SpaceFlip Supabase project`
  );
  check(
    typeof env.EXPO_PUBLIC_SUPABASE_ANON_KEY === 'string' &&
      env.EXPO_PUBLIC_SUPABASE_ANON_KEY.startsWith('sb_publishable_'),
    `${profile} EAS profile must use a Supabase publishable key`
  );
}

const keys = ['development', 'preview', 'production']
  .map((profile) => eas.build?.[profile]?.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY)
  .filter(Boolean);
check(new Set(keys).size === 1, 'All EAS profiles must use the same live Supabase publishable key');

check(
  expo.ios?.infoPlist?.ITSAppUsesNonExemptEncryption === false,
  'ITSAppUsesNonExemptEncryption must remain explicitly false unless encryption usage changes'
);
check(
  Boolean(expo.ios?.infoPlist?.NSCameraUsageDescription),
  'NSCameraUsageDescription is required'
);
check(
  Boolean(expo.ios?.infoPlist?.NSPhotoLibraryUsageDescription),
  'NSPhotoLibraryUsageDescription is required'
);
check(
  typeof expo.ios?.supportsTablet === 'boolean',
  'iPad support must be an explicit release decision in app.json'
);

const versionMatch = submissionPack.match(/\*\*Version:\*\* `([^\`]+)`/);
check(Boolean(versionMatch), 'APP_STORE_SUBMISSION_PACK.md must declare the release version');
if (versionMatch) {
  check(
    versionMatch[1] === expo.version,
    'APP_STORE_SUBMISSION_PACK.md version must match app.json'
  );
}

if (errors.length) {
  console.error('\nSpaceFlip release consistency check FAILED:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('SpaceFlip release consistency check passed.');
console.log(`Version: ${expo.version}`);
console.log(`Bundle/package: ${EXPECTED_BUNDLE}`);
console.log(`EAS project: ${EXPECTED_EAS_PROJECT}`);
console.log(`Supabase project: ${EXPECTED_SUPABASE_REF}`);
console.log('Build numbers: EAS remote source + production autoIncrement');
