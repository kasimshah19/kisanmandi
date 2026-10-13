import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesDir = path.resolve(__dirname, '../src/locales');

function loadJson(filename) {
  const fullPath = path.join(localesDir, filename);
  const content = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(content);
}

function flattenKeys(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenKeys(value, fullPath));
    } else {
      result[fullPath] = value;
    }
  }
  return result;
}

const en = flattenKeys(loadJson('en.json'));
const hi = flattenKeys(loadJson('hi.json'));
const mr = flattenKeys(loadJson('mr.json'));

const enKeys = new Set(Object.keys(en));
const hiKeys = new Set(Object.keys(hi));
const mrKeys = new Set(Object.keys(mr));

let hasErrors = false;
let warningCount = 0;

console.log('🔍 Checking KisanMandi i18n translations...\n');
console.log(`Total English keys (Source of Truth): ${enKeys.size}`);

function checkLanguage(langCode, targetKeys, targetObj) {
  const missing = [];
  const extra = [];
  const empty = [];
  const untranslated = [];

  for (const key of enKeys) {
    if (!targetKeys.has(key)) {
      missing.push(key);
    } else {
      const val = targetObj[key];
      const enVal = en[key];

      if (val === '' || val === null || val === undefined) {
        empty.push(key);
      } else if (
        typeof val === 'string' &&
        typeof enVal === 'string' &&
        val.trim() === enVal.trim() &&
        enVal.length > 4 &&
        !enVal.includes('KisanMandi') &&
        !key.startsWith('admin_light') &&
        !key.startsWith('units')
      ) {
        untranslated.push({ key, value: enVal });
      }
    }
  }

  for (const key of targetKeys) {
    if (!enKeys.has(key)) {
      extra.push(key);
    }
  }

  console.log(`--- [${langCode.toUpperCase()}] ---`);
  if (missing.length > 0) {
    hasErrors = true;
    console.error(`❌ Missing ${missing.length} keys in ${langCode}.json:`);
    missing.forEach(k => console.error(`   - ${k}`));
  } else {
    console.log(`✅ No missing keys in ${langCode}.json`);
  }

  if (extra.length > 0) {
    hasErrors = true;
    console.error(`❌ Extra ${extra.length} keys in ${langCode}.json not present in en.json:`);
    extra.forEach(k => console.error(`   - ${k}`));
  } else {
    console.log(`✅ No extra keys in ${langCode}.json`);
  }

  if (empty.length > 0) {
    warningCount += empty.length;
    console.warn(`⚠️ Warning: ${empty.length} empty values in ${langCode}.json:`);
    empty.forEach(k => console.warn(`   - ${k}`));
  }

  if (untranslated.length > 0) {
    warningCount += untranslated.length;
    console.warn(`⚠️ Warning: ${untranslated.length} strings identical to English in ${langCode}.json (check if untranslated):`);
    untranslated.forEach(item => console.warn(`   - ${item.key}: "${item.value}"`));
  }
  console.log('');
}

checkLanguage('hi', hiKeys, hi);
checkLanguage('mr', mrKeys, mr);

if (hasErrors) {
  console.error('❌ i18n check failed: missing or extra keys detected.\n');
  process.exit(1);
} else {
  console.log(`🎉 All i18n keys matched perfectly across en, hi, and mr! (Warnings: ${warningCount})\n`);
  process.exit(0);
}
