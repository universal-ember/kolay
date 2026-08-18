# Renaming pages

By default, the nav entry of a page comes from its file name. To show a different name, put a json file next to the page, with the same name:

```
docs/
  utilities/
    selected.gjs.md
    selected.json
```

Kolay merges the keys of that file into the manifest entry of the page. The `title` key gives the link text:

```jsonc
// selected.json
{ "title": "selected(...)" }
```

Your nav decides how to use the key. This site gives a `nameFor` helper to [`<PageNav />`](/Runtime/navigation/page-nav.md):

```js
export function nameFor(page) {
  if (page.title) {
    return page.title;
  }

  return sentenceCase(page.name);
}
```

This is how the [Runtime](/Runtime/rendering/page.md) and [TypeDoc](/TypeDoc/components/api-docs.md) sections show names in invocation style, for example `selected(...)` and `<APIDocs />`.

To set the _order_ of the pages, read [Ordering pages](/development/ordering-pages.md). That is one `meta.json` for each folder, and not one file for each page.

## Nav-only links

A json file with an `href`, and with no markdown file, becomes a nav entry that is only a link. It gets its name and its order like any page. But it points to the `href`, for example a page in another group:

```jsonc
// development/configuring-api-docs.json
{
  "href": "/TypeDoc/plugin/api-docs.md",
  "title": "Configuring apiDocs(...)",
}
```

That file makes the "Configuring apiDocs(...)" entry in this section. The entry links to the TypeDoc group.

Write the `href` app-relative, as if the app were deployed at `/`. Kolay applies the `rootURL` of the app for you, as it does for the links that you author.

These entries take the reader to a different group, or to a different site. You can mark them for the reader. The nav blocks receive every key of the page json on the manifest entry, so `href` is the signal. Render an icon in the link when `href` is set. This is the `:page` block of `<PageNav />` on this site:

```gjs
<x.Link>
  {{nameFor x.page}}
  {{#if x.page.href}}
    <LinkEntryIcon />
  {{/if}}
</x.Link>
```

`<LinkEntryIcon />` is a small inline `<svg>`. It is the same arrow that the other external links on this site show. Any icon component works.

<details>
<summary>Do you want to keep your templates as they are? The marker can be CSS only</summary>

Set an attribute from the same signal:

```gjs
<x.Link data-link-entry={{if x.page.href "true"}}>
  {{nameFor x.page}}
</x.Link>
```

Then draw the icon from a stylesheet. A literal `↗` character shows as an emoji on some platforms, so use an SVG `mask`:

```css
nav a[data-link-entry]::after {
  content: "";
  display: inline-block;
  width: 0.7em;
  height: 0.7em;
  margin-left: 0.4em;
  background-color: var(--pico-muted-color);
  /* the arrow SVG, elided here */
  mask: url("data:image/svg+xml,…") no-repeat center / contain;
}
```

</details>
