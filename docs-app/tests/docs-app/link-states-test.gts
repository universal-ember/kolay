import { settled, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

function demoNav() {
  const host = [...document.querySelectorAll('.home-doc *')].find((el) => el.shadowRoot);

  return host?.shadowRoot?.querySelector('nav[aria-label="Link states demo"]');
}

module('Link states demo', function (hooks) {
  setupApplicationTest(hooks);

  test('the demo marks the current page and navigates on click', async function (assert) {
    await visit('/development/link-states.md');

    assert.dom('[data-page-error]').doesNotExist();

    const nav = demoNav();

    assert.ok(nav, 'the demo renders inside a shadow root');
    assert.dom(nav?.querySelector('a[aria-current="page"]')).hasText('Link states');

    const sibling = nav?.querySelector('a[href="/development/ordering-pages.md"]');

    assert.ok(sibling, `sibling hrefs are app-relative (the test app's rootURL is "/")`);

    // test-helpers' click() dispatches a non-composed event, which can't
    // cross the shadow boundary to reach properLinks' document listener
    sibling?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, view: window })
    );
    await settled();

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/development/ordering-pages.md');
    assert.dom('.home-doc').containsText('Ordering');
  });
});
