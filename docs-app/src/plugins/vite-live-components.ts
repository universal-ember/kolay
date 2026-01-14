import type { Plugin } from 'vite';

/**
 * Vite plugin to handle virtual live component modules
 * 
 * This creates virtual .gjs files from the live code blocks
 * that can be imported and rendered by ember-astro
 */
export function liveComponentsPlugin(): Plugin {
  const virtualModulePrefix = 'virtual:live-component-';
  const resolvedPrefix = '\0' + virtualModulePrefix;
  
  // Store component code from the remark plugin
  const liveComponents = new Map<string, string>();

  return {
    name: 'vite-live-components',
    
    resolveId(id) {
      if (id.startsWith(virtualModulePrefix)) {
        return '\0' + id;
      }
    },
    
    load(id) {
      if (id.startsWith(resolvedPrefix)) {
        const componentId = id.slice(resolvedPrefix.length);
        const code = liveComponents.get(componentId);
        
        if (code) {
          // Wrap the component code in a proper .gjs format
          // The code should already be a template string like: <APIDocs .../>
          return `
import { template } from '@glimmer/component';

export default template(\`${code.replace(/`/g, '\\`')}\`);
`;
        }
      }
    },
    
    // Hook into the transform to capture live components from MDX processing
    transform(code, id) {
      if (id.endsWith('.md') || id.endsWith('.mdx')) {
        // Extract live components metadata if available
        // This would be populated by the remark plugin
        const match = code.match(/virtual:live-component-(\d+)/g);
        if (match) {
          match.forEach(virtualId => {
            const num = virtualId.split('-').pop();
            // Store placeholder - actual code comes from remark plugin
            if (!liveComponents.has(num)) {
              liveComponents.set(num, '');
            }
          });
        }
      }
      return null;
    },
    
    // Allow updating component code from external sources
    api: {
      setLiveComponent(id: string, code: string) {
        liveComponents.set(id, code);
      }
    }
  };
}
