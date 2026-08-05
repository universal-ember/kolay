import rehypeShiki from '@shikijs/rehype';

export default {
  // Shared by every docs group below. Carries plugin functions, so it
  // needs a JS config form (JSON forms can only hold data).
  markdownOptions: {
    rehypePlugins: [
      [
        rehypeShiki,
        {
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
          defaultColor: 'light-dark()',
        },
      ],
    ],
    scope: `
    import { APIDocs, CommentQuery, ComponentSignature, HelperSignature, ModifierSignature } from 'kolay';
    import { Shadowed } from 'ember-primitives/components/shadowed';
    import { InViewport } from 'ember-primitives/viewport';
    `,
  },

  docs: [
    { name: 'Runtime', src: '../docs' },
    { name: 'TypeDoc', src: '../docs-typedoc' },
  ],

  apiDocs: ['kolay', 'ember-primitives', 'ember-resources', 'ember-repl'],

  // live codefences import these as '#demos/site/*'
  demos: [{ src: './demos', as: '#demos/site' }],

  // .md fences can import ember-primitives with no modules config
  importEntrypoints: ['ember-primitives'],

  // Old URLs from previous arrangements of this docs site.
  // The Development page about redirects uses a few of these as its examples.
  redirects: [
    // 2026-01: the TypeDoc component pages moved from /docs into their own group
    { from: 'docs/*', to: 'TypeDoc/components/*' },
    // 2026-01: the runtime pages moved from /util into the Runtime group
    { from: 'util/group-nav', to: 'Runtime/navigation/group-nav.md' },
    { from: 'util/page-nav', to: 'Runtime/navigation/page-nav.md' },
    { from: 'util/page', to: 'Runtime/rendering/page.md' },
    { from: 'util/logs', to: 'Runtime/demo-support/logs.md' },
    // 2026-07: the Home docs were reorganized
    { from: 'usage/setup', to: 'install/index.md' },
    { from: 'usage/authoring', to: 'authoring/index.md' },
    { from: 'usage/rendering-pages', to: 'development/rendering-pages.md' },
    { from: 'usage/ordering-pages', to: 'development/ordering-pages.md' },
    { from: 'usage/testing', to: 'development/testing.md' },
    { from: 'plugins/kolay', to: 'development/configuring-docs.md' },
    { from: 'plugins/docs', to: 'development/configuring-docs.md' },
    { from: 'plugins/helpers', to: 'development/helpers.md' },
    // 2026-07: the Runtime group was reorganized into
    // rendering / navigation / utilities / demo-support
    { from: 'Runtime/util/page', to: 'Runtime/rendering/page.md' },
    { from: 'Runtime/util/compiled-doc', to: 'Runtime/rendering/compiled-doc.md' },
    { from: 'Runtime/util/group-nav', to: 'Runtime/navigation/group-nav.md' },
    { from: 'Runtime/util/page-nav', to: 'Runtime/navigation/page-nav.md' },
    { from: 'Runtime/util/is-active', to: 'Runtime/navigation/is-active.md' },
    {
      from: 'Runtime/util/handle-potential-index-visit',
      to: 'Runtime/navigation/handle-potential-index-visit.md',
    },
    { from: 'Runtime/util/selected', to: 'Runtime/utilities/selected.md' },
    { from: 'Runtime/util/docs-manager', to: 'Runtime/utilities/docs-manager.md' },
    { from: 'Runtime/util/collection-utils', to: 'Runtime/utilities/collection-utils.md' },
    { from: 'Runtime/util/logs', to: 'Runtime/demo-support/logs.md' },
    { from: 'Runtime/docs/owner', to: 'Runtime/demo-support/owner.md' },
  ],
};
