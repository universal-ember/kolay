const doc = `

# PortalTargets

You can reference these defaults by passing their names to \`<Portal @to="popover">\`, \`<Portal @to="tooltip">\`, or \`<Portal @to="modal">\`.

## Install

\`\`\`hbs live
<SetupInstructions @src="components/portal-targets.gts" />
\`\`\`
`;

import { describe, expect, test } from 'vitest';

import { createCompiler, mdToGJS } from './gjs-md.js';

describe('md to gjs', () => {
  test('it works', async () => {
    const compiler = createCompiler({});

    const virtualModulesByMarkdownFile = new Map<string, Map<string, unknown>>();
    const result = await mdToGJS(doc, {
      compiler,
      id: 'test.gjs.md',
      virtualModulesByMarkdownFile,
    });

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
      export default template_fd9b2463e5f141cfb5666b64daa1f11a(\`<h1 id="portal-targets">PortalTargets</h1>
      <p>You can reference these defaults by passing their names to <code>&lt;Portal @to="popover"></code>, <code>&lt;Portal @to="tooltip"></code>, or <code>&lt;Portal @to="modal"></code>.</p>
      <h2 id="install">Install</h2>
      <div id="repl_1" class="repl-sdk__demo"><repl_1></repl_1></div>\`, {
          eval () {
              return eval(arguments[0]);
          }
      });
      "
    `);
  });
});
