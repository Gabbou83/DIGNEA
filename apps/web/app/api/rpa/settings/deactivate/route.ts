import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function PATCH(request: NextRequest) {
  try {
    const client = getSupabaseServerClient();

    // Verify authentication
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifie' },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { reason } = body;

    // Get the user's RPA profile to find their RPA
    const { data: rpaProfile, error: profileError } = await client
      .from('rpa_profiles')
      .select('id, rpa_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !rpaProfile) {
      return NextResponse.json(
        { error: 'Profil RPA introuvable' },
        { status: 404 },
      );
    }

    // Deactivate the RPA
    const { error: deactivateError } = await client
      .from('rpas')
      .update({
        is_active: false,
      })
      .eq('id', rpaProfile.rpa_id);

    if (deactivateError) {
      console.error('Error deactivating RPA:', deactivateError);
      return NextResponse.json(
        { error: 'Erreur lors de la desactivation de la residence' },
        { status: 500 },
      );
    }

    // Also disable SMS notifications when deactivating
    const { error: smsError } = await client
      .from('rpa_profiles')
      .update({
        sms_enabled: false,
        sms_daily_reminder: false,
      })
      .eq('id', rpaProfile.id);

    if (smsError) {
      console.error('Error disabling SMS:', smsError);
      // Don't fail the request, just log the error
    }

    // Optionally log the deactivation reason
    if (reason && reason.trim().length > 0) {
      console.log(
        `RPA ${rpaProfile.rpa_id} deactivated by user ${user.id}. Reason: ${reason}`,
      );

      // TODO: In the future, we could create an rpa_activity_log table to track this
      // For now, just console log
    }

    return NextResponse.json({
      success: true,
      message: 'Residence desactivee avec succes',
    });
  } catch (error) {
    console.error('Error in deactivation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 },
    );
  }
}
