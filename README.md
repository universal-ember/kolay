# kolay

Documentation system for the `@universal-ember` family of projects.


## Features

### Use Markdown

- Write pages in any folder, in any project. This works well for a monorepo.
- The build time does not grow with the number of pages. The browser compiles each page when a reader opens it.
- Any code fence can become a live demo. Add the `live` tag.
  ~~~md
  Some prose here about the demo

  ```gjs live
  <template>
    interactive!
  </template>
  ```
  ~~~

### Use JSDoc

- The `<APIDocs />` component shows the docs that JSDoc and TypeDoc generate.
  ~~~md
  ## API Reference

  <APIDocs @package="my-library" @module="..." @name="theExport" />
  ~~~
- The examples in your JSDoc can be live demos:
  ~~~
  text here

  ```gjs live
  // the "live" tag on the codefence
  ```
  ~~~

### Navigation 

- Kolay generates the navigation from the layout of your files.
