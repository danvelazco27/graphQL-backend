export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  return null;
}

export function validateRequiredFields(
  fields: Record<string, unknown>
): string | null {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === "") {
      return `Missing required field: ${key}`;
    }
  }
  return null;
}
