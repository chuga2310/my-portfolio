#!/usr/bin/env node
// Fails the build if the public bundle contains anything that looks like a secret or an
// internal hostname, or a VITE_* variable other than the two public ones.
// Usage: node scripts/check-dist.mjs [dir]   (default: dist)

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const ROOT = process.argv[2] || 'dist';
const ALLOWED_VITE = new Set(['VITE_API_BASE', 'VITE_TURNSTILE_SITEKEY']);
const TEXT_EXT = new Set(['.html', '.js', '.mjs', '.cjs', '.css', '.json', '.map', '.txt', '.xml', '.svg', '.webmanifest', '.md']);

const RULES = [
  // `sk-` only at a token start, so CSS like `mask-image` or words like `task-` do not trip it.
  { name: 'OpenAI-style key (sk-…)', re: /(?<![A-Za-z0-9_])sk-(?:proj-)?[A-Za-z0-9_-]{8,}/g },
  { name: 'OpenAI project key (sk-proj-)', re: /sk-proj-/g },
  { name: 'Cloudflare Access service token header', re: /CF-Access-Client/gi },
  { name: 'Vercel deployment host', re: /vercel\.app/gi },
  { name: 'Cloudflare quick tunnel host', re: /trycloudflare/gi },
  { name: 'internal LLM service name', re: /jd-llm/gi },
  { name: 'dev mock API (should be dead code in prod)', re: /localhost:8787/g },
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

let problems = 0;
let scanned = 0;
const report = (file, msg, sample) => {
  problems++;
  console.error(`✗ ${relative(process.cwd(), file)}: ${msg}${sample ? `  →  …${sample}…` : ''}`);
};

try {
  statSync(ROOT);
} catch {
  console.error(`✗ ${ROOT}/ not found; run the build first.`);
  process.exit(1);
}

for (const file of walk(ROOT)) {
  if (!TEXT_EXT.has(extname(file).toLowerCase())) continue;
  scanned++;
  const text = readFileSync(file, 'utf8');
  for (const { name, re } of RULES) {
    for (const m of text.matchAll(re)) {
      report(file, name, text.slice(Math.max(0, m.index - 20), m.index + m[0].length + 20).replace(/\s+/g, ' '));
    }
  }
  for (const m of text.matchAll(/VITE_[A-Z0-9_]+/g)) {
    if (!ALLOWED_VITE.has(m[0])) report(file, `env variable ${m[0]} is not in the allowlist`);
  }
}

// Vite inlines values, not names, so also refuse unexpected VITE_* vars in the build env.
for (const k of Object.keys(process.env)) {
  if (k.startsWith('VITE_') && !ALLOWED_VITE.has(k)) {
    problems++;
    console.error(`✗ environment: ${k} is set but not in the allowlist (${[...ALLOWED_VITE].join(', ')})`);
  }
}

if (problems) {
  console.error(`\n${problems} problem(s) in ${scanned} file(s) under ${ROOT}/. Refusing to deploy.`);
  process.exit(1);
}
console.log(`✓ ${scanned} file(s) under ${ROOT}/ clean (no secret-like strings, internal hosts or extra VITE_ vars).`);
