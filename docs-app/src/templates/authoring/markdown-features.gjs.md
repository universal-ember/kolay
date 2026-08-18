# Markdown features

A page is standard [CommonMark](https://commonmark.org/), with the extensions below. Both `.md` and `.gjs.md` files have them. For demos, read [Code fences](/authoring/code-fences.md). To add to this list, read [Extending markdown](/authoring/extending-markdown.md).

## GitHub Flavored Markdown

[GFM](https://github.github.com/gfm/) is on by default.

### Tables

```md
| Format    | Compiled   |
| --------- | ---------- |
| `.md`     | at runtime |
| `.gjs.md` | at build   |
```

| Format    | Compiled   |
| --------- | ---------- |
| `.md`     | at runtime |
| `.gjs.md` | at build   |

### Strikethrough

A double tilde (`~~double~~`) and a single tilde (`~single~`) both work: ~~double~~, ~~single~~.

### Task lists

```md
- [x] write the docs
- [ ] read the docs
```

- [x] write the docs
- [ ] read the docs

### Autolinks

```md
Bare URLs become links: https://github.com/universal-ember/kolay
```

Bare URLs become links: https://github.com/universal-ember/kolay

### Footnotes

```md
Kolay is easy[^definition].

[^definition]: the name says it. "kolay" is Turkish for "easy".
```

Kolay is easy[^definition].

[^definition]: the name says it. "kolay" is Turkish for "easy".

## Heading anchors

Every heading gets an id from its text, so you can link to a heading with a `#fragment` URL. To choose the id, add `{#custom-id}` at the end of the heading:

```md
## A very long heading nobody wants to link to verbatim {#short-id}
```

## Components in prose

A word in your prose that starts with a capital letter (PascalCase) is a component invocation. No code fence is necessary. [Scope](/authoring/code-fences.md#what-is-in-scope) controls which components are available. For a `.md` file, this is the `topLevelScope` that you give to `setupKolay()`. For a `.gjs.md` file, these are the imports, and the `scope` build option.

```md
## API Reference

<APIDocs @package="kolay" @module="declarations/browser" @name="selected" />
```

This is how every "API Reference" section on this site works.

## Raw HTML

Inline HTML passes through, with its attributes and styles. The header of the [Install](/install/index.md) page is plain HTML in markdown:

```md
<small><code>adjective</code></small>
```

---

> **Want more?** This page shows only the built-in features. You can add syntax highlighting, callouts, and custom transforms from the remark and rehype ecosystems. Read [Extending markdown](/authoring/extending-markdown.md), which includes the shiki setup that this site uses.
