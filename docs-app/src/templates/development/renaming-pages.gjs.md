# Renaming pages

By default, a page's nav entry is derived from its file name. To display something else, place a json file next to the page, named after it:

```
docs/
  utilities/
    selected.gjs.md
    selected.json
```

Any keys in that file are merged into the page's manifest entry. The link text is `title`:

```jsonc
// selected.json
{ "title": "selected(...)" }
```

Your nav decides how to use it — this site's `nameFor` helper, passed to [`<PageNav />`](/Runtime/navigation/page-nav.md), looks like:

```js
export function nameFor(page) {
  if (page.title) {
    return page.title;
  }

  return sentenceCase(page.name);
}
```

That is how the [Runtime](/Runtime/rendering/page.md) and [TypeDoc](/TypeDoc/components/api-docs.md) sections show invocation-style names like `selected(...)` and `<APIDocs />`.

(For _ordering_ pages, see [Ordering pages](/development/ordering-pages.md) — that's a `meta.json` per folder, not a per-page file.)

## Nav-only links

A json file with an `href` — and no markdown file of its own — becomes a nav entry that is just a link. It participates in naming and ordering like any page, but points wherever the `href` says, e.g. a page in another group:

```jsonc
// development/configuring-api-docs.json
{
  "href": "/TypeDoc/plugin/api-docs.md",
  "title": "Configuring apiDocs(...)",
}
```

That file produces the "Configuring apiDocs(...)" entry in this very section — it links over to the TypeDoc group.

The `href` is written app-relative (as if the app were deployed at `/`); the app's `rootURL` is applied automatically, the same as for authored links.

Since these entries take the reader somewhere else — a different group, or a different site entirely — you may want to mark them visually. Everything from the page's json is on the manifest entry your nav blocks receive, so the presence of `href` is the signal. This site's `<PageNav />` `:page` block:

```gjs
<x.Link data-link-entry={{if x.page.href "true"}}>
  {{nameFor x.page}}
</x.Link>
```

The marker is then just CSS. This site draws the same arrow icon its other external links use — as a `mask`, because a literal `↗` character renders as an emoji on some platforms:

```css
nav a[data-link-entry]::after {
  content: "";
  display: inline-block;
  width: 0.7em;
  height: 0.7em;
  margin-left: 0.4em;
  background-color: var(--pico-muted-color);
  /* the arrow SVG, elided here — any icon works */
  mask: url("data:image/svg+xml,…") no-repeat center / contain;
}
```
