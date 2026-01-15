import { K10RPASchema, type K10RPA } from './types';

/**
 * Parse and validate K10 RPA data
 */
export function parseK10RPA(raw: unknown): K10RPA | null {
  try {
    return K10RPASchema.parse(raw);
  } catch (error) {
    console.error('Invalid K10 RPA data:', error);
    return null;
  }
}

/**
 * Normalize RPA data for consistency
 */
export function normalizeK10RPA(rpa: K10RPA): K10RPA {
  return {
    ...rpa,
    name: rpa.name.trim(),
    k10_id: rpa.k10_id.toUpperCase(),
    phone: normalizePhone(rpa.phone),
    postal_code: normalizePostalCode(rpa.postal_code),
  };
}

/**
 * Normalize phone number to Quebec format
 */
function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
}

/**
 * Normalize postal code to Canadian format
 */
function normalizePostalCode(postal: string | undefined): string | undefined {
  if (!postal) return undefined;

  const cleaned = postal.replace(/\s/g, '').toUpperCase();

  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }

  return postal;
}
