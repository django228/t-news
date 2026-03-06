import path from 'path'

import { defineConfig } from 'vite'

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    base: '/t-news/',
    esbuild: {
        keepNames: true,
    },
});