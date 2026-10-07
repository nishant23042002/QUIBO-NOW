import { ImageResponse } from 'next/og';

// Placeholder app icon, drawn at build time so no image file is committed. The .png in the URL
// matters: proxy.ts skips paths with a file extension, so they do not get a locale prefix.
export const dynamic = 'force-static';

const SIZES: Record<string, number> = { '192.png': 192, '512.png': 512 };
// Repeats --qb-color-brand and --qb-color-on-brand from packages/ui. The brand is undecided.
const BACKGROUND = '#1b6b3a';
const FOREGROUND = '#ffffff';
const GLYPH = 'Q';

export function generateStaticParams() {
  return Object.keys(SIZES).map((name) => ({ name }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const size = SIZES[name];
  if (size === undefined) return new Response('Not found', { status: 404 });

  // Full-bleed colour with the glyph well inside the centre 80%, so the same image also
  // works as a maskable icon.
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BACKGROUND,
        color: FOREGROUND,
        fontSize: size * 0.56,
        fontWeight: 700,
      }}
    >
      {GLYPH}
    </div>,
    { width: size, height: size },
  );
}
