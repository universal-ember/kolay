#!/usr/bin/env node

/**
 * Pre-generate the manifest for Astro SSG
 * This runs before the Astro build to ensure the manifest exists
 */

import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';

// Simulate what the kolay plugin does
async function generateManifest() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const projectRoot = resolve(__dirname, '..');
  
  // Import the discover function from kolay's plugin
  const { discover } = await import('../../src/build/plugins/markdown-pages/discover.js');
  
  const manifest = await discover({
    src: join(projectRoot, 'public/docs'),
    groups: [
      {
        name: 'Runtime',
        src: join(projectRoot, '..', 'docs'),
      },
    ],
  });
  
  // Write the manifest to public/docs/manifest.json
  const manifestDir = join(projectRoot, 'public/docs');
  mkdirSync(manifestDir, { recursive: true });
  
  const manifestPath = join(manifestDir, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log('✓ Generated manifest at:', manifestPath);
  console.log('  Groups:', manifest.groups.map(g => g.name).join(', '));
  console.log('  Total pages:', manifest.groups.reduce((sum, g) => sum + g.list.length, 0));
}

generateManifest().catch(error => {
  console.error('Failed to generate manifest:', error);
  process.exit(1);
});
