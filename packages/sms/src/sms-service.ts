/**
 * DIGNEA SMS Service - Twilio Integration
 * Handles sending and receiving SMS messages for availability updates
 */

import 'server-only';

import twilio from 'twilio';
import type {
  DailyReminderData,
  SMSError,
  SMSMessage,
  SMSResponse,
} from './types';

export class SMSService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor(
    accountSid?: string,
    authToken?: string,
    fromNumber?: string,
  ) {
    this.client = twilio(
      accountSid || process.env.TWILIO_ACCOUNT_SID,
      authToken || process.env.TWILIO_AUTH_TOKEN,
    );
    this.fromNumber = fromNumber || process.env.TWILIO_PHONE_NUMBER || '';
  }

  /**
   * Send an SMS message
   */
  async send(message: SMSMessage): Promise<SMSResponse> {
    try {
      const result = await this.client.messages.create({
        to: message.to,
        from: message.from || this.fromNumber,
        body: message.body,
      });

      return {
        sid: result.sid,
        status: result.status as SMSResponse['status'],
        to: result.to,
        from: result.from,
        body: result.body,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send daily availability reminder to an RPA
   */
  async sendDailyReminder(data: DailyReminderData): Promise<SMSResponse> {
    const message = this.generateReminderMessage(data);

    return this.send({
      to: data.phone,
      body: message,
      metadata: {
        type: 'daily_reminder',
        rpa_id: data.rpa_id,
      },
    });
  }

  /**
   * Send urgent broadcast notification to an RPA
   */
  async sendUrgentBroadcast(
    phone: string,
    rpaName: string,
    patientInfo: string,
  ): Promise<SMSResponse> {
    const message = `🚨 URGENCE - DIGNEA\n\nNouvelle demande urgente (48h) pour ${rpaName}.\n\nProfil: ${patientInfo}\n\nRepondez OUI si vous avez de la disponibilite ou NON si complet.\n\nMerci!`;

    return this.send({
      to: phone,
      body: message,
      metadata: {
        type: 'urgent_broadcast',
      },
    });
  }

  /**
   * Send confirmation SMS
   */
  async sendConfirmation(
    phone: string,
    message: string,
  ): Promise<SMSResponse> {
    return this.send({
      to: phone,
      body: `✅ DIGNEA - ${message}`,
    });
  }

  /**
   * Generate daily reminder message
   */
  private generateReminderMessage(data: DailyReminderData): string {
    const { rpa_name, last_availability } = data;

    if (last_availability) {
      const lastCount = last_availability.units_available;
      return `Bonjour! DIGNEA 🏠\n\nHier : ${lastCount} dispo(s) a ${rpa_name}.\n\nToujours pareil? Repondez OUI ou le nouveau chiffre.`;
    }

    return `Bonjour! DIGNEA 🏠\n\nCombien d'unites disponibles aujourd'hui a ${rpa_name}?\n\nRepondez avec le chiffre (ex: 3) ou 0 si complet.`;
  }

  /**
   * Verify Twilio webhook signature
   */
  validateWebhookSignature(
    authToken: string,
    signature: string,
    url: string,
    params: Record<string, string>,
  ): boolean {
    return twilio.validateRequest(authToken, signature, url, params);
  }

  private handleError(error: unknown): SMSError {
    const { SMSError } = require('./types') as typeof import('./types');

    if (error && typeof error === 'object' && 'code' in error) {
      const twilioError = error as { code: number; message: string };

      if (twilioError.code === 21211) {
        return new SMSError(
          'Invalid phone number',
          'INVALID_PHONE_NUMBER',
          error,
        );
      }

      if (twilioError.code === 429) {
        return new SMSError(
          'Rate limit exceeded',
          'RATE_LIMIT_EXCEEDED',
          error,
        );
      }

      return new SMSError('Twilio API error', 'TWILIO_ERROR', error);
    }

    return new SMSError('Unexpected SMS error', 'MESSAGE_FAILED', error);
  }
}
