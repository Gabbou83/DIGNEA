import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(request: NextRequest) {
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
    const { rpaId, units, source = 'web' } = body;

    // Validate input
    if (!rpaId || typeof units !== 'number') {
      return NextResponse.json(
        { error: 'Donnees invalides' },
        { status: 400 },
      );
    }

    if (units < 0 || units > 99) {
      return NextResponse.json(
        { error: 'Le nombre doit etre entre 0 et 99' },
        { status: 400 },
      );
    }

    // Verify user has permission to update this RPA
    const { data: userProfile } = await client
      .from('user_profiles')
      .select('profile_id, user_type')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.user_type !== 'rpa_manager') {
      return NextResponse.json(
        { error: 'Permission refusee' },
        { status: 403 },
      );
    }

    const { data: rpaProfile } = await client
      .from('rpa_profiles')
      .select('rpa_id')
      .eq('id', userProfile?.profile_id || '')
      .eq('rpa_id', rpaId)
      .single();

    if (!rpaProfile) {
      return NextResponse.json(
        { error: 'RPA non trouvee' },
        { status: 404 },
      );
    }

    // Insert availability record
    const { data: availability, error: insertError } = await client
      .from('availability')
      .insert({
        rpa_id: rpaId,
        units_available: units,
        source,
        reported_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting availability:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise a jour' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: availability });
  } catch (error) {
    console.error('Availability update error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 },
    );
  }
}
