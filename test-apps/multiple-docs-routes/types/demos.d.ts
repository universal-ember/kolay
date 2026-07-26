// the demos() aliases this app declares in vite.config.mjs
declare module "#demos/kit/hello" {
  import type { TOC } from "@ember/component/template-only";

  const Hello: TOC<{ Element: HTMLParagraphElement }>;

  export default Hello;
}
