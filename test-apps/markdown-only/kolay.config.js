import { defineConfig } from "kolay/vite";

export default defineConfig({
  // `Docs/sub-folder` is a page tree too, so this entry competes with the
  // page-tree redirect. Precedence is pinned in `tests/application-test.ts`.
  redirects: [{ from: "Docs/sub-folder", to: "Docs/sub-folder/ember-resources.md" }],
});
