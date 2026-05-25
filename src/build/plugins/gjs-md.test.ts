import { describe, expect, test } from 'vitest';

import { createCompiler, mdToGJS } from './gjs-md.js';

const compiler = createCompiler({});

describe('md to gjs', () => {
  test('inlines a single hbs demo as a const + Glimmer invocation', async () => {
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
      }
    );

    // The inlined demo gets a PascalCase const it can be invoked by
    expect(result.code).toContain('const Demo1_repl_1 =');
    // …and the markdown's placeholder div is rewritten to invoke it,
    // preserving the wrapping class so demo CSS still styles the container.
    // content-tag emits the self-closing form for Glimmer invocations.
    expect(result.code).toContain('<div class="repl-sdk__demo"><Demo1_repl_1 /></div>');
    expect(result.code).not.toContain('<div id="repl_1"');
    // Duplicate template-compiler imports are deduped after content-tag's
    // final pass; otherwise the module would have two `template as X` bindings.
    const tplImports = result.code.match(/^import \{ template as /gm) ?? [];
    expect(tplImports.length).toBe(1);
    // No more virtual `kolay/virtual:live:…` modules
    expect(result.code).not.toContain('kolay/virtual:live:');
  });

  test('forwards user scope imports so top-level invocations resolve', async () => {
    const result = await mdToGJS(
      `# Heading

<APIDocs @module="declarations/browser" @name="isCollection" @package="kolay" />`,
      {
        compiler,
        id: 'test.gjs.md',
        scope: `
        import { APIDocs, CommentQuery, ComponentSignature, HelperSignature, ModifierSignature } from 'kolay';
        import { Shadowed } from 'ember-primitives/components/shadowed';
        import { InViewport } from 'ember-primitives/viewport';
        `,
      }
    );

    expect(result.code).toContain(`import { APIDocs`);
    expect(result.code).toContain('<APIDocs @module="declarations/browser"');
  });

  test('non-live code fences round-trip through to highlighted HTML', async () => {
    const result = await mdToGJS(
      `## Usage

\`\`\`ts
import Route from '@ember/routing/route';
\`\`\`
`,
      {
        compiler,
        id: 'test.gjs.md',
        scope: `import { APIDocs } from 'kolay';`,
      }
    );

    expect(result.code).toContain(`<code class="language-ts">`);
    expect(result.code).toContain(`@ember/routing/route`);
  });
});
