import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

/**
 * Load RPA dashboard data for the authenticated user
 */
export async function loadRPADashboardData() {
  const client = getSupabaseServerClient();

  // Get current user
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return {
      hasRPA: false,
      availability: null,
      inquiries: [],
      stats: null,
    };
  }

  // Get user profile to find their RPA
  const { data: userProfile } = await client
    .from('user_profiles')
    .select('profile_id, user_type')
    .eq('id', user.id)
    .single();

  if (!userProfile || userProfile.user_type !== 'rpa_manager') {
    return {
      hasRPA: false,
      availability: null,
      inquiries: [],
      stats: null,
    };
  }

  // Get RPA profile
  const { data: rpaProfile } = await client
    .from('rpa_profiles')
    .select('id, rpa_id, sms_phone, sms_enabled')
    .eq('id', userProfile?.profile_id || '')
    .single();

  if (!rpaProfile) {
    return {
      hasRPA: false,
      availability: null,
      inquiries: [],
      stats: null,
    };
  }

  // Get RPA details
  const { data: rpa } = await client
    .from('rpas')
    .select('id, name, k10_id')
    .eq('id', rpaProfile.rpa_id)
    .single();

  // Get latest availability
  const { data: availability } = await client
    .from('availability')
    .select('units_available, reported_at, source')
    .eq('rpa_id', rpaProfile.rpa_id)
    .order('reported_at', { ascending: false })
    .limit(1)
    .single();

  // Get recent inquiries (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: inquiries } = await client
    .from('contacts')
    .select('id, requester_email, message, created_at, responded_at')
    .eq('rpa_id', rpaProfile.rpa_id)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  // Get stats
  const { count: totalInquiries } = await client
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('rpa_id', rpaProfile.rpa_id)
    .gte('created_at', thirtyDaysAgo.toISOString());

  return {
    hasRPA: true,
    rpa,
    rpaProfile,
    availability: availability || null,
    inquiries: inquiries || [],
    stats: {
      totalInquiries: totalInquiries || 0,
      responseRate: 0, // TODO: Calculate from responded vs total
      avgResponseTime: 0, // TODO: Calculate from contacts data
    },
  };
}
