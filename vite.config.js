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
});
