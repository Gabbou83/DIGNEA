-- Fix Infinite Recursion in user_profiles RLS Policy
-- Purpose: Replace recursive policy with SECURITY DEFINER function
-- Date: 2026-01-16

-- ============================================================================
-- Drop the problematic recursive policy
-- ============================================================================

DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.user_profiles;

-- ============================================================================
-- Create SECURITY DEFINER function to check admin status
-- This function bypasses RLS to avoid recursion
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = user_id AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Recreate admin policy using the SECURITY DEFINER function
-- ============================================================================

CREATE POLICY "admins_read_all_profiles" ON public.user_profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- ============================================================================
-- Update other policies that reference user_profiles to use the function
-- ============================================================================

-- Update RPA admin policy
DROP POLICY IF EXISTS "admins_all_access" ON public.rpas;
CREATE POLICY "admins_all_access" ON public.rpas
  FOR ALL USING (public.is_admin(auth.uid()));

-- Update healthcare_profiles admin verification policy
DROP POLICY IF EXISTS "admins_verify_healthcare_profiles" ON public.healthcare_profiles;
CREATE POLICY "admins_verify_healthcare_profiles" ON public.healthcare_profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

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
-- COMMENT
-- ============================================================================

COMMENT ON FUNCTION public.is_admin(UUID) IS 'SECURITY DEFINER function to check if user is admin without triggering RLS recursion';
