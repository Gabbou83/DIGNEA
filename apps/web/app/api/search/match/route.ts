import { NextRequest, NextResponse } from 'next/server';

import { MatchingEngine } from '@kit/ai/matching-engine';
import type { PatientProfile } from '@kit/ai/types';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { patientProfile, limit, offset, requireAvailability } = body;

    if (!patientProfile) {
      return NextResponse.json(
        { error: 'Profil patient requis' },
        { status: 400 },
      );
    }

    // Get Supabase admin client (needed for public searches)
    const client = getSupabaseServerAdminClient();

    // Initialize matching engine
    const matchingEngine = new MatchingEngine();

    // Find matches
    const matches = await matchingEngine.findMatches(
      client,
      patientProfile as PatientProfile,
      {
        limit: limit || 10,
        offset: offset || 0,
        requireAvailability: requireAvailability !== false, // Default true
      },
    );

    return NextResponse.json({
      matches,
      total: matches.length,
      hasMore: matches.length === (limit || 10),
    });
  } catch (error) {
    console.error('Error in RPA matching:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));

    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
