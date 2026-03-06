/// <reference types="@testing-library/jest-dom" />
import {
  getPasswordRequirements,
  type PasswordRequirements,
} from './password';

describe('getPasswordRequirements', () => {
  const minLength = 8;

  it('returns all false for empty string', () => {
    const result = getPasswordRequirements('', minLength);
    expect(result).toEqual({
      minLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false,
    });
  });

  it('satisfies minLength when length >= minLength', () => {
    expect(getPasswordRequirements('12345678', minLength).minLength).toBe(true);
    expect(getPasswordRequirements('1234567', minLength).minLength).toBe(false);
  });

  it('detects uppercase', () => {
    expect(getPasswordRequirements('A', minLength).hasUpper).toBe(true);
    expect(getPasswordRequirements('abc', minLength).hasUpper).toBe(false);
  });

  it('detects lowercase', () => {
    expect(getPasswordRequirements('a', minLength).hasLower).toBe(true);
    expect(getPasswordRequirements('ABC', minLength).hasLower).toBe(false);
  });

  it('detects number', () => {
    expect(getPasswordRequirements('1', minLength).hasNumber).toBe(true);
    expect(getPasswordRequirements('abc', minLength).hasNumber).toBe(false);
  });

  it('detects special character', () => {
    expect(getPasswordRequirements('!', minLength).hasSpecial).toBe(true);
    expect(getPasswordRequirements('@', 1).hasSpecial).toBe(true);
    expect(getPasswordRequirements('abc123', minLength).hasSpecial).toBe(
      false,
    );
  });

  it('valid password meets all requirements', () => {
    const result = getPasswordRequirements('SecurePass1!', minLength);
    expect(result).toEqual({
      minLength: true,
      hasUpper: true,
      hasLower: true,
      hasNumber: true,
      hasSpecial: true,
    });
  });
});
