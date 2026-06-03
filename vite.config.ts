import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
// import mkcert from "vite-plugin-mkcert";
import vue from "@vitejs/plugin-vue";
import ui from "@nuxt/ui/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // mkcert(),
    ui({
      colorMode: false,
      ui: {
        colors: {
          primary: "green",
          warning: "yellow",
          secondary: "white",
          info: "blue",
          dark: "dark",
          text: "text",
          secondText: "secondText",
        },
        skeleton: {
          base: "animate-pulse rounded-md bg-slate-200",
        },
      },
    }),
    VitePWA({
      registerType: "autoUpdate", // Mengganti 'prompt' ke 'autoUpdate' agar sw langsung aktif
      injectRegister: "auto", // <--- UBAH DARI false MENJADI "auto"

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: "jejak-tanah",
        short_name: "jejak-tanah",
        description: "jejak-tanah",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone", // <--- WAJIB: Agar bisa diinstall di HP
        start_url: "/", // <--- Direkomendasikan
        icons: [
          // <--- WAJIB: Sediakan ikon minimal ukuran ini
          {
            src: "pwa-192x192.png", // Sesuaikan dengan nama & lokasi ikon Anda di folder public
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png", // Sesuaikan dengan nama & lokasi ikon Anda di folder public
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 4000000,
      },

      devOptions: {
        enabled: true, // <--- SEMENTARA ubah ke true untuk testing di mode development (npm run dev)
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    }),
  ],
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  // server: {
  //   host: "0.0.0.0",
  //   allowedHosts: true,
  // },
});
