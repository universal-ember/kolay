import { visit } from 'unist-util-visit';
import { relative, dirname } from 'path';

/**
 * Remark plugin to transform live code blocks into LiveDemo component invocations
 */
export function remarkLiveCode() {
  return (tree, file) => {
    let hasLiveBlocks = false;

    visit(tree, 'code', (node, index, parent) => {
      // Check if this is a live code block
      const meta = node.meta || '';
      const lang = node.lang || '';
      
      if (!meta.includes('live') && !lang.includes('live')) {
        return;
      }

      hasLiveBlocks = true;

      // Extract the component code and language
      const code = node.value.trim();
      // Get the language/format from the code fence (e.g., 'hbs', 'gjs', 'glimdown')
      // The language is in 'lang', and 'live' is in 'meta'
      const format = lang.trim() || 'hbs';
      
      // Replace with MDX JSX element
      const replacement = {
        type: 'mdxJsxFlowElement',
        name: 'LiveDemoWrapper',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'code',
            value: code
          },
          {
            type: 'mdxJsxAttribute',
            name: 'format',
            value: format
          }
        ],
        children: [],
        data: {
          _mdxExplicitJsx: true
        }
      };
      
      if (parent && typeof index === 'number') {
        parent.children[index] = replacement;
      }
    });

    // Add import for LiveDemoWrapper at the beginning if we found live blocks
    if (hasLiveBlocks) {
      // Calculate relative path from current file to components directory
      const filePath = file.history[0] || file.path || '';
      const fileDir = dirname(filePath);
      const componentsPath = fileDir.replace(/.*\/src\/pages/, '../../../src/components') + '/../../../src/components/LiveDemoWrapper.astro';
      
      // Simplify the path - count directory depth and use appropriate number of ../
      const depth = (filePath.match(/src\/pages\//g) || []).length + (filePath.split('/').slice(filePath.split('/').indexOf('pages') + 1).length - 1);
      const relativePath = '../'.repeat(depth) + 'components/LiveDemoWrapper.astro';
      
      tree.children.unshift({
        type: 'mdxjsEsm',
        value: `import LiveDemoWrapper from '${relativePath}';`,
        data: {
          estree: {
            type: 'Program',
            body: [{
              type: 'ImportDeclaration',
              specifiers: [{
                type: 'ImportDefaultSpecifier',
                local: {
                  type: 'Identifier',
                  name: 'LiveDemoWrapper'
                }
              }],
              source: {
                type: 'Literal',
                value: relativePath,
                raw: `'${relativePath}'`
              }
            }],
            sourceType: 'module',
            comments: []
          }
        }
      });
    }
  };
}
