/**
 * Password rules: min 8 characters, at least 1 uppercase letter, at least 1 symbol.
 * Symbol = character that is not a letter or digit (e.g. !@#$%^&*()_+-=[]{}|;':",./<>?).
 */
const MIN_LENGTH = 8;

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < MIN_LENGTH) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one capital letter' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one symbol (e.g. !@#$%)' };
  }
  return { valid: true };
}

export const PASSWORD_REQUIREMENTS = 'At least 8 characters, 1 capital letter, and 1 symbol';
