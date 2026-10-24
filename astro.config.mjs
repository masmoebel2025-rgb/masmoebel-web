// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://masmoebel.es',
  output: 'server',
  adapter: netlify(),
  // Oficios vive en su propia dirección (src/lib/oficios-host.ts): en el sitemap va esa, no masmoebel.es/oficios/
  integrations: [sitemap({
    filter: (pagina) => !pagina.startsWith('https://masmoebel.es/oficios'),
    customPages: ['https://oficios.masmoebel.es/'],
  })],
  vite: {
    plugins: [tailwindcss()],
    css: {
      transformInline: false
    }
  }
});
