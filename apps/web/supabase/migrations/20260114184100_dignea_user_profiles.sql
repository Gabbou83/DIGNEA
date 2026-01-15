-- DIGNÉA User Profiles Migration
-- Purpose: Create user profiles table (cannot modify auth.users in Supabase Cloud)
-- Author: DIGNÉA Team
-- Date: 2026-01-14

-- ============================================================================
-- TABLE: user_profiles
-- Extends auth.users with DIGNÉA-specific fields
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- User Type
  user_type public.user_type DEFAULT 'public' NOT NULL,

  -- Profile Link
  profile_id UUID, -- Links to rpa_profiles or healthcare_profiles

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,

  -- Preferences
  preferences JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on user_type for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_id ON public.user_profiles(profile_id);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can read and update their own profile
CREATE POLICY "users_read_own_profile" ON public.user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own_profile" ON public.user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_insert_own_profile" ON public.user_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "admins_read_all_profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.user_type = 'admin'
    )
  );

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- FUNCTION: Automatically create user_profile when user signs up
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, user_type)
  VALUES (NEW.id, 'public');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- HELPER FUNCTION: Get user profile with type
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  user_type public.user_type,
  email TEXT,
  profile_id UUID,
  onboarding_completed BOOLEAN,
  preferences JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.id,
    up.user_type,
    au.email,
    up.profile_id,
    up.onboarding_completed,
    up.preferences
  FROM public.user_profiles up
  JOIN auth.users au ON au.id = up.id
  WHERE up.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UPDATE RLS POLICIES for other tables to use user_profiles
-- ============================================================================

-- Update RPA policies to check user_profiles instead of auth.users
DROP POLICY IF EXISTS "admins_all_access" ON public.rpas;
CREATE POLICY "admins_all_access" ON public.rpas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Update healthcare_profiles admin verification policy
DROP POLICY IF EXISTS "admins_verify_healthcare_profiles" ON public.healthcare_profiles;
CREATE POLICY "admins_verify_healthcare_profiles" ON public.healthcare_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Update requests healthcare read policy
DROP POLICY IF EXISTS "healthcare_read_requests" ON public.requests;
CREATE POLICY "healthcare_read_requests" ON public.requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND user_type = 'healthcare_worker'
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.user_profiles IS 'User profiles extending auth.users with DIGNÉA-specific fields';
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user_profile when a new user signs up';
COMMENT ON FUNCTION public.get_user_profile(UUID) IS 'Helper function to get user profile with type and email';
