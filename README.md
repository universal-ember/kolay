# kolay

Documentation system for the the `@universal-ember` family of projects.

## Features

### Use Markdown

- from any folder, any project (good for monorepos)
- scales infinitely with your project size, as compiling the pages is done on-demand, rather than on-deploy
- any codefence can become a live demo with the `live` tag
  ~~~md
  Some prose here about the demo

  ```gjs live
  <template>
    interactive!
  </template>
  ```
  ~~~

### Use JSDoc

- JSDoc / TypeDoc is renderable via the `<APIDocs />` component
  ~~~md
  ## API Reference

  <APIDocs @package="my-library" @module="..." @name="theExport" />
  ~~~
- render examples from your jsdoc for interactive demonstration of concepts using 
  ~~~
  text here

  ```gjs live
  // the "live" tag on the codefence
  ```
  ~~~

### Navigation 

- generate navigation based on convention based file layout
