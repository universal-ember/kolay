import { visit } from 'unist-util-visit';

// Matches the placeholder repl-sdk's `gmd` compiler emits (as a raw HTML
// node, via its internal `liveCodeExtraction` remark plugin) for each live
// demo, e.g. `<div id="repl_3" class="repl-sdk__demo"></div>`.
const PLACEHOLDER_PATTERN = /^<div id="([^"]+)" class="([^"]*)"><\/div>$/;

/**
 * Copies the document's stylesheets into a shadow root, so demos isolated
 * from the surrounding page's styles still pick up the app's own CSS
 * (mirroring `ember-primitives`' `<Shadowed includeStyles>`). Watches
 * `document.head` for stylesheets that show up later (async chunks, HMR).
 *
 * @param {ShadowRoot} shadowRoot
 * @returns {MutationObserver}
 */
function importStylesInto(shadowRoot) {
  const seen = new WeakSet();

  const importNode = (node) => {
    if (seen.has(node)) return;

    seen.add(node);
    shadowRoot.appendChild(node.cloneNode(true));
  };

  const sync = () => {
    for (const link of document.querySelectorAll('link[rel="stylesheet"]')) importNode(link);
    for (const style of document.querySelectorAll('style')) importNode(style);
  };

  sync();

  const observer = new MutationObserver(sync);

  observer.observe(document.head, { childList: true });

  return observer;
}

/**
 * Defines (once per `tagName`) the custom element `wrapDemo()` renames live
 * demo placeholders to.
 *
 * repl-sdk renders each demo by `appendChild`-ing it into the placeholder
 * element some time after this element connects (see the rehype transformer
 * below, which is what causes this element to exist in the placeholder's
 * place to begin with) — so children can't be assumed to exist in
 * `connectedCallback`, and are instead re-parented into the shadow root as
 * they arrive, via `MutationObserver`.
 *
 * @param {string} tagName
 * @param {ShadowRootMode} mode
 * @param {boolean} includeStyles
 */
function defineElement(tagName, mode, includeStyles) {
  if (typeof customElements === 'undefined' || customElements.get(tagName)) return;

  class KolayDemoShadow extends HTMLElement {
    #childObserver;
    #styleObserver;

    connectedCallback() {
      if (this.shadowRoot) return;

      const shadowRoot = this.attachShadow({ mode });

      if (includeStyles) {
        this.#styleObserver = importStylesInto(shadowRoot);
      }

      for (const child of [...this.childNodes]) {
        shadowRoot.appendChild(child);
      }

      this.#childObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            shadowRoot.appendChild(node);
          }
        }
      });

      this.#childObserver.observe(this, { childList: true });
    }

    disconnectedCallback() {
      this.#childObserver?.disconnect();
      this.#childObserver = undefined;
      this.#styleObserver?.disconnect();
      this.#styleObserver = undefined;
    }
  }

  customElements.define(tagName, KolayDemoShadow);
}

/**
 * Style-isolates live glimdown (`.md`, runtime-compiled) demos in their own
 * shadow root, so a demo's own styles can't leak into the surrounding docs
 * UI and vice versa.
 *
 * `ember-repl` used to wrap every live demo's invocation in a `Shadowed`
 * host; its `repl-sdk`-based rewrite grafts each compiled demo into a
 * placeholder element as an independent step instead, with no invocation
 * left to wrap — dropping that isolation. Rather than teach `repl-sdk`
 * itself about shadow roots, `wrapDemo()` renames each live demo's
 * placeholder tag to a custom element (defined as a side effect of calling
 * `wrapDemo()`) that performs the actual `attachShadow` once the demo's
 * rendered element is appended into it.
 *
 * Returns a rehype plugin — pass it to `setupKolay()` / `compilerOptions()`
 * `rehypePlugins`:
 *
 * ```js
 * import { wrapDemo } from 'kolay/wrap-demo';
 *
 * await setupKolay(this, {
 *   rehypePlugins: [wrapDemo()],
 * });
 * ```
 *
 * Only wires up runtime `.md` demos compiled through `setupKolay()` /
 * `compilerOptions()` — build-time `.gjs.md` demos go through a separate
 * compiler and aren't affected.
 *
 * A fence opts out of wrapping with a meta flag (`no-shadow` by default):
 *
 * ```gjs live no-shadow
 * ```
 *
 * @param {object} [options]
 * @param {string} [options.tagName] Custom element tag name for the shadow host. Defaults to `'kolay-demo-shadow'`.
 * @param {ShadowRootMode} [options.mode] Shadow root mode. Defaults to `'open'`.
 * @param {boolean} [options.includeStyles] Copy the document's `<link rel="stylesheet">` and `<style>` tags into each shadow root. Defaults to `true`.
 * @param {string} [options.skipFlag] Code-fence meta flag that opts a demo out of wrapping. Defaults to `'no-shadow'`.
 */
export function wrapDemo(options = {}) {
  const {
    tagName = 'kolay-demo-shadow',
    mode = 'open',
    includeStyles = true,
    skipFlag = 'no-shadow',
  } = options;

  defineElement(tagName, mode, includeStyles);

  return function rehypeWrapDemo() {
    return (tree, file) => {
      const liveCode = file?.data?.liveCode ?? [];

      const wrapped = new Set(
        liveCode
          .filter((entry) => !entry?.meta?.includes(skipFlag))
          .map((entry) => entry.placeholderId)
      );

      if (wrapped.size === 0) return;

      visit(tree, 'raw', (node) => {
        const match = node.value.match(PLACEHOLDER_PATTERN);

        if (!match) return;

        const [, id, className] = match;

        if (!id || !wrapped.has(id)) return;

        node.value = `<${tagName} id="${id}" class="${className}"></${tagName}>`;
      });
    };
  };
}
