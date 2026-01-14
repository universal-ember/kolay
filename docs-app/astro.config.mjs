import { defineConfig } from 'astro/config';
import { ember } from 'ember-astro';
import node from '@astrojs/node';
import { kolay } from 'kolay/vite';
import info from 'unplugin-info/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [ember()],
  vite: {
    resolve: {
      alias: {
        'kolay': path.resolve(__dirname, '../dist/browser'),
        'kolay/components': path.resolve(__dirname, '../dist/browser/components.js'),
      },
    },
    plugins: [
      info(),
      kolay({
        src: 'public/docs',
        groups: [
          {
            name: 'Runtime',
            src: './node_modules/kolay/docs',
          },
        ],
        packages: ['kolay', 'ember-primitives', 'ember-resources'],
      }),
    ],
  },
});
