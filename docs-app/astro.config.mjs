import { defineConfig } from 'astro/config';
import { ember } from 'ember-astro';
import mdx from '@astrojs/mdx';
import { kolay } from 'kolay/vite';
import info from 'unplugin-info/vite';
import { remarkLiveCode } from './src/plugins/remark-live-code.ts';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [ember(), mdx({
    remarkPlugins: [remarkLiveCode]
  })],
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
