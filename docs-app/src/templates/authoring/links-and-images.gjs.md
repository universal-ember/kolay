# Links and images

Pages link to each other with regular markdown links, using root-absolute paths. A page's path is its group name followed by its location within the group's `src` directory (pages in the main app's templates have no group prefix):

```md
See the [install guide](/install/index.md) for installation, or
[The DocsManager service](/Runtime/utilities/docs-manager.md).
```

Root-absolute paths are always written as if the app were deployed at `/`. When the app is served under a custom `rootURL` (a preview deploy at `/pr-1234/`, a docs site at `/my-lib/`, …), kolay rebases these paths onto the `rootURL` when the page compiles (in the browser for `.md` pages, at build time for `.gjs.md` pages) — authored content never needs to know where the app is deployed. This covers markdown link/image syntax as well as `href`/`src` attributes in raw inline HTML.

## Co-located images

Images can live next to the markdown files that use them and be referenced relatively:

```md
![The Ember Tomster](./ember-tomster.svg)
```

Kolay serves these co-located assets during development and copies them into the production build at the same URLs, so references work identically in both. Root-absolute references work too — an asset's URL is the group name followed by its path within the group's `src` directory (assets co-located with the main app's pages in `src/templates` / `app/templates` have no group prefix):

```md
![The Ember Tomster](/Runtime/sub-folder/ember-tomster.svg)
```

Recognized asset extensions (case-insensitive): `svg`, `png`, `jpg`, `jpeg`, `gif`, `webp`, `avif`.
