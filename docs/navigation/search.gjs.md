# `<Search />`

Site-wide search, as a command palette. The <kbd>⌘</kbd><kbd>K</kbd> in this site's header is this component.

```gjs
import { Search } from 'kolay/components';

<template>
  <Search />
</template>
```

There is nothing to index and nothing to configure. The `docs()` plugin already wrote every page's title, headings, and prose into the compiled docs; this renders what [`searcher`](/Runtime/utilities/search.md) ranks.

Put it in your application template, next to your nav. It renders a button; the palette itself is a `<dialog>`, so it does not matter where in the layout it sits.

## What it is

`<CommandPalette>` from [ember-primitives](https://ember-primitives.pages.dev/5-floaty-bits/command-palette), filled in with kolay's index:

- The `<dialog>` handles the layer, the focus trap, and returning focus to whatever opened it.
- `aria-activedescendant` handles the keyboard, so <kbd>ArrowUp</kbd> and <kbd>ArrowDown</kbd> move the selection while the caret stays where the reader is typing.
- <kbd>Enter</kbd> clicks the active result, which is a real link, so the router navigates and <kbd>⌘</kbd>-click still opens a new tab.
- <kbd>Esc</kbd>, a click outside, and the footer's Close button all close it.

Excerpts come from `stripFormatting`, and the query is marked inside them with `highlightSearch`. Both are documented under [`searcher`](/Runtime/utilities/search.md).

## Your own trigger

The `:trigger` block is yielded `open`, and the modifier that returns focus to your button when the palette closes.

```gjs
import { on } from '@ember/modifier';
import { Search } from 'kolay/components';

<template>
  <Search>
    <:trigger as |open focusOnClose|>
      <button type="button" class="my-search-button" {{focusOnClose}} {{on "click" open}}>
        🔍
      </button>
    </:trigger>
  </Search>
</template>
```

Leave the block empty to render no trigger at all. <kbd>⌘</kbd><kbd>K</kbd> still opens the palette.

## Your own result

The `:result` block replaces the group, title, and excerpt, and is yielded the result and the query.

```gjs
import { Search } from 'kolay/components';
import { stripFormatting } from 'kolay';

<template>
  <Search>
    <:result as |result|>
      <strong>{{result.title}}</strong>
      <small>{{result.score}}</small>
    </:result>
  </Search>
</template>
```

A result carries everything `searcher` produces: `path`, `title`, `groupName`, `headings`, `score`, `text`, and `excerptRange`.

## Styling

Default styles ship in `kolay.css`, which you already import. The colours are variables. Set them on `:root` and the palette follows your site rather than the other way around.

```css
:root {
  --kolay-search-bg: var(--my-surface);
  --kolay-search-fg: var(--my-text);
  --kolay-search-muted: var(--my-muted);
  --kolay-search-border: var(--my-border);
  --kolay-search-accent: var(--my-link);
  --kolay-search-active: color-mix(in oklab, var(--my-link), transparent 88%);
  --kolay-search-backdrop: rgb(0 0 0 / 0.45);
  --kolay-search-width: 40rem;
  --kolay-search-radius: 0.75rem;
}
```

Every rule is a single class (`.kolay__search`, `.kolay__search__result`, and friends), so replacing one takes one class of your own.

The active result is `[data-active="true"]`, set by the pointer and the keyboard alike. Style that, not `:hover`. One selector covers both inputs, and the two can never disagree about what <kbd>Enter</kbd> will do.

## A search page as well

`<Search />` is for looking something up and leaving. For a page a reader can link to and scroll through, keep the query in the URL and render the results yourself with [`searcher`](/Runtime/utilities/search.md). This site has both.

## API Reference

<ComponentSignature
  @package='kolay'
  @name='Search'
  @module='declarations/browser/components'
/>
