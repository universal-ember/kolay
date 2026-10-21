import { describe, expect, test } from 'vitest';

import { stripFormatting } from './strip-formatting.ts';

const whole = (text: string) => stripFormatting(text, { start: 0, end: text.length });

describe('stripFormatting', () => {
  test('drops emphasis and code marks', () => {
    expect(whole('**bold** and `code` and _quiet_')).toBe('bold and code and quiet');
  });

  test('keeps the text of a link', () => {
    expect(whole('read [the guide](/guides/one.md) first')).toBe('read the guide first');
  });

  test('drops list and blockquote markers', () => {
    expect(whole('- one\n- two\n> quoted')).toBe('one two quoted');
  });

  test('drops inline HTML, keeping the text it wrapped', () => {
    expect(whole('press <kbd>K</kbd> to search')).toBe('press K to search');
  });

  test('keeps a component written in prose', () => {
    expect(whole('the <Search /> component')).toBe('the <Search /> component');
  });

  test('leaves a lone angle bracket alone', () => {
    expect(whole('when a < b')).toBe('when a < b');
  });
});
