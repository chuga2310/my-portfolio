import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { yearsShipping } from './src/lib/yearsShipping'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Meta tags can't run JS, so the "years shipping" figure is filled in when the page is built.
    { name: 'years-shipping', transformIndexHtml: (html) => html.replaceAll('%YEARS_SHIPPING%', yearsShipping()) },
  ],
})
