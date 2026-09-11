export const MIN_PASSWORD_LENGTH = 8;

/** Returns an error message, or null when the password meets policy. */
export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Include at least one letter and one number.';
  }

  return null;
}
