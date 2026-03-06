export const TOKEN_KEY = 'qashio_token';
export const USER_KEY = 'qashio_user';

export const AUTH_PATHS = ['/signin', '/signup'] as const;

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_REQUIREMENT_ITEMS = [
  { key: 'minLength', label: `At least ${PASSWORD_MIN_LENGTH} characters` },
  { key: 'hasUpper', label: 'One uppercase letter' },
  { key: 'hasLower', label: 'One lowercase letter' },
  { key: 'hasNumber', label: 'One number' },
  { key: 'hasSpecial', label: 'One special character' },
] as const;
