import { describe, expect, test } from 'vitest';

import { extractErrorMessage } from './extract-error-message.js';

describe('extractErrorMessage', () => {
  test('returns the message from an Error instance', () => {
    const error = new Error('something went wrong');

    expect(extractErrorMessage(error)).toBe('something went wrong');
  });

  test('returns the string directly when given a string', () => {
    expect(extractErrorMessage('raw string error')).toBe('raw string error');
  });

  test('returns empty string for a plain object', () => {
    expect(extractErrorMessage({ message: 'nope' })).toBe('');
  });

  test('returns empty string for undefined', () => {
    expect(extractErrorMessage(undefined)).toBe('');
  });

  test('returns empty string for null', () => {
    expect(extractErrorMessage(null)).toBe('');
  });

  test('returns empty string for a number', () => {
    expect(extractErrorMessage(42)).toBe('');
  });
});
