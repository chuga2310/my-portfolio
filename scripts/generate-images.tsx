// Renders social share + icon images with @vercel/og's ImageResponse, in the site's warm-paper look.
// Output lands in /public and is committed; re-run after changing hero copy:
//   npm run images
import { ImageResponse } from '@vercel/og';
import { readFile, writeFile } from 'node:fs/promises';
import type { ReactElement } from 'react';
import type { Lang, LangContent } from '../src/lib/types.ts';
import { CONTENT } from '../src/lib/content.ts';
import { FRONTEND_PAGE } from '../src/lib/pages/frontend.ts';
import { PRODUCT_PAGE } from '../src/lib/pages/product.ts';
import { FULLSTACK_PAGE } from '../src/lib/pages/fullstack.ts';

const SITE_HOST = 'cuongle.technet.software';
// Mirrors the light tokens in src/index.css.
const IVORY = '#FAF9F5';
const OAT = '#F0EEE6';
const INK = '#141413';
const MUTED = '#5E5D59';
const DIM = '#73726C';
const CLAY = '#D97757';
const CLAY_INK = '#A3492B';

const ROOT = new URL('../', import.meta.url);
const PUBLIC_DIR = new URL('public/', ROOT);

const font = (pkg: string, file: string) =>
  readFile(new URL(`node_modules/@fontsource/${pkg}/files/${file}`, ROOT));

async function loadFonts() {
  const files: [string, string, string, 400 | 500 | 600, 'normal' | 'italic'][] = [
    ['Newsreader', 'newsreader', 'newsreader-latin-400-normal.woff', 400, 'normal'],
    ['Newsreader', 'newsreader', 'newsreader-vietnamese-400-normal.woff', 400, 'normal'],
    ['Newsreader', 'newsreader', 'newsreader-latin-400-italic.woff', 400, 'italic'],
    ['Newsreader', 'newsreader', 'newsreader-vietnamese-400-italic.woff', 400, 'italic'],
    ['Newsreader', 'newsreader', 'newsreader-latin-500-normal.woff', 500, 'normal'],
    ['Hanken Grotesk', 'hanken-grotesk', 'hanken-grotesk-latin-400-normal.woff', 400, 'normal'],
    ['Hanken Grotesk', 'hanken-grotesk', 'hanken-grotesk-vietnamese-400-normal.woff', 400, 'normal'],
    ['Hanken Grotesk', 'hanken-grotesk', 'hanken-grotesk-latin-500-normal.woff', 500, 'normal'],
    ['Hanken Grotesk', 'hanken-grotesk', 'hanken-grotesk-latin-600-normal.woff', 600, 'normal'],
    ['JetBrains Mono', 'jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff', 400, 'normal'],
  ];
  // Latin + Vietnamese subsets of one family/weight act as glyph fallbacks for each other.
  return Promise.all(files.map(async ([name, pkg, file, weight, style]) => ({ name, data: await font(pkg, file), weight, style })));
}

const serif = { fontFamily: 'Newsreader' };
const mono = { fontFamily: 'JetBrains Mono' };

function Mark({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.24, background: CLAY, color: IVORY,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...serif, fontWeight: 500, fontSize: size * 0.5, letterSpacing: -size * 0.02,
      }}
    >
      CL
    </div>
  );
}

/** Pixel me at my desk (scripts/assets/og-scene.png, pre-scaled x4 so it stays crisp). */
const SCENE = `data:image/png;base64,${(await readFile(new URL('scripts/assets/og-scene.png', ROOT))).toString('base64')}`;

/** One share card per page: the main portfolio and each role page show their own roles and tagline. */
function OgImage({ content }: { content: Record<Lang, LangContent> }) {
  const { hero } = content.en;
  const nameVi = content.vi.hero.name;
  const lead = hero.roles.slice(0, -1);
  const last = hero.roles[hero.roles.length - 1];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', padding: '56px 64px', background: IVORY, color: INK, fontFamily: 'Hanken Grotesk' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Mark size={44} />
          <div style={{ ...serif, fontSize: 30 }}>Cuong Le</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'flex-start', padding: '6px 14px', borderRadius: 999, background: OAT, fontSize: 18, color: MUTED }}>
            <div style={{ width: 9, height: 9, borderRadius: 9, background: CLAY }} />
            {hero.kicker}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginTop: 22 }}>
            <div style={{ ...serif, fontSize: 76, lineHeight: 1, letterSpacing: -2 }}>{hero.name}</div>
          </div>
          <div style={{ ...serif, fontStyle: 'italic', fontSize: 28, color: DIM, marginTop: 8 }}>{nameVi}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', ...serif, fontSize: 26, lineHeight: 1.25, marginTop: 20, color: INK }}>
            {lead.map((r) => <span key={r} style={{ marginRight: 10 }}>{r} ·</span>)}
            <span style={{ fontStyle: 'italic', color: CLAY_INK }}>{last}</span>
          </div>
          <div style={{ fontSize: 22, lineHeight: 1.4, color: MUTED, marginTop: 14 }}>{hero.tagline}</div>
        </div>

        <div style={{ display: 'flex', ...mono, fontSize: 18, color: DIM }}>{SITE_HOST}</div>
      </div>

      {/* Pixel me at the office, framed like the About card. */}
      <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'center', borderRadius: 24, overflow: 'hidden', background: OAT, boxShadow: '0 0 0 1px rgba(31,30,29,0.1)' }}>
        <img src={SCENE} width={512} height={472} style={{ display: 'flex', borderRadius: 24 }} />
      </div>
    </div>
  );
}

/** Rounded for the browser tab; full-bleed for app icons, which the OS masks itself. */
function Icon({ size, rounded }: { size: number; rounded: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: rounded ? 'transparent' : CLAY }}>
      <div
        style={{
          width: '100%', height: '100%', borderRadius: rounded ? size * 0.22 : 0, background: CLAY, color: IVORY,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          ...serif, fontWeight: 500, fontSize: size * 0.5, letterSpacing: -size * 0.02,
        }}
      >
        CL
      </div>
    </div>
  );
}

type Fonts = Awaited<ReturnType<typeof loadFonts>>;

async function render(file: string, el: ReactElement, width: number, height: number, fonts: Fonts) {
  const res = new ImageResponse(el, { width, height, fonts });
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(new URL(file, PUBLIC_DIR), buf);
  console.log(`✓ public/${file}  ${width}×${height}  ${(buf.length / 1024).toFixed(1)} KB`);
}

const fonts = await loadFonts();
await render('og-image.png', <OgImage content={CONTENT} />, 1200, 630, fonts);
await render('og-frontend.png', <OgImage content={FRONTEND_PAGE.content} />, 1200, 630, fonts);
await render('og-product.png', <OgImage content={PRODUCT_PAGE.content} />, 1200, 630, fonts);
await render('og-fullstack.png', <OgImage content={FULLSTACK_PAGE.content} />, 1200, 630, fonts);
for (const [file, size, rounded] of [
  ['favicon-48x48.png', 48, true],
  ['apple-touch-icon.png', 180, false],
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
] as const) {
  await render(file, <Icon size={size} rounded={rounded} />, size, size, fonts);
}
