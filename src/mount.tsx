import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import type { PageConfig } from './lib/types'

/** Renders one page of the site; each HTML entry calls this with its own content. */
export function mount(page: PageConfig) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App page={page} />
    </StrictMode>,
  )
}
