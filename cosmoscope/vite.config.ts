import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import type { Plugin } from "vite";
import { PAGE_META, SITE_META } from "./src/data/pageMeta";
import { LATEST_PIN, pinDistance } from "./src/data/pins";
import { POSTS } from "./src/data/blog";

// Writes page-meta.json next to the site, so the server can give each shared link its own title,
// line and picture. This week uses the newest pin's own picture.
function pageMeta(): Plugin {
  return {
    name: "pale-page-meta",
    apply: "build",
    generateBundle() {
      const firstSentence = (LATEST_PIN.body[0] ?? "").split(/(?<=\.)\s/)[0];
      const pages = {
        ...PAGE_META,
        "/discoveries": {
          title: `This week: ${LATEST_PIN.title} | PALE`,
          description: firstSentence || PAGE_META["/discoveries"].description,
          image: LATEST_PIN.image.src,
          imageAlt: LATEST_PIN.image.alt,
        },
        // Each blog post's own title and line.
        ...Object.fromEntries(
          POSTS.map((post) => [`/blog/${post.slug}`, { title: `${post.title} | PALE`, description: post.standfirst }]),
        ),
      };
      this.emitFile({
        type: "asset",
        fileName: "page-meta.json",
        source: JSON.stringify({ site: SITE_META, pages }, null, 2),
      });
      // The newest weekly picture, for the PALE app's Explore page. Only what the app shows.
      const p = LATEST_PIN;
      this.emitFile({
        type: "asset",
        fileName: "this-week.json",
        source: JSON.stringify(
          {
            version: 1,
            id: p.id,
            date: p.date,
            title: p.title,
            object: p.object,
            constellation: p.constellation,
            distance: pinDistance(p),
            image: { src: p.image.src, alt: p.image.alt, credit: p.image.credit, licence: p.image.licence ?? null },
            body: p.body,
            reflection: p.reflection ?? null,
            source: p.source,
            url: `https://stellaraspace.com/discoveries`,
            universeUrl: `https://stellaraspace.com/?pin=${encodeURIComponent(p.id)}`,
          },
          null,
          2,
        ),
      });
    },
  };
}

const port = Number(process.env.PORT) || 3000;
const basePath = process.env.BASE_PATH || '/';
const apiUrl = process.env.API_URL || 'https://intuitive-reflection-production.up.railway.app';

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    pageMeta(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
        secure: true,
      }
    },
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
        secure: true,
      }
    },
  },
});
