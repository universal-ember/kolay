import { defineConfig } from 'kolay/vite';

export default defineConfig({
  redirects: [
    { from: 'Old/*', to: 'New/*' },
    { from: 'legacy/page', to: 'modern/page' },
  ],
});
