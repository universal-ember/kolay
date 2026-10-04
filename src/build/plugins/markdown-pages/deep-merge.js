/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * A deep merge over plain objects, with `source` winning on collisions.
 * Arrays and every other non-plain value replace wholesale, rather than
 * merging index-by-index the way lodash's `merge` does — for frontmatter
 * overriding a sibling json config, replacing the list is what an author
 * means by re-declaring it.
 *
 * Neither input is mutated. Nested objects present in only one input are
 * shared with the result by reference, so callers must not mutate what
 * they hand in afterwards.
 *
 * Hand-rolled because this is the only such utility kolay needs. If a
 * second one shows up, reach for es-toolkit rather than growing this file.
 *
 * @param {Record<string, unknown>} target
 * @param {Record<string, unknown>} source
 * @returns {Record<string, unknown>}
 */
export function deepMerge(target, source) {
  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    // frontmatter is author-controlled; don't let it reach the prototype
    if (key === '__proto__' || key === 'constructor') continue;

    const existing = result[key];

    result[key] =
      isPlainObject(value) && isPlainObject(existing) ? deepMerge(existing, value) : value;
  }

  return result;
}
