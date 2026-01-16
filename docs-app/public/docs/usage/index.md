<h1 style="
  font-size: 2rem; 
  display: inline-block; 
  margin-bottom: 0; 
  padding-bottom: 0">kolay</h1> 
<small><code>adjective</code></small>

<ul style="margin: 0; padding-left: 1rem; padding-bottom: 0;">
    <li>easy</li>
    <li>simple</li>
    <li>uncomplicated</li>
</ul>

<small style="
  float: right; 
  margin-top: -2rem; 
  font-size: 0.5rem;">after initial setup</small>

<hr>

Documentation system for the the `@universal-ember` family of projects.

[➡️ Get started!](/usage/setup.md)

---

## Install[^type-module]

```bash
pnpm add kolay
```

### Use Markdown

- from any folder, any project (good for monorepos)
- scales infinitely with your project size, as compiling the pages is done on-demand, rather than on-deploy
- any codefence can become a live demo with the `live` tag

  ````markdown
  Some prose here about the demo

  ```gjs live
  <template>interactive!</template>
  ```
  ````

### Use JSDoc

- JSDoc / TypeDoc is renderable via the `<APIDocs />` component

  ```markdown
  ## API Reference

  <APIDocs @package="my-library" @module="..." @name="theExport" />
  ```

- render examples from your jsdoc for interactive demonstration of concepts using

  ````
  text here

  ```gjs live
  // the "live" tag on the codefence
  ```
  ````

### Navigation

- generate navigation based on convention based file layout
