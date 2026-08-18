## Ordering

You can set the order of the pages and the folders at build time. Put a `meta.json` or `meta.jsonc` file next to the paths that you want to sort.

### Sort the folders

For example, in this project, the docs are in folders in `public/docs`:

```
public/
  docs/
    plugins/
    usage/
```

We want `usage` before `plugins`. But in alphabetical order, `plugins` comes before `usage`.

Create a `meta.jsonc` file at `public/docs/meta.jsonc`:

```jsonc
{
  // We want usage to be first, which breaks the
  // default sort order provided by the filesystem: Alphabetical
  "order": ["usage", "plugins"],
}
```

A `jsonc` file can hold comments, so you can explain why the configuration is there. The navigation now shows `Usage` above `Plugins`, and you write no runtime code for this.

### Sort the pages

For example, in this project, the pages under `usage` appear alphabetically in the filesystem like this:

```
public/
  docs/
    usage/
      ordering-pages.md
      rendering-pages.md
      setup.md
```

Here the alphabetical order is the opposite of the _useful_ reading order.

To sort these pages, create a `meta.jsonc` file at `public/docs/usage/meta.jsonc` with this content:

```jsonc
{
  // This is in order of need-to-know
  "order": ["setup", "rendering-pages", "ordering-pages"],
}
```

The order of the pages is now correct, and there is nothing to do at runtime! 🥳
