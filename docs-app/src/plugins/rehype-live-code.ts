import { visit } from 'unist-util-visit';

/**
 * Rehype plugin to transform live code blocks into LiveDemo component placeholders
 * This runs after markdown is converted to HTML
 */
export function rehypeLiveCode() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      // Look for code blocks with 'live' class
      if (node.tagName === 'pre' && node.children) {
        const codeNode = node.children.find((child: any) => child.tagName === 'code');
        
        if (!codeNode || !codeNode.properties) {
          return;
        }

        const classes = codeNode.properties.className || [];
        const hasLive = classes.some((cls: string) => cls.includes('live'));
        
        if (!hasLive) {
          return;
        }

        // Extract the language/format
        const langClass = classes.find((cls: string) => cls.startsWith('language-'));
        const format = langClass ? langClass.replace('language-', '').replace(/\s+live.*/, '').trim() : 'hbs';
        
        // Extract the code content
        const codeContent = codeNode.children && codeNode.children[0] && codeNode.children[0].value || '';
        
        // Replace with a placeholder div that will be hydrated on the client
        const replacement = {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['live-demo-placeholder'],
            'data-code': Buffer.from(codeContent).toString('base64'),
            'data-format': format
          },
          children: []
        };
        
        if (parent && typeof index === 'number') {
          parent.children[index] = replacement;
        }
      }
    });
  };
}
