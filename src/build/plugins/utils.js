/**
 * Taken from https://github.com/sveltejs/vite-plugin-svelte/blob/170bacc73d95d268e3673a5ec339da187adb82e0/packages/vite-plugin-svelte/src/utils/id.js#L174
 */
export function buildIdFilter(options = {}) {
  const { include = [], exclude = [], extensions } = options;
  // this regex combines configured extensions and looks for them at the end of the string or directly before first ? or #
  const extensionsRE = new RegExp(
    `^[^?#]+\\.(?:${extensions
      .map((e) => (e.startsWith('.') ? e.slice(1) : e))
      .map(RegExp.escape)
      .join('|')})(?:[?#]|$)`
  );

  return {
    id: {
      include: [extensionsRE, ...include],
      exclude: [...exclude],
    },
  };
}

export function extFilter(ext) {
  return buildIdFilter({
    extensions: [ext],
  });
}
