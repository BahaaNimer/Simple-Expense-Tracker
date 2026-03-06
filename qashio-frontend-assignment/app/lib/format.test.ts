/// <reference types="@testing-library/jest-dom" />
import { formatAmount, formatDate } from './format';

describe('formatAmount', () => {
  it('formats positive number with 2 decimals and AED', () => {
    expect(formatAmount(100)).toBe('100.00 AED');
    expect(formatAmount(99.5)).toBe('99.50 AED');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatAmount(10.999)).toBe('11.00 AED');
    expect(formatAmount(10.994)).toBe('10.99 AED');
  });

  it('handles zero', () => {
    expect(formatAmount(0)).toBe('0.00 AED');
  });

  it('handles negative amounts', () => {
    expect(formatAmount(-50.25)).toContain('AED');
    expect(formatAmount(-50.25)).toMatch(/-?\d+\.\d{2}/);
  });
});

describe('formatDate', () => {
  it('formats Date to dd MMM yyyy', () => {
    expect(formatDate(new Date('2025-04-27'))).toMatch(/\d{2} \w{3} \d{4}/);
  });

  it('formats ISO date string', () => {
    const result = formatDate('2025-04-27T12:00:00.000Z');
    expect(result).toMatch(/\d{2} \w{3} \d{4}/);
  });

  it('returns empty string for null and undefined', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });
});
