/**
 * Shared input validation helpers for API routes.
 */

export function validatePassword(password: unknown): { valid: boolean; error?: string } {
  if (typeof password !== "string") {
    return { valid: false, error: "Password must be a string" };
  }
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long" };
  }
  if (password.length > 128) {
    return { valid: false, error: "Password must not exceed 128 characters" };
  }
  return { valid: true };
}

export function validateEmail(email: unknown): { valid: boolean; error?: string } {
  if (typeof email !== "string" || !email.trim()) {
    return { valid: false, error: "Valid email is required" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: "Invalid email format" };
  }
  return { valid: true };
}

export function clampPagination(page: unknown, limit: unknown, maxLimit = 100): { page: number; limit: number } {
  const parsedPage = Math.max(1, parseInt(String(page ?? "1"), 10) || 1);
  const parsedLimit = Math.min(maxLimit, Math.max(1, parseInt(String(limit ?? "20"), 10) || 20));
  return { page: parsedPage, limit: parsedLimit };
}

export function sanitizeSearchQuery(search: unknown, maxLength = 200): string | undefined {
  if (typeof search !== "string") return undefined;
  const trimmed = search.trim().slice(0, maxLength);
  return trimmed.length > 0 ? trimmed : undefined;
}
