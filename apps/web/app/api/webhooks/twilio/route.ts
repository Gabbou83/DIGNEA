import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { parseAvailabilityResponse } from '@kit/sms/parsers';

/**
 * Twilio SMS Webhook Handler
 * Receives SMS messages from Twilio and processes availability updates
 *
 * Expected format from Twilio:
 * - From: Phone number that sent the SMS
 * - Body: SMS message content (e.g., "5" or "OUI")
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    if (!from || !body) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Erreur: message invalide</Message></Response>',
        {
          status: 400,
          headers: { 'Content-Type': 'text/xml' },
        },
      );
    }

    // Normalize phone number (remove +1, spaces, dashes)
    const normalizedPhone = from.replace(/[\s\-\+]/g, '');

    const client = getSupabaseServerClient();

    // Find RPA profile by phone number
    const { data: rpaProfile } = await client
      .from('rpa_profiles')
      .select('id, rpa_id, sms_enabled')
      .eq('sms_phone', normalizedPhone)
      .eq('sms_enabled', true)
      .single();

    if (!rpaProfile) {
      console.error(`No RPA profile found for phone: ${normalizedPhone}`);

      // Log unknown SMS
      await client.from('sms_logs').insert({
        phone: from,
        message: body,
        direction: 'inbound',
        status: 'failed',
        error_message: 'No RPA profile found',
        twilio_sid: messageSid,
        sent_at: new Date().toISOString(),
      });

      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Numéro non reconnu. Contactez le support DIGNEA.</Message></Response>',
        {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        },
      );
    }

    // Parse the SMS message
    const parsed = parseAvailabilityResponse(body);

    // Log the incoming SMS
    await client.from('sms_logs').insert({
      phone: from,
      message: body,
      direction: 'inbound',
      status: 'received',
      twilio_sid: messageSid,
      sent_at: new Date().toISOString(),
    });

    let responseMessage = '';

    if (parsed.type === 'confirmation') {
      // User confirmed previous availability - no update needed
      responseMessage = 'Merci! Disponibilités confirmées.';
    } else if (parsed.type === 'update' && typeof parsed.value === 'number') {
      // Update availability
      const { error: insertError } = await client.from('availability').insert({
        rpa_id: rpaProfile.rpa_id,
        units_available: parsed.value,
        source: 'sms' as const,
        reported_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Error inserting availability:', insertError);
        responseMessage = 'Erreur lors de la mise à jour. Réessayez plus tard.';
      } else {
        responseMessage = `Merci! ${parsed.value} unité(s) disponible(s) enregistrée(s).`;
      }
    } else {
      // Unknown format
      responseMessage =
        'Format non reconnu. Répondez avec un chiffre (0-99) ou OUI pour confirmer.';
    }

    // Send TwiML response
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${responseMessage}</Message></Response>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      },
    );
  } catch (error) {
    console.error('Twilio webhook error:', error);

    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Erreur serveur. Contactez le support.</Message></Response>',
      {
        status: 500,
        headers: { 'Content-Type': 'text/xml' },
      },
    );
  }
}

// Disable body parsing for Twilio webhooks (they send form data)
export const config = {
  api: {
    bodyParser: false,
  },
};
