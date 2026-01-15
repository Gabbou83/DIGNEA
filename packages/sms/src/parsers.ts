/**
 * DIGNEA SMS Parsers
 * Parse inbound SMS messages to extract availability updates
 */

import type { AvailabilityUpdate } from './types';

/**
 * Parse an availability response from SMS
 * Handles:
 * - "OUI" / "YES" = confirmation (no change)
 * - Number (0-99) = new availability count
 * - Other responses = unknown
 */
export function parseAvailabilityResponse(
  message: string,
): AvailabilityUpdate {
  const normalized = message.trim().toUpperCase();

  // Check for confirmation responses
  if (isConfirmationResponse(normalized)) {
    return {
      type: 'confirmation',
      original_message: message,
    };
  }

  // Check for number response
  const number = extractNumber(normalized);
  if (number !== null && number >= 0 && number <= 99) {
    return {
      type: 'update',
      value: number,
      original_message: message,
    };
  }

  // Unknown response
  return {
    type: 'unknown',
    original_message: message,
  };
}

/**
 * Check if message is a confirmation (yes/oui)
 */
function isConfirmationResponse(message: string): boolean {
  const confirmations = [
    'OUI',
    'YES',
    'OK',
    'CORRECT',
    'PAREIL',
    'IDENTIQUE',
    'SAME',
  ];

  return confirmations.some((word) => message.includes(word));
}

/**
 * Extract a number from the message
 * Handles:
 * - Plain numbers: "3"
 * - Numbers with text: "3 disponibles"
 * - Written numbers: "trois" (future enhancement)
 */
function extractNumber(message: string): number | null {
  // Try to extract a plain number first
  const plainNumber = message.match(/\b(\d{1,2})\b/);
  if (plainNumber && plainNumber[1]) {
    return parseInt(plainNumber[1], 10);
  }

  // TODO: Add support for written French numbers
  // "trois" -> 3, "zero" -> 0, etc.

  return null;
}

/**
 * Check if phone number is valid Quebec/Canada format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Check if it's a valid North American number (10 or 11 digits)
  if (digits.length === 10) {
    // 10 digits: (XXX) XXX-XXXX
    return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits);
  }

  if (digits.length === 11 && digits[0] === '1') {
    // 11 digits with country code: 1-XXX-XXX-XXXX
    return /^1[2-9]\d{2}[2-9]\d{6}$/.test(digits);
  }

  return false;
}

/**
 * Format phone number to E.164 format
 * Example: (819) 555-1234 -> +18195551234
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits[0] === '1') {
    return `+${digits}`;
  }

  // If already in E.164 format
  if (phone.startsWith('+')) {
    return phone;
  }

  throw new Error(`Invalid phone number format: ${phone}`);
}
