import { TEXT_MAX, TEXT_MIN, type ExtractErrorCode } from './types';

// Text is extracted in the browser; only plain text is sent to the API.
// pdf.js and mammoth are heavy, so they are imported only when a file is dropped.

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const ACCEPT = '.pdf,.docx,.txt,.md';
const MAX_PDF_PAGES = 30;

type FileKind = 'pdf' | 'docx' | 'text';

export class ExtractError extends Error {
  readonly code: ExtractErrorCode;
  constructor(code: ExtractErrorCode) {
    super(code);
    this.name = 'ExtractError';
    this.code = code;
  }
}

export interface Extracted { text: string; truncated: boolean; }

function kindOf(file: File): FileKind | null {
  const ext = file.name.toLowerCase().split('.').pop() ?? '';
  if (ext === 'pdf' || file.type === 'application/pdf') return 'pdf';
  if (ext === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (ext === 'txt' || ext === 'md' || file.type === 'text/plain' || file.type === 'text/markdown') return 'text';
  return null;
}

export function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t\f\v\u00a0]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function clampText(text: string): Extracted {
  const truncated = text.length > TEXT_MAX;
  return { text: truncated ? text.slice(0, TEXT_MAX) : text, truncated };
}

async function readPdf(file: File): Promise<string> {
  const [pdfjs, worker] = await Promise.all([
    import('pdfjs-dist/legacy/build/pdf.mjs'),
    import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    const doc = await task.promise;
    let out = '';
    const pages = Math.min(doc.numPages, MAX_PDF_PAGES);
    for (let i = 1; i <= pages && out.length < TEXT_MAX; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      for (const item of content.items) {
        if ('str' in item) out += item.str + (item.hasEOL ? '\n' : '');
      }
      out += '\n\n';
      page.cleanup();
    }
    return out;
  } finally {
    void task.destroy();
  }
}

async function readDocx(file: File): Promise<string> {
  const { default: mammoth } = await import('mammoth/mammoth.browser.min.js');
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return value;
}

export async function extractText(file: File): Promise<Extracted> {
  const kind = kindOf(file);
  if (!kind) throw new ExtractError('unsupported');
  if (file.size > MAX_FILE_BYTES) throw new ExtractError('too_large');

  let raw: string;
  try {
    if (kind === 'pdf') raw = await readPdf(file);
    else if (kind === 'docx') raw = await readDocx(file);
    else raw = await file.text();
  } catch {
    throw new ExtractError('read_failed');
  }

  const text = normalizeText(raw);
  // A PDF with (almost) no text layer is most likely a scan.
  if (text.length < TEXT_MIN) throw new ExtractError(kind === 'pdf' ? 'no_text' : 'too_short');
  return clampText(text);
}
