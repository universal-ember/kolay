# Customizing rendering

The api docs components render plain HTML with stable `typedoc__*` class names. A small set of CSS variables gives the colors. All of the styles are in the CSS of your app, and kolay has no configuration for them.

## Colors

The names, the types, the parameters, and the structure each have their own color. A signature then reads like code with highlighting. Each color is a CSS variable. To change the theme, set the variables on `:root`, or on any parent of the rendered docs:

| variable | colors | default (light · dark) |
| --- | --- | --- |
| `--kolay-typedoc-name` | member & declaration names | `#0550ae` · `#79c0ff` |
| `--kolay-typedoc-type` | type references (classes, interfaces, components) | `#6639ba` · `#d2a8ff` |
| `--kolay-typedoc-builtin` | intrinsics & literals (`string`, `number`, `"value"`) | `#116329` · `#7ee787` |
| `--kolay-typedoc-param` | function parameter names | `#953800` · `#ffa657` |
| `--kolay-typedoc-punctuation` | structure — `:` `( ) =>` `\|` `< >` | `#59636e` · `#9198a1` |
| `--kolay-typedoc-comment` | doc comments inside type shapes | your `--pico-muted-color`, else muted text |

The default colors use `light-dark()`, so they follow the `color-scheme` of your page. The chip borders and the chip backgrounds come from `currentColor`, so they change with the colors that you choose.

The variables have the same scope rules as any CSS. Set them inline to change the theme of one rendering. The example below uses `isActive` from the api docs of this site:

```html
<div style="--kolay-typedoc-name: mediumvioletred; --kolay-typedoc-param: rebeccapurple; --kolay-typedoc-builtin: teal">
  <APIDocs @package="kolay" @module="declarations/browser" @name="isActive" />
</div>
```

<div style="--kolay-typedoc-name: mediumvioletred; --kolay-typedoc-param: rebeccapurple; --kolay-typedoc-builtin: teal">
  <APIDocs @package="kolay" @module="declarations/browser" @name="isActive" />
</div>

## Beyond colors

You can also style the markup. Every element has a `typedoc__*` class. The layout follows one model:

- A **member row** holds the members of a class, or the args of a signature. The name is at the left, the type is at the right, and the comment is below them. Below `40rem`, they stack.
- A **type position** is everything at the right of a `:`. It flows like code: `Name<Arg>`, `a | b`, `(name: Type) => Return`. An object shape becomes indented `name: type` lines.

Two useful hooks:

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
