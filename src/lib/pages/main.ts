import type { PageConfig } from '../types';
import { CONTENT } from '../content';

/** The main portfolio at /. */
export const MAIN_PAGE: PageConfig = {
  content: CONTENT,
  orbit: {
    // Projects (Logically, Coca-Cola, RAG, sprint planning, Lumi) spread between the languages,
    // frameworks and platforms I build with.
    outer: [
      'logically', 'claude', 'typescript', 'react', 'coke', 'gcp', 'rag', 'java', 'openai', 'nextjs', 'lumi', 'nodejs', 'sprint', 'rust',
      'gemini', 'vercel',
    ],
    inner: ['javascript', 'springboot', 'postgres', 'threejs', 'n8n', 'electron'],
    marquee: ['logically', 'claude', 'typescript', 'rag', 'react', 'coke', 'java', 'openai', 'sprint', 'nextjs', 'lumi', 'nodejs', 'gcp', 'rust'],
  },
};
