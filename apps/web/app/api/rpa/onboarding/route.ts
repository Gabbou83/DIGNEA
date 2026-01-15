import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseServerClient();
    const adminClient = getSupabaseServerAdminClient();

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
    if (!name || !k10_id) {
      return NextResponse.json(
        { error: 'Le nom et le code K10 sont requis' },
        { status: 400 },
      );
    }

    // Start transaction
    // 1. Find existing RPA by k10_id
    let rpa;
    const { data: existingRPA } = await adminClient
      .from('rpas')
      .select('id, k10_id, name')
      .eq('k10_id', k10_id)
      .single();

    if (existingRPA) {
      // RPA exists - check if it already has a manager
      const { data: existingManager } = await client
        .from('rpa_profiles')
        .select('id, user_id')
        .eq('rpa_id', existingRPA.id)
        .eq('is_active', true)
        .single();

      if (existingManager) {
        return NextResponse.json(
          { error: 'Cette residence a deja un gestionnaire inscrit' },
          { status: 409 },
        );
      }

      // Update RPA with new information if provided
      if (address || city || region || postal_code) {
        const { data: updatedRPA } = await adminClient
          .from('rpas')
          .update({
            address: address || existingRPA.address,
            city: city || existingRPA.city,
            region: region || existingRPA.region,
            postal_code: postal_code || existingRPA.postal_code,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRPA.id)
          .select()
          .single();

        rpa = updatedRPA || existingRPA;
      } else {
        rpa = existingRPA;
      }
    } else {
      // RPA doesn't exist - create it (shouldn't happen with K10 system)
      const rpaData = {
        k10_id,
        name,
        address,
        city,
        region,
        postal_code,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const { data: newRPA, error: rpaError } = await adminClient
        .from('rpas')
        .insert(rpaData)
        .select()
        .single();

      if (rpaError || !newRPA) {
        console.error('Error creating RPA:', rpaError);
        return NextResponse.json(
          { error: 'Erreur lors de la creation de la residence' },
          { status: 500 },
        );
      }

      rpa = newRPA;
    }

    if (!rpa) {
      return NextResponse.json(
        { error: 'Erreur lors de la recherche de la residence' },
        { status: 500 },
      );
    }

    // 2. Create RPA profile (user_id is required)
    const { data: rpaProfile, error: profileError } = await adminClient
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
      await adminClient.from('rpas').delete().eq('id', rpa.id);
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
      await adminClient.from('rpa_profiles').delete().eq('id', rpaProfile.id);
      await adminClient.from('rpas').delete().eq('id', rpa.id);
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
