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
    const { sms_enabled, sms_phone, sms_daily_reminder } = body;

    // Validate input
    if (typeof sms_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'sms_enabled doit etre un booleen' },
        { status: 400 },
      );
    }

    if (sms_enabled && (!sms_phone || sms_phone.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Numero de telephone requis quand SMS est active' },
        { status: 400 },
      );
    }

    if (typeof sms_daily_reminder !== 'boolean') {
      return NextResponse.json(
        { error: 'sms_daily_reminder doit etre un booleen' },
        { status: 400 },
      );
    }

    // Get the user's RPA profile
    // RLS policies ensure user can only update their own profile
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

    // Update RPA profile with new SMS settings
    const { error: updateError } = await client
      .from('rpa_profiles')
      .update({
        sms_enabled,
        sms_phone: sms_enabled ? sms_phone : null,
        sms_daily_reminder: sms_enabled ? sms_daily_reminder : false,
      })
      .eq('id', rpaProfile.id);

    if (updateError) {
      console.error('Error updating SMS settings:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise a jour des parametres SMS' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Parametres SMS mis a jour avec succes',
    });
  } catch (error) {
    console.error('Error in SMS settings update:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 },
    );
  }
}
