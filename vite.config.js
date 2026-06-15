import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte()],
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
