// Self-hosted woff for the in-scene (troika) text. Without an explicit font,
// troika resolves glyphs through a CDN at runtime — which stalls or fails on
// flaky venue Wi-Fi. BASE_URL keeps the path correct under GitHub Pages.
export const TEXT_FONT = `${import.meta.env.BASE_URL}fonts/IBMPlexMono-Medium.woff`
