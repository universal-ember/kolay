# Customizing rendering

Everything the api-docs components render is plain HTML with stable `typedoc__*` class names, colored through a small set of CSS variables. Restyling is entirely your app's CSS — there is no kolay configuration involved.

## Colors

Names, types, parameters, and structure each get their own color, so a signature scans like highlighted code. Each is a CSS variable — set them on `:root` (or any ancestor of the rendered docs) to retheme:

| variable | colors | default (light · dark) |
| --- | --- | --- |
| `--kolay-typedoc-name` | member & declaration names | `#0550ae` · `#79c0ff` |
| `--kolay-typedoc-type` | type references (classes, interfaces, components) | `#6639ba` · `#d2a8ff` |
| `--kolay-typedoc-builtin` | intrinsics & literals (`string`, `number`, `"value"`) | `#116329` · `#7ee787` |
| `--kolay-typedoc-param` | function parameter names | `#953800` · `#ffa657` |
| `--kolay-typedoc-punctuation` | structure — `:` `( ) =>` `\|` `< >` | `#59636e` · `#9198a1` |
| `--kolay-typedoc-comment` | doc comments inside type shapes | your `--pico-muted-color`, else muted text |

The defaults are `light-dark()` aware, following your page's `color-scheme`. Chip borders and backgrounds derive from `currentColor`, so they tint along with whatever colors you choose.

Variables scope like any CSS — set them inline to retheme one rendering (here, `isActive` from this site's own api docs):

```html
<div style="--kolay-typedoc-name: mediumvioletred; --kolay-typedoc-param: rebeccapurple; --kolay-typedoc-builtin: teal">
  <APIDocs @package="kolay" @module="declarations/browser" @name="isActive" />
</div>
```

<div style="--kolay-typedoc-name: mediumvioletred; --kolay-typedoc-param: rebeccapurple; --kolay-typedoc-builtin: teal">
  <APIDocs @package="kolay" @module="declarations/browser" @name="isActive" />
</div>

## Beyond colors

The markup itself is fair game — every element carries a `typedoc__*` class. The layout follows one reading model:

- **Member rows** (a class's members, a signature's args): name on the left, type on the right, comment beneath. Below `40rem` they stack.
- **Type positions** (everything right of a `:`): code-like flow — `Name<Arg>`, `a | b`, `(name: Type) => Return`, object shapes as indented `name: type` lines.

A few useful hooks:

```css
/* the root declaration's name (rendered as a heading line) */
section > .typedoc__declaration > .typedoc__declaration-name {
  font-size: 1.5rem;
}

/* square chips instead of rounded */
.typedoc__intrinsic,
.typedoc__literal,
.typedoc__reference__name {
  border-radius: 0;
}
```
