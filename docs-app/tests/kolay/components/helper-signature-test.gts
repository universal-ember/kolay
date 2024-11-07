import { render } from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { HelperSignature } from 'kolay';

import { setupKolay } from 'kolay/test-support';

module('<HelperSignature>', function (hooks) {
  setupRenderingTest(hooks);
  setupKolay(hooks);

  test('self', async function (assert) {
    // This is not supported
    await render(
      <template>
        <HelperSignature
          @package="kolay"
          @module="declarations/browser"
          @name="HelperSignature"
        />
      </template>
    );

    assert.dom().doesNotContainText('Element');
    assert.dom().doesNotContainText('Arguments');
    assert.dom().doesNotContainText('@package');
    assert.dom().doesNotContainText('@module');
    assert.dom().doesNotContainText('@name');
    assert.dom().doesNotContainText('Blocks');
  });

  test('function', async function (assert) {
    await render(
      <template>
        <HelperSignature
          @module="declarations/browser/samples/-private"
          @name="plainHelperA"
          @package="kolay"
        />
      </template>
    );

    assert.dom().doesNotContainText('Element');
    assert.dom().containsText('the first argument');
    assert.dom().containsText('the second argument');
    assert.dom().containsText('Return');
  });

  test('function:cast:HelperLike', async function (assert) {
    await render(
      <template>
        <HelperSignature
          @module="declarations/browser/samples/-private"
          @name="helperLikeB"
          @package="kolay"
        />
      </template>
    );

    assert.dom().doesNotContainText('Element');
    assert.dom().containsText('first');
    assert.dom().containsText('second');
    assert.dom().containsText('Named');
    assert.dom().containsText('optional');
    assert.dom().containsText('Return');
  });

  test('function:typescript', async function (assert) {
    await render(
      <template>
        <HelperSignature
          @module="declarations/browser/samples/-private"
          @name="plainHelperC"
          @package="kolay"
        />
      </template>
    );

    assert.dom().doesNotContainText('Element');
    assert.dom().containsText('a');
    assert.dom().containsText('b');
    assert.dom().containsText('options', 'has equiv of Named');
    assert.dom().containsText('optional');
    assert.dom().containsText('required');
    assert.dom().containsText('Return');
  });

  skip('classic class:inline', async function (assert) {
    await render(
      <template>
        <HelperSignature
          @module="declarations/browser/samples/-private"
          @name="classHelperD"
          @package="kolay"
        />
      </template>
    );

    assert.dom().doesNotContainText('Element');
    assert.dom().containsText('optional');
    assert.dom().containsText('first');
    assert.dom().containsText('second');
    assert.dom().containsText('Named');
    assert.dom().containsText('Return');
  });

  skip('classic class:reference', async function (assert) {
    await render(
      <template>
        <HelperSignature
          @module="declarations/browser/samples/-private"
          @name="classHelperE"
          @package="kolay"
        />
      </template>
    );

    assert.dom().doesNotContainText('Element');
    assert.dom().containsText('optional');
    assert.dom().containsText('first');
    assert.dom().containsText('second');
    assert.dom().containsText('Named');
    assert.dom().containsText('Return');
  });
});
