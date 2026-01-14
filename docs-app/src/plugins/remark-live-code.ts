import { visit } from 'unist-util-visit';

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

      // Extract the component code
      const code = node.value.trim();
      
      // Replace with MDX JSX element
      const replacement = {
        type: 'mdxJsxFlowElement',
        name: 'LiveDemoWrapper',
        attributes: [{
          type: 'mdxJsxAttribute',
          name: 'code',
          value: code
        }],
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
      tree.children.unshift({
        type: 'mdxjsEsm',
        value: "import LiveDemoWrapper from '../../components/LiveDemoWrapper.astro';",
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
                value: '../../components/LiveDemoWrapper.astro',
                raw: "'../../components/LiveDemoWrapper.astro'"
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
