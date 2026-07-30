import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { defineConfig } from 'vite';

/**
 * Inyecta en index.html el contenido generado desde src/data/site.js.
 *
 * Corre en dev y en build, así que el HTML servido ya trae todo el texto: los
 * buscadores no dependen de ejecutar JS y la página se lee aunque el JS falle,
 * sin duplicar el contenido entre site.js y el HTML.
 */
function contentPlugin() {
  const TOKENS = ['@sections', '@levels', '@jsonld', '@noscript', '@title', '@description'];

  return {
    name: 'levelup-content',
    async transformIndexHtml(html) {
      // Vite compila este config a node_modules/.vite-temp, así que una ruta
      // relativa no resolvería. La query invalida el módulo al editar site.js.
      const modulePath = pathToFileURL(resolve(process.cwd(), 'src/data/render.js'));
      const render = await import(`${modulePath.href}?t=${Date.now()}`);

      const values = {
        '@sections': render.renderSections(),
        '@levels': render.renderLevelNav(),
        '@jsonld': render.renderJsonLd(),
        '@noscript': render.renderNoscript(),
        '@title': render.meta.title,
        '@description': render.meta.description,
      };

      let out = html;
      for (const token of TOKENS) {
        if (!out.includes(`<!--${token}-->`)) {
          throw new Error(`index.html no contiene el marcador <!--${token}-->`);
        }
        out = out.replaceAll(`<!--${token}-->`, values[token]);
      }
      return out;
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [contentPlugin()],
  server: { open: true },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
