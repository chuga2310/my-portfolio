// Renders social share + icon images with @vercel/og's ImageResponse.
// Output lands in /public and is committed; re-run after changing hero copy:
//   npm run images
import { ImageResponse } from '@vercel/og';
import { readFile, writeFile } from 'node:fs/promises';
import type { ReactElement } from 'react';
import { CONTENT } from '../src/lib/content.ts';

const SITE_HOST = 'cuongle.technet.software';
const BG = '#050507';
const ACCENT = '#00E5FF';
const VIOLET = '#7A5CFF';
const TEXT_MUTE = '#8a8a98';
const HOLO = `linear-gradient(110deg, #ffffff 15%, ${ACCENT} 55%, ${VIOLET} 95%)`;

const ROOT = new URL('../', import.meta.url);
const PUBLIC_DIR = new URL('public/', ROOT);

const font = (pkg: string, file: string) =>
  readFile(new URL(`node_modules/@fontsource/${pkg}/files/${file}`, ROOT));

async function loadFonts() {
  const [sg500, sg500vi, sg700, sg700vi, jb400, jb500] = await Promise.all([
    font('space-grotesk', 'space-grotesk-latin-500-normal.woff'),
    font('space-grotesk', 'space-grotesk-vietnamese-500-normal.woff'),
    font('space-grotesk', 'space-grotesk-latin-700-normal.woff'),
    font('space-grotesk', 'space-grotesk-vietnamese-700-normal.woff'),
    font('jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'),
    font('jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'),
  ]);
  // Same family registered twice per weight: latin + vietnamese subsets act as glyph fallbacks.
  return [
    { name: 'Space Grotesk', data: sg500, weight: 500 as const, style: 'normal' as const },
    { name: 'Space Grotesk', data: sg500vi, weight: 500 as const, style: 'normal' as const },
    { name: 'Space Grotesk', data: sg700, weight: 700 as const, style: 'normal' as const },
    { name: 'Space Grotesk', data: sg700vi, weight: 700 as const, style: 'normal' as const },
    { name: 'JetBrains Mono', data: jb400, weight: 400 as const, style: 'normal' as const },
    { name: 'JetBrains Mono', data: jb500, weight: 500 as const, style: 'normal' as const },
  ];
}

const mono = { fontFamily: 'JetBrains Mono' };

function Dot({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size, background: ACCENT,
        boxShadow: `0 0 ${size * 1.5}px ${ACCENT}`,
      }}
    />
  );
}

function OgImage() {
  const { hero, metrics } = CONTENT.en;
  const nameVi = CONTENT.vi.hero.name;
  const stats = metrics.items.slice(0, 3);

  return (
    <div
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '56px 72px', position: 'relative',
        fontFamily: 'Space Grotesk', color: '#f4f4f7',
        backgroundColor: BG,
        backgroundImage: [
          'radial-gradient(circle at 88% 8%, rgba(0,229,255,0.22), transparent 45%)',
          'radial-gradient(circle at 0% 100%, rgba(122,92,255,0.20), transparent 50%)',
        ].join(', '),
      }}
    >
      {/* corner brackets, mirrors .corners in index.css */}
      <div style={{ position: 'absolute', top: 28, left: 28, width: 36, height: 36, borderTop: `2px solid ${ACCENT}`, borderLeft: `2px solid ${ACCENT}` }} />
      <div style={{ position: 'absolute', bottom: 28, right: 28, width: 36, height: 36, borderBottom: `2px solid ${ACCENT}`, borderRight: `2px solid ${ACCENT}` }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...mono, fontSize: 18, letterSpacing: 2.5, color: TEXT_MUTE, textTransform: 'uppercase' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Dot size={10} />
          {hero.kicker}
        </div>
        <div style={{ display: 'flex', color: '#f4f4f7' }}>CUONG.LE / PORTFOLIO</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 28 }}>
          <div
            style={{
              fontSize: 108, fontWeight: 500, letterSpacing: -4.5, lineHeight: 1,
              backgroundImage: HOLO, backgroundClip: 'text', color: 'transparent',
            }}
          >
            {hero.name}
          </div>
          <div style={{ fontSize: 30, fontWeight: 500, color: TEXT_MUTE }}>{nameVi}</div>
        </div>
        <div style={{ display: 'flex', gap: 32, marginTop: 26, ...mono, fontSize: 21, letterSpacing: 1, color: '#c9c9d4' }}>
          {hero.roles.map((r) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 14, height: 2, background: ACCENT }} />
              {r}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28, fontSize: 36, lineHeight: 1.25, maxWidth: 900, color: 'rgba(255,255,255,0.92)', letterSpacing: -0.5 }}>
          {hero.tagline}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', gap: 48 }}>
          {stats.map((s) => (
            <div key={s.k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.5, color: ACCENT }}>{s.v}</div>
              <div style={{ ...mono, fontSize: 15, letterSpacing: 1.5, textTransform: 'uppercase', color: TEXT_MUTE }}>{s.k}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderRadius: 999,
            border: '1px solid rgba(0,229,255,0.45)', background: 'rgba(0,229,255,0.08)',
            ...mono, fontSize: 19, fontWeight: 500, color: ACCENT,
          }}
        >
          <Dot size={8} />
          {SITE_HOST}
        </div>
      </div>
    </div>
  );
}

function Icon({ size }: { size: number }) {
  return (
    <div
      style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Space Grotesk',
        backgroundColor: BG,
        backgroundImage: 'radial-gradient(circle at 80% 15%, rgba(0,229,255,0.35), transparent 60%)',
      }}
    >
      {/* "CL." — the dot sits on the baseline like a period */}
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <div
          style={{
            fontSize: size * 0.5, fontWeight: 700, letterSpacing: -size * 0.035, lineHeight: 1,
            backgroundImage: HOLO, backgroundClip: 'text', color: 'transparent',
          }}
        >
          CL
        </div>
        <div style={{ display: 'flex', marginLeft: size * 0.03, marginBottom: size * 0.075 }}>
          <Dot size={Math.max(5, Math.round(size * 0.09))} />
        </div>
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
await render('og-image.png', <OgImage />, 1200, 630, fonts);
for (const [file, size] of [
  ['favicon-48x48.png', 48],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
] as const) {
  await render(file, <Icon size={size} />, size, size, fonts);
}
