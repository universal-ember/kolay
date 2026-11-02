/**
 * Validates a config file's `redirects` value, returning the normalized
 * entries (leading `/` stripped). Throws — naming `source`, the config
 * file the value came from — for:
 *
 * - a value that isn't an array of `{ from: string, to: string }`
 * - an entry where exactly one of `from` / `to` ends in `/*`
 * - an empty `from` / `to` (or a bare `/*`)
 * - two entries with the same `from` (case-insensitive) — ambiguous,
 *   since only the first could ever apply
 * - an entry whose `to` lands where any entry's `from` (its own
 *   included) would match — redirects don't chain, so every target must
 *   be a final destination. This also rules out redirect loops
 *   (self-referencing entries, ping-pong pairs, and prefixes that
 *   rewrite into themselves) by construction.
 *
 * @param {unknown} value
 * @param {string} source
 * @returns {Redirect[]}
 */
export function validateRedirects(value: unknown, source: string): Redirect[];
/**
 * Discovers and loads the project's kolay config file (see
 * `searchPlaces`), searching upward from `cwd`. The whole config is
 * returned, with the known keys validated and defaulted, along with the
 * discovered file's path (undefined when there is no config file) —
 * relative paths inside the config resolve from the file's directory.
 *
 * @param {string} cwd
 * @returns {Promise<{ config: KolayConfig, filepath: string | undefined }>}
 */
export function loadKolayConfig(cwd: string): Promise<{
    config: KolayConfig;
    filepath: string | undefined;
}>;
export const searchPlaces: string[];
/**
 * The config-shape types live in '../vite.js', beside `kolay()` and
 * `defineConfig`.
 */
export type Redirect = import("../vite.js").Redirect;
/**
 * The config-shape types live in '../vite.js', beside `kolay()` and
 * `defineConfig`.
 */
export type KolayConfigInput = import("../vite.js").KolayConfigInput;
/**
 * The config-shape types live in '../vite.js', beside `kolay()` and
 * `defineConfig`.
 */
export type KolayConfig = KolayConfigInput & {
    redirects: Redirect[];
};
//# sourceMappingURL=kolay-config.d.ts.map