import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { SMSService } from '@kit/sms/sms-service';

/**
 * Daily Availability Reminder Cron Job
 * Sends SMS reminders to all active RPA managers
 *
 * Expected to run daily at 8:00 AM EST
 * Triggered by Vercel Cron or similar service
 *
 * Security: Requires CRON_SECRET header to match env variable
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = getSupabaseServerClient();
    const smsService = new SMSService();

    // Get all active RPA profiles with SMS enabled
    const { data: rpaProfiles, error: profilesError } = await client
      .from('rpa_profiles')
      .select(
        `
        id,
        rpa_id,
        sms_phone,
        rpas (
          id,
          name,
          k10_id
        )
      `,
      )
      .eq('sms_enabled', true)
      .eq('sms_daily_reminder', true)
      .eq('is_active', true);

    if (profilesError) {
      console.error('Error fetching RPA profiles:', profilesError);
      return NextResponse.json(
        { error: 'Error fetching profiles' },
        { status: 500 },
      );
    }

    if (!rpaProfiles || rpaProfiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active RPA profiles with SMS enabled',
        sent: 0,
      });
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send reminder to each RPA
    for (const profile of rpaProfiles) {
      if (!profile.sms_phone || !profile.rpas) {
        results.failed++;
        results.errors.push(`Profile ${profile.id}: Missing phone or RPA`);
        continue;
      }

      try {
        // Get latest availability for this RPA
        const { data: availability } = await client
          .from('availability')
          .select('units_available, reported_at')
          .eq('rpa_id', profile.rpa_id)
          .order('reported_at', { ascending: false })
          .limit(1)
          .single();

        // Send SMS reminder
        const response = await smsService.sendDailyReminder({
          rpa_id: profile.rpa_id,
          phone: profile.sms_phone,
          rpa_name: profile.rpas.name,
          last_availability: availability
            ? {
                units_available: availability.units_available,
                reported_at: availability.reported_at ? new Date(availability.reported_at) : new Date(),
              }
            : undefined,
        });

        if (response.status === 'sent' || response.status === 'queued') {
          results.sent++;

          // Log successful SMS
          await client.from('sms_logs').insert({
            phone: profile.sms_phone,
            message: response.body || '',
            direction: 'outbound',
            status: 'sent',
            twilio_sid: response.sid || null,
            sent_at: new Date().toISOString(),
          });
        } else {
          results.failed++;
          results.errors.push(
            `Profile ${profile.id}: ${response.error_message || 'Unknown error'}`,
          );

          // Log failed SMS
          await client.from('sms_logs').insert({
            phone: profile.sms_phone,
            message: response.body || '',
            direction: 'outbound',
            status: 'failed',
            error_message: response.error_message || null,
            sent_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        results.failed++;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Profile ${profile.id}: ${errorMessage}`);
        console.error(`Error sending reminder to ${profile.id}:`, error);
      }

      // Add small delay to avoid rate limiting (100ms between messages)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      total: rpaProfiles.length,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error) {
    console.error('Daily reminder cron error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Disable static generation for cron routes
export const dynamic = 'force-dynamic';
