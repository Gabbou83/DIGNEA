-- Grant Permissions for RLS SECURITY DEFINER Functions
-- Purpose: Allow authenticated users to execute RLS helper functions
-- Date: 2026-01-16

-- ============================================================================
-- Grant EXECUTE on is_admin function
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;

-- ============================================================================
-- Grant EXECUTE on is_rpa_manager function
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.is_rpa_manager(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_rpa_manager(UUID, UUID) TO anon;

-- ============================================================================
-- COMMENT
-- ============================================================================

COMMENT ON FUNCTION public.is_admin(UUID) IS 'SECURITY DEFINER function - EXECUTE granted to authenticated and anon';
COMMENT ON FUNCTION public.is_rpa_manager(UUID, UUID) IS 'SECURITY DEFINER function - EXECUTE granted to authenticated and anon';
