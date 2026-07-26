# Prebuilt docs UI

[GitHub](https://github.com/universal-ember/ember-primitives/tree/main/packages/docs-support) · [npm](https://www.npmjs.com/package/@universal-ember/docs-support)

kolay ships headless building blocks — this site assembles its own UI from them (that's what the [Development](/development/rendering-pages) section walks through). If you'd rather start from a finished docs UI, `@universal-ember/docs-support` is the prebuilt one: it is what [ember-primitives](https://ember-primitives.pages.dev), [universal-ember/form](https://github.com/universal-ember/form), and the other universal-ember projects use for their kolay-powered docs sites.

Two components carry the whole site:

- `<Shell>` wraps the app. It pulls in the full site CSS — prose typography, shiki code-fence themes, header and nav chrome — and keeps the light/dark body classes in sync with `ember-primitives/color-scheme`.
- `<PageLayout>` is the whole docs page: a sticky header with `:logoLink` and `:topRight` blocks, a responsive side nav (a drawer on small screens) rendering your kolay manifest, and kolay's `<Page>` fully wired — a shimmer loader while a page loads and compiles, your `:error` block when something fails, the rendered prose (with scroll reset) on success, and an optional `:editLink` block.

Alongside them: `<IndexPage>` for a landing page, `<Callout>` for asides in your markdown, `<ThemeToggle>`, `<Article>`, link components, and the standalone error/loader pieces (`<OopsError>`, `<PageError>`, `<PageLoader>`).

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

and the docs route template is one `<PageLayout>`:

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

(The edit link builds from the group's [`meta`](/development/configuring-docs) — the repository URL and the repo-relative docs path come from your repository's own package.json.)

Everything else is regular kolay: `docs()` in the vite config, `setupKolay` in the application route, `addRoutes` in the router — [Install](/install/index) covers that part.
