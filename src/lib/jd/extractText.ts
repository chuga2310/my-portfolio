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


const KIND_BY_EXT: Record<string, FileKind> = { pdf: 'pdf', docx: 'docx', txt: 'text', md: 'text' };
const KIND_BY_MIME: Record<string, FileKind> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'text',
  'text/markdown': 'text',
};

/** The extension decides when there is one; the MIME type only for files without an extension. */
function kindOf(file: File): FileKind | null {
  const dot = file.name.lastIndexOf('.');
  if (dot > 0) return KIND_BY_EXT[file.name.slice(dot + 1).toLowerCase()] ?? null;
  return KIND_BY_MIME[file.type] ?? null;
}

export function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t\f\v\u00a0]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Characters the gateway counts towards the minimum: whitespace runs collapsed, ends trimmed. */
export function countChars(text: string): number {
  return text.replace(/\s+/g, ' ').trim().length;
}

/** Client-side length check on the text that will be sent, before any request. */
export function checkLength(text: string): ExtractErrorCode | null {
  if (countChars(text) < TEXT_MIN) return 'too_short';
  if (text.length > TEXT_MAX) return 'too_long';
  return null;
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
    for (let i = 1; i <= pages && out.length <= TEXT_MAX * 2; i++) {
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

export async function extractText(file: File): Promise<string> {
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
  if (kind === 'pdf' && text.length < 50) throw new ExtractError('no_text');
  const problem = checkLength(text);
  if (problem) throw new ExtractError(problem);
  return text;
}
