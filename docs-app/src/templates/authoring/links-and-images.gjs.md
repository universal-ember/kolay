# Links and images

A page links to another page with a normal markdown link and a root-absolute path. The path of a page is its group name, then its location in the `src` directory of the group. A page in the templates of the main app has no group prefix:

```md
See the [install guide](/install/index.md) for installation, or
[The DocsManager service](/Runtime/utilities/docs-manager.md).
```

This renders as:

> See the [install guide](/install/index.md) for installation, or
> [The DocsManager service](/Runtime/utilities/docs-manager.md).

Write a root-absolute path as if the app were deployed at `/`. The app can be served under a custom `rootURL`, for example a preview deploy at `/pr-1234/`, or a docs site at `/my-lib/`. Kolay then rebases these paths onto the `rootURL` when the page compiles. A `.md` page compiles in the browser, and a `.gjs.md` page compiles at build time. Your content does not need to know where the app is deployed. This applies to markdown link and image syntax, and to the `href` and `src` attributes in raw inline HTML.

## Co-located images

An image can be next to the markdown file that uses it, with a relative reference. This page has a `kolay-logo.svg` next to it:

```md
![the kolay logo](./kolay-logo.svg)
```

![the kolay logo](./kolay-logo.svg)

Kolay serves these co-located assets in development. It copies them into the production build at the same URLs, so a reference works the same in both. A root-absolute reference also works. The URL of an asset is the group name, then its path in the `src` directory of the group. An asset next to the pages of the main app, in `src/templates` or `app/templates`, has no group prefix:

```md
![the kolay logo, root-absolute](/authoring/kolay-logo.svg)
```

![the kolay logo, root-absolute](/authoring/kolay-logo.svg)

Kolay recognizes these asset extensions, in lower case or upper case: `svg`, `png`, `jpg`, `jpeg`, `gif`, `webp`, `avif`.
