---
layout: ../../layouts/MarkdownLayout.astro
title: Ordering Pages
---

## Ordering

At build time, the order of both pages and folders can be configured by providing a `meta.json` or `meta.jsonc` file as a sibling to the list of paths you want to sort.

### Sorting folders

For example, in this project, the docs are in folders in `public/docs`:

```
public/
  docs/
    plugins/
    usage/
```

But we want `usage` to come before `plugins`, even though alphabetically, `plugins` comes before `usage`.

We can create a `meta.jsonc` file at `public/docs/meta.jsonc`:

```jsonc
{
  // We want usage to be first, which breaks the
  // default sort order provided by the filesystem: Alphabetical
  "order": ["usage", "plugins"],
}
```

With `jsonc`, we can have comments to explain our reasoning for having configuration at all, and now when rendering the navigation at runtime, we can have `Usage` rendered above `Plugins` without needing to implement any runtime code to do this for us.

### Sorting pages

For example, in this project, the pages under `usage` appear alphabetically in the filesystem like this:

```
public/
  docs/
    usage/
      ordering-pages.md
      rendering-pages.md
      setup.md
```

Alphabetical ordering in this case is backwards from how it is _useful_ to read about the information contained within these documents.

To sort these pages, we can create a `meta.json` file at `public/docs/usage/meta.jsonc` with the following contents:

```jsonc
{
  // This is in order of need-to-know
  "order": ["setup", "rendering-pages", "ordering-pages"],
}
```

And then the order of these pages is adjusted so that at runtime, there is nothing to do! 🥳
