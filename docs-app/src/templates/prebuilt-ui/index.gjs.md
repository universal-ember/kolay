# Prebuilt docs UI

[GitHub](https://github.com/universal-ember/ember-primitives/tree/main/packages/docs-support) · [npm](https://www.npmjs.com/package/@universal-ember/docs-support)

kolay supplies headless building blocks. This site builds its own UI from them, which the [Development](/development/rendering-pages) section explains. To start from a finished docs UI, use `@universal-ember/docs-support`. [ember-primitives](https://ember-primitives.pages.dev), [universal-ember/form](https://github.com/universal-ember/form), and the other universal-ember projects use it for their kolay docs sites.

Two components make the complete site:

- `<Shell>` wraps the app. It brings in all of the site CSS: the prose typography, the shiki code-fence themes, and the header and nav styles. It also keeps the light and dark body classes in step with `ember-primitives/color-scheme`.
- `<PageLayout>` is the complete docs page. It has a sticky header with the `:logoLink` and `:topRight` blocks. It has a side nav that renders your kolay manifest, and that becomes a drawer on a small screen. It also has the `<Page>` of kolay, with all of its parts:
  - a shimmer loader while a page loads and compiles
  - your `:error` block after a failure
  - the prose on success, with the scroll at the top
  - an optional `:editLink` block

There are more components. `<IndexPage>` makes a landing page, and `<Callout>` makes a note in your markdown. There are also `<ThemeToggle>`, `<Article>`, the link components, and the separate error and loader components (`<OopsError>`, `<PageError>`, `<PageLoader>`).

## Wiring it up

The application template wraps everything in the shell:

```gjs
// app/templates/application.gts
import { Shell } from "@universal-ember/docs-support";

<template>
  <Shell>
    {{outlet}}
  </Shell>
</template>
```

The docs route template is one `<PageLayout>`:

```gts
// app/templates/page.gts
import Component from "@glimmer/component";
import { service } from "@ember/service";

import { OopsError, PageLayout } from "@universal-ember/docs-support";
import { meta } from "virtual:kolay/docs/Home";

import { Logo } from "./icons";

function editUrl(currentURL) {
  return `${meta.url}/edit/main/${meta.docsPath}${currentURL.replace(/\.md$/, "")}.gjs.md`;
}

export default class DocsPage extends Component {
  @service router;

  <template>
    <PageLayout>
      <:logoLink>
        <Logo />
      </:logoLink>
      <:error as |error|>
        <OopsError @error={{error}} />
      </:error>
      <:editLink as |Link|>
        <Link @href={{editUrl this.router.currentURL}}>
          Edit this page
        </Link>
      </:editLink>
    </PageLayout>
  </template>
}
```

The edit link comes from the [`meta`](/development/configuring-docs) of the group. The repository URL and the docs path in the repository come from the `package.json` of your repository.

Everything else is normal kolay: `docs()` in the vite config, `setupKolay` in the application route, and `addRoutes` in the router. [Install](/install/index) covers that part.
