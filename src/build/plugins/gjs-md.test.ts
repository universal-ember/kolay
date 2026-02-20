import { describe, expect, test } from 'vitest';

import { createCompiler, mdToGJS } from './gjs-md.js';

const compiler = createCompiler({});

describe('md to gjs', () => {
  test('it works', async () => {
    const virtualModulesByMarkdownFile = new Map<string, Map<string, unknown>>();
    const result = await mdToGJS(
      `# Heading

inline code \`<Portal @to="popover">\`

## code fence

\`\`\`hbs live
<SetupInstructions @src="components/portal-targets.gts" />
\`\`\`
`,
      {
        compiler,
        id: 'test.gjs.md',
        virtualModulesByMarkdownFile,
      }
    );

    expect(virtualModulesByMarkdownFile).toMatchInlineSnapshot(`
      Map {
        "test.gjs.md" => Map {
          "kolay/virtual:live:repl_1.gjs.hbs" => {
            "code": "<SetupInstructions @src="components/portal-targets.gts" />",
            "flavor": null,
            "format": "hbs",
            "meta": "live",
            "placeholderId": "repl_1",
          },
        },
      }
    `);
    expect(result.code).toMatchInlineSnapshot(`
      "import { template as template_fd9b2463e5f141cfb5666b64daa1f11a } from "@ember/template-compiler";
      import repl_1 from 'kolay/virtual:live:repl_1.gjs.hbs';
      export default template_fd9b2463e5f141cfb5666b64daa1f11a(\`<h1 id="heading">Heading</h1>
      <p>inline code <code>&#x3C;Portal @to="popover"></code></p>
      <h2 id="code-fence">code fence</h2>
      <div id="repl_1" class="repl-sdk__demo"><repl_1></repl_1></div>\`, {
          eval () {
              return eval(arguments[0]);
          }
      });
      "
    `);
  });

  test('it allows top-level component invocation', async () => {
    const virtualModulesByMarkdownFile = new Map<string, Map<string, unknown>>();
    const result = await mdToGJS(
      `# Heading

<APIDocs @module="declarations/browser" @name="isCollection" @package="kolay" />`,
      {
        compiler,
        id: 'test.gjs.md',
        virtualModulesByMarkdownFile,
        scope: `
        import { APIDocs, CommentQuery, ComponentSignature, HelperSignature, ModifierSignature } from 'kolay';
        import { Shadowed } from 'ember-primitives/components/shadowed';
        import { InViewport } from 'ember-primitives/viewport';
        `,
      }
    );

    expect(virtualModulesByMarkdownFile).toMatchInlineSnapshot(`
      Map {
        "test.gjs.md" => Map {},
      }
    `);
    expect(result.code).toMatchInlineSnapshot(`
      "import { template as template_fd9b2463e5f141cfb5666b64daa1f11a } from "@ember/template-compiler";
      import { APIDocs, CommentQuery, ComponentSignature, HelperSignature, ModifierSignature } from 'kolay';
      import { Shadowed } from 'ember-primitives/components/shadowed';
      import { InViewport } from 'ember-primitives/viewport';
      export default template_fd9b2463e5f141cfb5666b64daa1f11a(\`<h1 id="heading">Heading</h1>
      <p><APIDocs @module="declarations/browser" @name="isCollection" @package="kolay" /></p>\`, {
          eval () {
              return eval(arguments[0]);
          }
      });
      "
    `);
  });
});
