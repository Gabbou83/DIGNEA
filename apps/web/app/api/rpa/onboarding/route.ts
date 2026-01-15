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
    const {
      k10_id,
      name,
      address,
      city,
      region,
      postal_code,
      phone,
      availability,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 },
      );
    }

    // Start transaction
    // 1. Create or find RPA
    const rpaData = {
      k10_id: k10_id || `DIGNEA-${Date.now()}`, // Generate temp ID if none provided
      name,
      address,
      city,
      region,
      postal_code,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { data: rpa, error: rpaError } = await client
      .from('rpas')
      .insert(rpaData)
      .select()
      .single();

    if (rpaError || !rpa) {
      console.error('Error creating RPA:', rpaError);
      return NextResponse.json(
        { error: 'Erreur lors de la creation de la residence' },
        { status: 500 },
      );
    }

    // 2. Create RPA profile (user_id is required)
    const { data: rpaProfile, error: profileError } = await client
      .from('rpa_profiles')
      .insert({
        rpa_id: rpa.id,
        user_id: user.id,
        sms_phone: phone || null,
        sms_enabled: !!phone,
        role: 'manager',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError || !rpaProfile) {
      console.error('Error creating RPA profile:', profileError);
      // Rollback: delete RPA
      await client.from('rpas').delete().eq('id', rpa.id);
      return NextResponse.json(
        { error: 'Erreur lors de la creation du profil' },
        { status: 500 },
      );
    }

    // 3. Update user profile
    const { error: userProfileError } = await client
      .from('user_profiles')
      .update({
        user_type: 'rpa_manager',
        profile_id: rpaProfile.id,
        onboarding_completed: true,
      })
      .eq('id', user.id);

    if (userProfileError) {
      console.error('Error updating user profile:', userProfileError);
      // Rollback
      await client.from('rpa_profiles').delete().eq('id', rpaProfile.id);
      await client.from('rpas').delete().eq('id', rpa.id);
      return NextResponse.json(
        { error: 'Erreur lors de la mise a jour du profil utilisateur' },
        { status: 500 },
      );
    }

    // 4. Create initial availability record if provided
    if (availability !== undefined && availability !== null) {
      const { error: availabilityError } = await client
        .from('availability')
        .insert({
          rpa_id: rpa.id,
          units_available: availability,
          source: 'web' as const,
          reported_at: new Date().toISOString(),
        });

      if (availabilityError) {
        console.error('Error creating availability:', availabilityError);
        // Don't rollback for this, just log
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        rpa,
        rpaProfile,
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 },
    );
  }
}
