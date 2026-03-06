/// <reference types="@testing-library/jest-dom" />
import { formatReferenceInput, REFERENCE_PATTERN } from './transactions';

describe('formatReferenceInput', () => {
  it('strips non-alphanumeric and keeps first 8 chars', () => {
    expect(formatReferenceInput('AB12')).toBe('AB12');
    expect(formatReferenceInput('ABCD1234')).toBe('ABCD-1234');
  });

  it('inserts hyphen after 4th character when length > 4', () => {
    expect(formatReferenceInput('ABCD1')).toBe('ABCD-1');
    expect(formatReferenceInput('ABCD1234')).toBe('ABCD-1234');
  });

  it('removes invalid characters', () => {
    expect(formatReferenceInput('AB-CD')).toBe('ABCD');
    expect(formatReferenceInput('AB  CD')).toBe('ABCD');
  });

  it('caps at 8 alphanumeric characters', () => {
    expect(formatReferenceInput('ABCD12345')).toBe('ABCD-1234');
  });

  it('handles empty string', () => {
    expect(formatReferenceInput('')).toBe('');
  });
});

describe('REFERENCE_PATTERN', () => {
  it('matches valid XXXX-XXXX format', () => {
    expect(REFERENCE_PATTERN.test('ABCD-1234')).toBe(true);
    expect(REFERENCE_PATTERN.test('INV1-1001')).toBe(true);
    expect(REFERENCE_PATTERN.test('a1b2-c3d4')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(REFERENCE_PATTERN.test('ABC-1234')).toBe(false);
    expect(REFERENCE_PATTERN.test('ABCD1234')).toBe(false);
    expect(REFERENCE_PATTERN.test('ABCD-123')).toBe(false);
    expect(REFERENCE_PATTERN.test('')).toBe(false);
  });
});
