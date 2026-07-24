# Renaming pages

By default, a page's nav entry is derived from its file name. To display something else, place a json file next to the page, named after it:

```
docs/
  utilities/
    selected.gjs.md
    selected.json
```

Any keys in that file are merged into the page's manifest entry. The convention for display names is `componentName`:

```jsonc
// selected.json
{ "componentName": "selected(...)" }
```

Your nav decides how to use it — this site's `nameFor` helper, passed to [`<PageNav />`](/Runtime/navigation/page-nav.md), looks like:

```js
export function nameFor(page) {
  if ("componentName" in page) {
    return `${page.componentName}`;
  }

  return sentenceCase(page.name);
}
```

That is how the [Runtime](/Runtime/rendering/page.md) and [TypeDoc](/TypeDoc/components/api-docs.md) sections show invocation-style names like `selected(...)` and `<APIDocs />`.

(For _ordering_ pages, see [Ordering pages](/development/ordering-pages.md) — that's a `meta.json` per folder, not a per-page file.)

## Nav-only links

A json file with an `href` — and no markdown file of its own — becomes a nav entry that is just a link. It participates in naming and ordering like any page, but points wherever the `href` says, e.g. a page in another group:

```jsonc
// development/configuring-typedoc.json
{
  "href": "/TypeDoc/plugin/typedoc.md",
  "componentName": "Configuring typedoc(...)",
}
```

That file produces the "Configuring typedoc(...)" entry in this very section — it links over to the TypeDoc group.

The `href` is written app-relative (as if the app were deployed at `/`); the app's `rootURL` is applied automatically, the same as for authored links.
