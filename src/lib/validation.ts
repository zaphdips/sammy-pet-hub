/**
 * Input Validation Utilities for Pet Corner
 * 
 * WHY: Per AI Context, all user inputs must be validated and sanitized
 * before use in DB queries. This module centralises all validation
 * so there is one place to audit and update rules.
 *
 * RULE: Use allowlists, not denylists. Define what IS valid, not what ISN'T.
 */

// Allowed pet types — never infer from user input directly
export const ALLOWED_PET_TYPES = ["dog", "cat", "bird", "rabbit", "other"] as const;
export const ALLOWED_AGE_GROUPS = ["Puppy", "Young", "Adult", "Senior"] as const;
export const ALLOWED_GENDERS = ["Male", "Female"] as const;
export const ALLOWED_PRODUCT_CATS = ["toy", "medication"] as const;

export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

/** Strip any HTML/script tags from a string to prevent XSS */
function sanitizeText(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

/** Validate and sanitize the pet listing form */
export function validatePetForm(data: Record<string, any>): ValidationResult {
  const errors: Record<string, string> = {};

  const name = sanitizeText(data.name ?? "");
  if (!name || name.length < 2) errors.name = "Pet name must be at least 2 characters.";
  if (name.length > 50) errors.name = "Pet name must be 50 characters or fewer.";

  if (!ALLOWED_PET_TYPES.includes(data.type as typeof ALLOWED_PET_TYPES[number]))
    errors.type = "Invalid pet type.";

  const breed = sanitizeText(data.breed ?? "");
  if (!breed || breed.length < 2) errors.breed = "Breed must be at least 2 characters.";
  if (breed.length > 60) errors.breed = "Breed must be 60 characters or fewer.";

  if (!ALLOWED_AGE_GROUPS.includes(data.age as typeof ALLOWED_AGE_GROUPS[number]))
    errors.age = "Invalid age group.";

  if (!ALLOWED_GENDERS.includes(data.gender as typeof ALLOWED_GENDERS[number]))
    errors.gender = "Gender must be Male or Female.";

  const description = sanitizeText(data.description ?? "");
  if (description.length > 500) errors.description = "Description must be 500 characters or fewer.";

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Validate the vet consultation form */
export function validateVetForm(data: Record<string, string>): ValidationResult {
  const errors: Record<string, string> = {};

  const petName = sanitizeText(data.petName ?? "");
  if (petName.length > 50) errors.petName = "Pet name too long.";

  const message = sanitizeText(data.message ?? "");
  if (!message || message.length < 10) errors.message = "Please describe the situation (min 10 characters).";
  if (message.length > 1000) errors.message = "Message is too long (max 1000 characters).";

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Validate email format */
export function validateEmail(email: string): boolean {
  // Basic RFC 5322 compliant check — enough to catch common mistakes
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Validate password strength */
export function validatePassword(password: string): ValidationResult {
  const errors: Record<string, string> = {};
  if (password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) errors.password = "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password)) errors.password = "Password must contain at least one number.";
  return { valid: Object.keys(errors).length === 0, errors };
}
