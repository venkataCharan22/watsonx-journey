# The Journey of a Legacy Pipeline

An auto-playing, cinematic 3D web experience telling the story of an IBM
watsonx.data Integration project: **two AI agents that move Informatica
pipelines onto IBM watsonx.data Integration.**

> decide. migrate. modernize.

A single river of data flows down the screen — tangling in amber legacy chaos,
funneling through a **Decision Agent** that scores StreamSets vs DataStage and
recommends explainably, getting rebuilt by a **Migration Agent** that translates
Informatica StreamSets logic into a clean watsonx.data flow graph, then racing
out smooth and green: *weeks to minutes.*

## Stack

- React 19 + Vite
- react-three-fiber + drei (Three.js)
- framer-motion (overlay UI)
- zustand (timeline state)
- IBM Plex Sans / Mono, IBM watsonx light theme

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build               # base = /watsonx-journey/ (GitHub Pages project site)
BASE_PATH=/ npm run build   # root deploy (custom domain / Netlify / Vercel)
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes to GitHub Pages.

Live: **https://venkatacharan22.github.io/watsonx-journey/**

## Notes

- The end-card QR is a placeholder grid — swap `QrPlaceholder` in
  `src/components/Overlay.jsx` for a real QR image pointing at the deployed URL.
- The whole film is driven by a single `progress` (0→1) value in `src/store.js`;
  every beat's behaviour and colour is a pure function of it.
