-- Fix Infinite Recursion in rpa_profiles RLS Policy
-- Purpose: Replace recursive policy with SECURITY DEFINER function
-- Date: 2026-01-16

-- ============================================================================
-- Drop the problematic recursive policy
-- ============================================================================

DROP POLICY IF EXISTS "rpa_managers_read_team" ON public.rpa_profiles;

-- ============================================================================
-- Create SECURITY DEFINER function to check if user is RPA manager
-- This function bypasses RLS to avoid recursion
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_rpa_manager(p_rpa_id UUID, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.rpa_profiles
    WHERE rpa_profiles.rpa_id = p_rpa_id
    AND rpa_profiles.user_id = user_id
    AND rpa_profiles.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Recreate policy using SECURITY DEFINER function
-- ============================================================================

CREATE POLICY "rpa_managers_read_team" ON public.rpa_profiles
  FOR SELECT USING (
    public.is_rpa_manager(rpa_profiles.rpa_id, auth.uid())
  );

-- ============================================================================
-- COMMENT
-- ============================================================================

COMMENT ON FUNCTION public.is_rpa_manager(UUID, UUID) IS 'SECURITY DEFINER function to check if user manages an RPA without triggering RLS recursion';
