import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        svelte(),
        // Precaches the built app shell + assets so a second visit works with
        // the network off. `start_url`/`scope` are relative — this app is served
        // from a GitHub Pages subpath (/nntv/), not a domain root, and an
        // absolute '/' here would silently break that deployment.
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.png'],
            manifest: {
                name: 'Night Ninja: Twilight Voyage',
                short_name: 'Night Ninja',
                description: 'Turn-based stealth puzzle game: guide a ninja rabbit past vegetable guards to rescue the carrot princess.',
                start_url: './',
                scope: './',
                display: 'fullscreen',
                background_color: '#0a0a1a',
                theme_color: '#0a0a1a',
                // Every icon listed here is also precached, with a content hash.
                // Anything already swept up by `globPatterns` below would then be
                // listed twice under two different revisions, and Workbox rejects
                // a precache list with conflicting entries — the install handler
                // throws, the worker activates with an EMPTY cache, and offline
                // silently does nothing. Keep icons to files globPatterns misses.
                icons: [
                    { src: 'favicon.png', sizes: '32x32', type: 'image/png' },
                    // 192 and 512 are the sizes an install prompt actually requires;
                    // without both, browsers silently decline to offer installation.
                    { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
                    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
                    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
            workbox: {
                // Default globPatterns only match js/css/html; this app's weight
                // is media, so precache the art and audio too. webp carries the
                // key art — omitting it would leave those images network-only and
                // break the offline requirement for the menu and ending screens.
                globPatterns: ['**/*.{js,css,html,png,webp,mp3,ico,webmanifest}'],
            },
        }),
    ],
    // Relative asset paths — makes the built index.html work when opened
    // directly (file://) or served from any subpath, not just the server root.
    base: './',
    server: {
        port: 8080,
    },
    // esbuild 0.28.x dropped support for transforming destructuring to very
    // old browser targets (chrome87/firefox78/safari14). Pin a modern target
    // so the Svelte plugin's esbuild transform path stays compatible with
    // the patched esbuild forced via pnpm-workspace.yaml.
    build: {
        target: 'es2022',
    },
    esbuild: {
        target: 'es2022',
    },
});
