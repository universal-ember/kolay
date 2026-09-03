# `<PageNav />`

This components provides a `<nav>` for the currently selected `group` (or the default `group` from your build config passed to [`kolay`][kolay-plugin]. On this docs site it's used as the vertical navigation at the left of the page.

[kolay-plugin]: /development/configuring-docs.md

## Blocks

With no blocks, `<PageNav />` renders each folder as a heading linking to its index page, and each page as a link titled by its resolved `title`.

Pass `:page` and `:section` to render your own. This is the default rendering, spelled out — a starting point to change rather than a summary of one:

```gjs
import { PageNav } from 'kolay';

<template>
  <PageNav>
    <:page as |x|>
      <x.Link>{{x.page.title}}</x.Link>
    </:page>

    <:section as |x|>
      {{#if x.index}}
        <x.index.Link>{{x.section.title}}</x.index.Link>
      {{else}}
        {{x.section.title}}
      {{/if}}
    </:section>
  </PageNav>
</template>
```

`x.index` is the folder's index page — the page named `index` when there is one, its first page otherwise — so the `{{else}}` branch is reached only by a folder with no pages at all.

A page the heading already links to under the same title is left out of `:page`, so it is not listed twice.

## Replacing it entirely

The two rules above are public, so a nav of your own can apply the same ones rather than approximating them:

```js
import { getIndexPage, isRedundantWithHeading } from 'kolay';
```

See [page tree utils](/Runtime/utilities/page-tree-utils.gjs.md).

## API Reference

<ComponentSignature
  @package='kolay'
  @name='PageNav'
  @module='declarations/browser/components'
/>
