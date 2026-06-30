import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `base` is set for GitHub Pages project hosting (https://<user>.github.io/<repo>/).
// Override at build time with: BASE_PATH=/your-repo/ npm run build
// Use '/' (root) for a custom domain or a root deploy (Netlify / Vercel / static host).
const base = process.env.BASE_PATH || '/watsonx-journey/'

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'build' ? base : '/',
}))
