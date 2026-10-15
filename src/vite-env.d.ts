/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_TURNSTILE_SITEKEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'mammoth/mammoth.browser.min.js' {
  interface RawTextResult { value: string; messages: unknown[] }
  const mammoth: { extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<RawTextResult> };
  export default mammoth;
}
