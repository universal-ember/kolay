import { module, test } from 'qunit';

import { resolveRedirect } from 'kolay';

module('resolveRedirect', function () {
  const redirects = [
    { from: 'Runtime/sub/*', to: 'Elsewhere/*' },
    { from: 'Runtime/*', to: 'Playground/*' },
    { from: 'legacy/page', to: 'modern/page' },
  ];

  test('a /* entry rewrites the prefix, preserving the remainder', function (assert) {
    assert.strictEqual(
      resolveRedirect('Runtime/rendering/page.md', redirects),
      'Playground/rendering/page.md'
    );
  });

  test('a /* entry matches the bare prefix itself', function (assert) {
    assert.strictEqual(resolveRedirect('Runtime', redirects), 'Playground');
  });

  test('matching is whole-segment, not substring', function (assert) {
    assert.strictEqual(resolveRedirect('RuntimeExtras/page', redirects), undefined);
  });

  test('matching is case-insensitive', function (assert) {
    assert.strictEqual(resolveRedirect('runtime/Page.md', redirects), 'Playground/Page.md');
    assert.strictEqual(resolveRedirect('LEGACY/PAGE', redirects), 'modern/page');
  });

  test('an exact entry matches only that path', function (assert) {
    assert.strictEqual(resolveRedirect('legacy/page', redirects), 'modern/page');
    assert.strictEqual(resolveRedirect('legacy/page/deeper', redirects), undefined);
  });

  test('the first matching entry wins', function (assert) {
    assert.strictEqual(resolveRedirect('Runtime/sub/thing.md', redirects), 'Elsewhere/thing.md');
  });

  test('no match / no entries → undefined', function (assert) {
    assert.strictEqual(resolveRedirect('Somewhere/else', redirects), undefined);
    assert.strictEqual(resolveRedirect('Runtime/page', []), undefined);
  });
});
