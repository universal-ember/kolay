# Markdown features

Pages are standard [CommonMark](https://commonmark.org/), plus the extensions below — available in both `.md` and `.gjs.md` files. For interactive demos, see [Code fences](/authoring/code-fences.md); for extending this list, see [Extending markdown](/authoring/extending-markdown.md).

## GitHub Flavored Markdown

[GFM](https://github.github.com/gfm/) is enabled by default.

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

Both `~~double~~` and `~single~` tildes work: ~~double~~, ~~single~~.

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

[^definition]: it's in the name — "kolay" is Turkish for "easy".
```

Kolay is easy[^definition].

[^definition]: it's in the name — "kolay" is Turkish for "easy".

## Heading anchors

Every heading gets an id derived from its text, so headings are linkable with `#fragment` URLs. To choose the id yourself, add `{#custom-id}` at the end of the heading:

```md
## A very long heading nobody wants to link to verbatim {#short-id}
```

## Components in prose

Anything capitalized (PascalCase) in your prose is invoked as a component — no code fence needed. Which components are available is controlled by [scope](/authoring/code-fences.md#whats-in-scope): the `topLevelScope` passed to `setupKolay()` for `.md` files, or imports (including the `scope` build option) for `.gjs.md` files.

```md
## API Reference

<APIDocs @package="kolay" @module="declarations/browser" @name="selected" />
```

This is how every "API Reference" section on this site works.

## Raw HTML

Inline HTML passes through, including attributes and styles — the [Install](/install/index.md) page's header is plain HTML in markdown:

```md
<small><code>adjective</code></small>
```

---

> **Want more?** This page is only what's built in. Syntax highlighting, callouts, custom transforms — anything from the remark/rehype ecosystems can be added: see [Extending markdown](/authoring/extending-markdown.md) (including the shiki setup this site uses).
