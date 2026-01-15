/**
 * DIGNEA SMS Package - Type Definitions
 * Types for Twilio integration and SMS handling
 */

// ============================================================================
// SMS Message Types
// ============================================================================

export interface SMSMessage {
  to: string;
  from?: string; // Will use default Twilio number if not provided
  body: string;
  metadata?: Record<string, unknown>;
}

export interface SMSResponse {
  sid: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  to: string;
  from: string;
  body: string;
  error_code?: string;
  error_message?: string;
}

export interface InboundSMS {
  sid: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
}

// ============================================================================
// Availability Update Types
// ============================================================================

export interface AvailabilityUpdate {
  type: 'confirmation' | 'update' | 'unknown';
  value?: number; // Number of available units
  original_message: string;
}

export interface DailyReminderData {
  rpa_id: string;
  rpa_name: string;
  phone: string;
  last_availability?: {
    units_available: number;
    reported_at: Date;
  };
}

// ============================================================================
// Error Types
// ============================================================================

export class SMSError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'INVALID_PHONE_NUMBER'
      | 'TWILIO_ERROR'
      | 'RATE_LIMIT_EXCEEDED'
      | 'MESSAGE_FAILED',
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'SMSError';
  }
}
