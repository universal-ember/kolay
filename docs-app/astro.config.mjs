import { defineConfig } from 'astro/config';
import { ember } from 'ember-astro';
import mdx from '@astrojs/mdx';
import { kolay } from 'kolay/vite';
import info from 'unplugin-info/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [ember(), mdx()],
  vite: {
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
