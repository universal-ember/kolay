import { visit } from 'unist-util-visit';

/**
 * Remark plugin to transform live code blocks into component invocations
 * 
 * This extracts live code blocks and replaces them with imports of a LiveDemo component
 */
export function remarkLiveCode() {
  return (tree, file) => {
    const components = [];
    let componentCounter = 0;

    visit(tree, 'code', (node, index, parent) => {
      // Check if this is a live code block
      const meta = node.meta || '';
      const lang = node.lang || '';
      
      if (!meta.includes('live') && !lang.includes('live')) {
        return;
      }

      // Extract the component code
      const code = node.value.trim();
      
      // Generate a unique ID for this live block
      componentCounter++;
      const componentId = `live_${componentCounter}`;
      
      // Store the component code
      components.push({
        id: componentId,
        code: code
      });
      
      // Replace the code block with a LiveDemo component invocation
      // Pass the code as a prop
      const replacement = {
        type: 'mdxJsxFlowElement',
        name: 'LiveDemo',
        attributes: [{
          type: 'mdxJsxAttribute',
          name: 'code',
          value: code
        }, {
          type: 'mdxJsxAttribute',
          name: 'client:only',
          value: 'ember'
        }],
        children: []
      };
      
      if (parent && typeof index === 'number') {
        parent.children[index] = replacement;
      }
    });

    // Add import for LiveDemo component at the beginning
    if (components.length > 0) {
      tree.children.unshift({
        type: 'mdxjsEsm',
        value: "import LiveDemo from '../components/LiveDemo.gts';",
        data: {
          estree: {
            type: 'Program',
            body: [{
              type: 'ImportDeclaration',
              specifiers: [{
                type: 'ImportDefaultSpecifier',
                local: {
                  type: 'Identifier',
                  name: 'LiveDemo'
                }
              }],
              source: {
                type: 'Literal',
                value: '../components/LiveDemo.gts',
                raw: "'../components/LiveDemo.gts'"
              }
            }],
            sourceType: 'module'
          }
        }
      });
    }
  };
}
