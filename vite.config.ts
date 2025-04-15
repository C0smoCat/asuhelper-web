import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(env => ({
    plugins: [react()],
    define: {
        BUILD_TIME: Math.floor(new Date().getTime() / 1000),
        SHOW_NATIVE_APP_PROMO: false,
        API_PATH: JSON.stringify("/api/"),
        API_SI_PATH: JSON.stringify("/s/"),
    },
    build: {
        sourcemap: false,
        rollupOptions: {
            input: env.mode === "production"
                ? "index.html"
                : "index.dev.html",
            output: {
                sourcemapExcludeSources: true
            }
        },
    },
    server: {
        proxy: {
            "/api": {
                target: "https://webstudent.asu-edu.ru",
                changeOrigin: true,
                secure: true,
            },
            "/s/": {
                target: "https://asuhelper.portal9.ru",
                changeOrigin: true,
                secure: true,
            },
        },
    },
}))
