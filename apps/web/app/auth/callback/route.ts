import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

import { createAuthCallbackService } from '@kit/supabase/auth';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';

export async function GET(request: NextRequest) {
  const client = getSupabaseServerClient();
  const service = createAuthCallbackService(client);

  const { nextPath } = await service.exchangeCodeForSession(request, {
    joinTeamPath: pathsConfig.app.joinTeam,
    redirectPath: pathsConfig.app.home,
  });

  // Check if user has completed RPA onboarding
  const { data: { user } } = await client.auth.getUser();

  if (user) {
    // Check if user has an RPA profile
    const { data: rpaProfile } = await client
      .from('rpa_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // If no RPA profile exists, redirect to onboarding
    if (!rpaProfile) {
      return redirect(pathsConfig.rpa.onboarding);
    }
  }

  return redirect(nextPath);
}
