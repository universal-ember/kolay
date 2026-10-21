import { describe, expect, test } from 'vitest';

import { wrapDemos } from '../../wrap-demos.js';
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

  test('frontmatter is not rendered', async () => {
    const virtualModulesByMarkdownFile = new Map<string, Map<string, unknown>>();
    const result = await mdToGJS(
      `---
title: Not Rendered
author: someone
---

# Heading

body
`,
      {
        compiler,
        id: 'test.gjs.md',
        virtualModulesByMarkdownFile,
      }
    );

    expect(result.code).not.toContain('Not Rendered');
    expect(result.code).not.toContain('<hr');
    expect(result.code).toMatchInlineSnapshot(`
      "import { template as template_fd9b2463e5f141cfb5666b64daa1f11a } from "@ember/template-compiler";
      export default template_fd9b2463e5f141cfb5666b64daa1f11a(\`<h1 id="heading">Heading</h1>
      <p>body</p>\`, {
          eval () {
              return eval(arguments[0]);
          }
      });
      "
    `);
  });

  describe('with the wrapDemos plugin', () => {
    test('demos are wrapped in the configured scope binding', async () => {
      const framedCompiler = createCompiler({
        rehypePlugins: [[wrapDemos, { componentName: 'DemoFrame' }]],
      });
      const virtualModulesByMarkdownFile = new Map<string, Map<string, unknown>>();
      const result = await mdToGJS(
        `\`\`\`hbs live
<SetupInstructions @src="components/portal-targets.gts" />
\`\`\`
`,
        {
          compiler: framedCompiler,
          id: 'test.gjs.md',
          virtualModulesByMarkdownFile,
          scope: `import { DemoFrame } from '#src/demo-frame.gts';`,
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { template as template_fd9b2463e5f141cfb5666b64daa1f11a } from "@ember/template-compiler";
        import { DemoFrame } from '#src/demo-frame.gts';
        import repl_2 from 'kolay/virtual:live:repl_2.gjs.hbs';
        export default template_fd9b2463e5f141cfb5666b64daa1f11a(\`<DemoFrame><div id="repl_2" class="repl-sdk__demo"><repl_2 /></div></DemoFrame>\`, {
            eval () {
                return eval(arguments[0]);
            }
        });
        "
      `);
    });

    test('eachDemo.exclude skips demos with that fence meta word', async () => {
      const excludingCompiler = createCompiler({
        rehypePlugins: [
          [wrapDemos, { componentName: 'DemoFrame', eachDemo: { exclude: 'no-frame' } }],
        ],
      });
      const virtualModulesByMarkdownFile = new Map<string, Map<string, unknown>>();
      const result = await mdToGJS(
        `\`\`\`hbs live
<First />
\`\`\`

\`\`\`hbs live no-frame
<Second />
\`\`\`
`,
        {
          compiler: excludingCompiler,
          id: 'test.gjs.md',
          virtualModulesByMarkdownFile,
          scope: `import { DemoFrame } from '#src/demo-frame.gts';`,
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { template as template_fd9b2463e5f141cfb5666b64daa1f11a } from "@ember/template-compiler";
        import { DemoFrame } from '#src/demo-frame.gts';
        import repl_3 from 'kolay/virtual:live:repl_3.gjs.hbs';
        import repl_4 from 'kolay/virtual:live:repl_4.gjs.hbs';
        export default template_fd9b2463e5f141cfb5666b64daa1f11a(\`<DemoFrame><div id="repl_3" class="repl-sdk__demo"><repl_3 /></div></DemoFrame>
        <div id="repl_4" class="repl-sdk__demo"><repl_4></repl_4></div>\`, {
            eval () {
                return eval(arguments[0]);
            }
        });
        "
      `);
    });

    test("eachDemo.behavior 'opt-in' wraps only demos with the meta word", async () => {
      const optInCompiler = createCompiler({
        rehypePlugins: [
          [
            wrapDemos,
            { componentName: 'DemoFrame', eachDemo: { behavior: 'opt-in', meta: 'frame' } },
          ],
        ],
      });
      const virtualModulesByMarkdownFile = new Map<string, Map<string, unknown>>();
      const result = await mdToGJS(
        `\`\`\`hbs live frame
<First />
\`\`\`

\`\`\`hbs live
<Second />
\`\`\`
`,
        {
          compiler: optInCompiler,
          id: 'test.gjs.md',
          virtualModulesByMarkdownFile,
          scope: `import { DemoFrame } from '#src/demo-frame.gts';`,
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { template as template_fd9b2463e5f141cfb5666b64daa1f11a } from "@ember/template-compiler";
        import { DemoFrame } from '#src/demo-frame.gts';
        import repl_5 from 'kolay/virtual:live:repl_5.gjs.hbs';
        import repl_6 from 'kolay/virtual:live:repl_6.gjs.hbs';
        export default template_fd9b2463e5f141cfb5666b64daa1f11a(\`<DemoFrame><div id="repl_5" class="repl-sdk__demo"><repl_5 /></div></DemoFrame>
        <div id="repl_6" class="repl-sdk__demo"><repl_6></repl_6></div>\`, {
            eval () {
                return eval(arguments[0]);
            }
        });
        "
      `);
    });
  });

  test('it allows top-level component invocation', async () => {
    const virtualModulesByMarkdownFile = new Map<string, Map<string, unknown>>();
    const result = await mdToGJS(
      `# Heading

<APIDocs @module="declarations/browser" @name="isPageTree" @package="kolay" />`,
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
      <p><APIDocs @module="declarations/browser" @name="isPageTree" @package="kolay" /></p>\`, {
          eval () {
              return eval(arguments[0]);
          }
      });
      "
    `);
  });

  test('handles a big dog with top-level component invocation', async () => {
    const virtualModulesByMarkdownFile = new Map<string, Map<string, unknown>>();
    const result = await mdToGJS(
      `

# \`handlePotentialIndexVisit\`

When using \`addRoutes()\`, navigating to a group URL (e.g. \`/Runtime\`) lands on an index route. If that group doesn't have an explicit index page, the user sees a blank page. \`handlePotentialIndexVisit\` solves this by automatically redirecting to the first page in the group.

## Usage

Call it in the \`beforeModel\` hook of your page route:

\`\`\`ts
// routes/page.ts
import Route from '@ember/routing/route';
import { handlePotentialIndexVisit } from 'kolay';

import type RouterService from '@ember/routing/router-service';

type Transition = ReturnType<RouterService['transitionTo']>;

export default class PageRoute extends Route {
  beforeModel(transition: Transition) {
    handlePotentialIndexVisit(this, transition);
  }
}
\`\`\`

This pairs with \`addRoutes()\` in your router:

\`\`\`js
import { addRoutes } from 'kolay';

Router.map(function () {
  addRoutes(this);
});
\`\`\`

When a user visits \`/Runtime\` and the \`Runtime\` group has pages, they'll be redirected to the first page (e.g. \`/Runtime/docs/component-signature.md\`) instead of seeing a blank index.

## API Reference

<APIDocs @module="declarations/browser" @name="handlePotentialIndexVisit" @package="kolay" />
`,
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
      export default template_fd9b2463e5f141cfb5666b64daa1f11a(\`<h1 id="handlepotentialindexvisit"><code>handlePotentialIndexVisit</code></h1>
      <p>When using <code>addRoutes()</code>, navigating to a group URL (e.g. <code>/Runtime</code>) lands on an index route. If that group doesn't have an explicit index page, the user sees a blank page. <code>handlePotentialIndexVisit</code> solves this by automatically redirecting to the first page in the group.</p>
      <h2 id="usage">Usage</h2>
      <p>Call it in the <code>beforeModel</code> hook of your page route:</p>
      <div class="repl-sdk__snippet" data-repl-output><pre><code class="language-ts">// routes/page.ts
      import Route from '@ember/routing/route';
      import { handlePotentialIndexVisit } from 'kolay';

      import type RouterService from '@ember/routing/router-service';

      type Transition = ReturnType&#x3C;RouterService['transitionTo']>;

      export default class PageRoute extends Route {
        beforeModel(transition: Transition) {
          handlePotentialIndexVisit(this, transition);
        }
      }
      </code></pre></div>
      <p>This pairs with <code>addRoutes()</code> in your router:</p>
      <div class="repl-sdk__snippet" data-repl-output><pre><code class="language-js">import { addRoutes } from 'kolay';

      Router.map(function () {
        addRoutes(this);
      });
      </code></pre></div>
      <p>When a user visits <code>/Runtime</code> and the <code>Runtime</code> group has pages, they'll be redirected to the first page (e.g. <code>/Runtime/docs/component-signature.md</code>) instead of seeing a blank index.</p>
      <h2 id="api-reference">API Reference</h2>
      <p><APIDocs @module="declarations/browser" @name="handlePotentialIndexVisit" @package="kolay" /></p>\`, {
          eval () {
              return eval(arguments[0]);
          }
      });
      "
    `);
  });
});
