-- DIGNÉA Database Schema Migration
-- Purpose: Add core tables for DIGNÉA's three-portal retirement placement system
-- Author: DIGNÉA Team
-- Date: 2026-01-14

-- ============================================================================
-- EXTENSION: Enable UUID generation
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- User types for the three portals
CREATE TYPE public.user_type AS ENUM ('public', 'rpa_manager', 'healthcare_worker', 'admin');

-- Autonomy levels for patient profiles
CREATE TYPE public.autonomy_level AS ENUM ('autonomous', 'semi_autonomous', 'loss_of_independence');

-- Urgency levels for patient requests
CREATE TYPE public.urgency_level AS ENUM ('normal', 'urgent_48h', 'urgent_24h');

-- Contact types
CREATE TYPE public.contact_type AS ENUM ('call', 'message', 'visit_request', 'urgent_broadcast');

-- SMS direction
CREATE TYPE public.sms_direction AS ENUM ('inbound', 'outbound');

-- Availability source
CREATE TYPE public.availability_source AS ENUM ('sms', 'web', 'api');

-- ============================================================================
-- NOTE: User profiles are managed in separate migration 20260114184100_dignea_user_profiles.sql
-- Cannot modify auth.users directly in Supabase Cloud
-- ============================================================================

-- ============================================================================
-- TABLE: rpas
-- Retirement residence profiles (RPA = Résidence pour Personnes Âgées)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rpas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- K10 Registry Information
  k10_id VARCHAR UNIQUE NOT NULL, -- Unique ID from Quebec's K10 registry

  -- Basic Information
  name VARCHAR NOT NULL,
  description TEXT,

  -- Contact Information
  address TEXT,
  city VARCHAR,
  postal_code VARCHAR,
  region VARCHAR, -- Quebec region (Outaouais, Montreal, etc.)
  phone VARCHAR,
  email VARCHAR,
  website VARCHAR,

  -- Owner/Management
  owner_name VARCHAR,
  manager_user_id UUID REFERENCES auth.users(id),

  -- Categorization
  category INTEGER CHECK (category BETWEEN 1 AND 4), -- RPA category (1-4)
  total_units INTEGER,

  -- Services & Amenities
  services JSONB DEFAULT '{}', -- nursing, medication, activities, etc.
  amenities JSONB DEFAULT '[]', -- pool, gym, garden, etc.
  care_capabilities JSONB DEFAULT '[]', -- Alzheimer's, Parkinson's, mobility, etc.
  languages_spoken JSONB DEFAULT '["fr"]', -- ["fr", "en", "es"]

  -- Pricing
  pricing_min INTEGER, -- Minimum monthly price in CAD
  pricing_max INTEGER, -- Maximum monthly price in CAD
  pricing_details JSONB DEFAULT '{}', -- Detailed pricing breakdown

  -- Media
  photos TEXT[] DEFAULT '{}', -- Array of photo URLs
  virtual_tour_url VARCHAR,

  -- Performance Metrics
  response_time_hours DECIMAL DEFAULT 24, -- Average response time
  rating DECIMAL CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,

  -- Status & Subscription
  is_active BOOLEAN DEFAULT true,
  subscription_id UUID, -- Link to Stripe subscription
  subscription_plan VARCHAR, -- basic, pro, premium

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_availability_update TIMESTAMPTZ,

  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(city, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(region, '')), 'A')
  ) STORED
);

-- Indexes for rpas table
CREATE INDEX idx_rpas_k10_id ON public.rpas(k10_id);
CREATE INDEX idx_rpas_region ON public.rpas(region);
CREATE INDEX idx_rpas_city ON public.rpas(city);
CREATE INDEX idx_rpas_is_active ON public.rpas(is_active);
CREATE INDEX idx_rpas_category ON public.rpas(category);
CREATE INDEX idx_rpas_search_vector ON public.rpas USING GIN(search_vector);
CREATE INDEX idx_rpas_updated_at ON public.rpas(updated_at DESC);

-- ============================================================================
-- TABLE: availability
-- Time-series tracking of RPA unit availability
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rpa_id UUID REFERENCES public.rpas(id) ON DELETE CASCADE NOT NULL,

  -- Availability Data
  units_available INTEGER NOT NULL CHECK (units_available >= 0),
  unit_types JSONB DEFAULT '[]', -- [{type: "studio", count: 1}, {type: "1br", count: 2}]

  -- Metadata
  source public.availability_source NOT NULL, -- sms, web, or api
  reported_by UUID REFERENCES auth.users(id),
  reported_at TIMESTAMPTZ DEFAULT NOW(),

  -- Additional Context
  notes TEXT,

  CONSTRAINT check_units_available CHECK (units_available >= 0)
);

-- Indexes for availability table
CREATE INDEX idx_availability_rpa_time ON public.availability(rpa_id, reported_at DESC);

-- ============================================================================
-- TABLE: rpa_profiles
-- Links users to RPAs with roles and permissions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rpa_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rpa_id UUID REFERENCES public.rpas(id) ON DELETE CASCADE NOT NULL,

  -- Role & Permissions
  role VARCHAR DEFAULT 'manager', -- owner, manager, staff
  permissions JSONB DEFAULT '{}', -- {can_update_availability: true, can_respond_inquiries: true}

  -- SMS Settings
  sms_phone VARCHAR,
  sms_enabled BOOLEAN DEFAULT true,
  sms_daily_reminder BOOLEAN DEFAULT true,
  sms_inquiry_alerts BOOLEAN DEFAULT true,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, rpa_id)
);

-- Indexes for rpa_profiles
CREATE INDEX idx_rpa_profiles_user_id ON public.rpa_profiles(user_id);
CREATE INDEX idx_rpa_profiles_rpa_id ON public.rpa_profiles(rpa_id);
CREATE INDEX idx_rpa_profiles_active ON public.rpa_profiles(rpa_id, is_active);

-- ============================================================================
-- TABLE: healthcare_profiles
-- Healthcare worker profiles (CISSS/CIUSSS social workers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.healthcare_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Organization
  organization_name VARCHAR, -- CISSS/CIUSSS name
  organization_type VARCHAR, -- CISSS, CIUSSS, hospital, CLSC
  department VARCHAR,

  -- Role
  role VARCHAR DEFAULT 'social_worker', -- social_worker, liaison_officer, case_manager
  employee_id VARCHAR,

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),

  -- Contact
  work_phone VARCHAR,
  work_email VARCHAR,

  -- Permissions
  can_use_urgent_mode BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for healthcare_profiles
CREATE INDEX idx_healthcare_profiles_user_id ON public.healthcare_profiles(user_id);
CREATE INDEX idx_healthcare_profiles_verified ON public.healthcare_profiles(is_verified);
CREATE INDEX idx_healthcare_profiles_organization ON public.healthcare_profiles(organization_name);

-- ============================================================================
-- TABLE: requests
-- Patient search requests with AI conversation history
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Requester Information
  requester_type VARCHAR CHECK (requester_type IN ('family', 'healthcare_worker')) NOT NULL,
  requester_id UUID REFERENCES auth.users(id), -- NULL for anonymous searches
  requester_contact JSONB, -- {name, email, phone} for anonymous users

  -- Patient Profile (extracted by AI)
  patient_profile JSONB NOT NULL, -- {age, gender, autonomy, conditions, care_needs, etc.}

  -- Search Criteria
  location_preference TEXT, -- City, region, or address
  location_coordinates JSONB, -- {lat, lng} for distance calculations
  budget_min INTEGER,
  budget_max INTEGER,

  -- Urgency
  urgency_level public.urgency_level DEFAULT 'normal',
  deadline_date DATE,

  -- AI Conversation
  ai_conversation JSONB DEFAULT '[]', -- [{role: "user", content: "..."}, {role: "assistant", content: "..."}]
  extracted_entities JSONB DEFAULT '{}', -- Structured entities from AI

  -- Status
  status VARCHAR DEFAULT 'open', -- open, in_progress, placed, closed
  outcome VARCHAR, -- placed, declined, cancelled
  placed_at_rpa_id UUID REFERENCES public.rpas(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for requests
CREATE INDEX idx_requests_requester ON public.requests(requester_id, created_at DESC);
CREATE INDEX idx_requests_status ON public.requests(status, created_at DESC);
CREATE INDEX idx_requests_urgency ON public.requests(urgency_level, created_at DESC);
CREATE INDEX idx_requests_type ON public.requests(requester_type);

-- ============================================================================
-- TABLE: contacts
-- Communication between families/healthcare and RPAs
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  rpa_id UUID REFERENCES public.rpas(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES auth.users(id),

  -- Contact Details
  contact_type public.contact_type NOT NULL,
  message TEXT,
  requester_phone VARCHAR,
  requester_email VARCHAR,

  -- Response Tracking
  response TEXT,
  response_time_minutes INTEGER,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id),

  -- Outcome
  outcome VARCHAR, -- interested, not_available, scheduled_visit, placed, declined
  follow_up_date DATE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for contacts
CREATE INDEX idx_contacts_request ON public.contacts(request_id, created_at DESC);
CREATE INDEX idx_contacts_rpa ON public.contacts(rpa_id, created_at DESC);
CREATE INDEX idx_contacts_outcome ON public.contacts(outcome);
CREATE INDEX idx_contacts_type ON public.contacts(contact_type);

-- ============================================================================
-- TABLE: sms_logs
-- SMS tracking for availability updates and notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Association
  rpa_id UUID REFERENCES public.rpas(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- SMS Details
  phone VARCHAR NOT NULL,
  message TEXT NOT NULL,
  direction public.sms_direction NOT NULL,

  -- Twilio Integration
  twilio_sid VARCHAR UNIQUE,
  twilio_status VARCHAR, -- queued, sent, delivered, failed
  twilio_error_code VARCHAR,
  twilio_error_message TEXT,

  -- Processing
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  processing_result JSONB, -- {availability_updated: true, new_value: 3}

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sms_logs
CREATE INDEX idx_sms_logs_rpa ON public.sms_logs(rpa_id, created_at DESC);
CREATE INDEX idx_sms_logs_direction ON public.sms_logs(direction, created_at DESC);
CREATE INDEX idx_sms_logs_status ON public.sms_logs(twilio_status);
CREATE INDEX idx_sms_logs_unprocessed ON public.sms_logs(is_processed, created_at)
  WHERE is_processed = false;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.rpas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpa_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: rpas
-- ============================================================================

-- Public can read active RPAs
CREATE POLICY "public_read_active_rpas" ON public.rpas
  FOR SELECT USING (is_active = true);

-- RPA managers can read their own RPA
CREATE POLICY "rpa_managers_read_own" ON public.rpas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rpa_profiles
      WHERE rpa_profiles.rpa_id = rpas.id
      AND rpa_profiles.user_id = auth.uid()
      AND rpa_profiles.is_active = true
    )
  );

-- RPA managers can update their own RPA
CREATE POLICY "rpa_managers_update_own" ON public.rpas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.rpa_profiles
      WHERE rpa_profiles.rpa_id = rpas.id
      AND rpa_profiles.user_id = auth.uid()
      AND rpa_profiles.is_active = true
    )
  );


-- ============================================================================
-- RLS POLICIES: availability
-- ============================================================================

-- Public can read availability
CREATE POLICY "public_read_availability" ON public.availability
  FOR SELECT USING (true);

-- RPA managers can insert availability for their RPA
CREATE POLICY "rpa_managers_insert_availability" ON public.availability
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rpa_profiles
      WHERE rpa_profiles.rpa_id = availability.rpa_id
      AND rpa_profiles.user_id = auth.uid()
      AND rpa_profiles.is_active = true
    )
  );

-- ============================================================================
-- RLS POLICIES: rpa_profiles
-- ============================================================================

-- Users can read their own profiles
CREATE POLICY "users_read_own_profiles" ON public.rpa_profiles
  FOR SELECT USING (user_id = auth.uid());

-- RPA managers can read profiles for their RPA
CREATE POLICY "rpa_managers_read_team" ON public.rpa_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rpa_profiles AS own_profile
      WHERE own_profile.rpa_id = rpa_profiles.rpa_id
      AND own_profile.user_id = auth.uid()
      AND own_profile.is_active = true
    )
  );

-- ============================================================================
-- RLS POLICIES: healthcare_profiles
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "users_read_own_healthcare_profile" ON public.healthcare_profiles
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own_healthcare_profile" ON public.healthcare_profiles
  FOR UPDATE USING (user_id = auth.uid());


-- ============================================================================
-- RLS POLICIES: requests
-- ============================================================================

-- Users can read their own requests
CREATE POLICY "users_read_own_requests" ON public.requests
  FOR SELECT USING (requester_id = auth.uid());

-- Users can create requests
CREATE POLICY "users_create_requests" ON public.requests
  FOR INSERT WITH CHECK (requester_id = auth.uid() OR requester_id IS NULL);

-- Users can update their own requests
CREATE POLICY "users_update_own_requests" ON public.requests
  FOR UPDATE USING (requester_id = auth.uid());


-- ============================================================================
-- RLS POLICIES: contacts
-- ============================================================================

-- RPA managers can read contacts for their RPA
CREATE POLICY "rpa_managers_read_contacts" ON public.contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rpa_profiles
      WHERE rpa_profiles.rpa_id = contacts.rpa_id
      AND rpa_profiles.user_id = auth.uid()
      AND rpa_profiles.is_active = true
    )
  );

-- Requesters can read their own contacts
CREATE POLICY "requesters_read_own_contacts" ON public.contacts
  FOR SELECT USING (requester_id = auth.uid());

-- Users can create contacts
CREATE POLICY "users_create_contacts" ON public.contacts
  FOR INSERT WITH CHECK (true);

-- RPA managers can update/respond to contacts
CREATE POLICY "rpa_managers_update_contacts" ON public.contacts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.rpa_profiles
      WHERE rpa_profiles.rpa_id = contacts.rpa_id
      AND rpa_profiles.user_id = auth.uid()
      AND rpa_profiles.is_active = true
    )
  );

-- ============================================================================
-- RLS POLICIES: sms_logs
-- ============================================================================

-- RPA managers can read SMS logs for their RPA
CREATE POLICY "rpa_managers_read_sms_logs" ON public.sms_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rpa_profiles
      WHERE rpa_profiles.rpa_id = sms_logs.rpa_id
      AND rpa_profiles.user_id = auth.uid()
      AND rpa_profiles.is_active = true
    )
  );

-- Service role can insert SMS logs
CREATE POLICY "service_insert_sms_logs" ON public.sms_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_rpas_updated_at
  BEFORE UPDATE ON public.rpas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rpa_profiles_updated_at
  BEFORE UPDATE ON public.rpa_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_healthcare_profiles_updated_at
  BEFORE UPDATE ON public.healthcare_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function: Update RPA's last_availability_update when availability is inserted
CREATE OR REPLACE FUNCTION public.update_rpa_last_availability()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.rpas
  SET last_availability_update = NEW.reported_at
  WHERE id = NEW.rpa_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rpa_last_availability_trigger
  AFTER INSERT ON public.availability
  FOR EACH ROW EXECUTE FUNCTION public.update_rpa_last_availability();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get latest availability for an RPA
CREATE OR REPLACE FUNCTION public.get_latest_availability(p_rpa_id UUID)
RETURNS TABLE (
  units_available INTEGER,
  unit_types JSONB,
  reported_at TIMESTAMPTZ,
  source availability_source
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.units_available,
    a.unit_types,
    a.reported_at,
    a.source
  FROM public.availability a
  WHERE a.rpa_id = p_rpa_id
  ORDER BY a.reported_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Search RPAs by criteria
CREATE OR REPLACE FUNCTION public.search_rpas(
  p_search_text TEXT DEFAULT NULL,
  p_region VARCHAR DEFAULT NULL,
  p_city VARCHAR DEFAULT NULL,
  p_min_price INTEGER DEFAULT NULL,
  p_max_price INTEGER DEFAULT NULL,
  p_category INTEGER DEFAULT NULL,
  p_has_availability BOOLEAN DEFAULT true,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  city VARCHAR,
  region VARCHAR,
  pricing_min INTEGER,
  pricing_max INTEGER,
  category INTEGER,
  rating DECIMAL,
  latest_units_available INTEGER,
  last_availability_update TIMESTAMPTZ,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.city,
    r.region,
    r.pricing_min,
    r.pricing_max,
    r.category,
    r.rating,
    (SELECT a.units_available
     FROM public.availability a
     WHERE a.rpa_id = r.id
     ORDER BY a.reported_at DESC
     LIMIT 1) AS latest_units_available,
    r.last_availability_update,
    NULL::DECIMAL AS distance_km -- TODO: Calculate distance using coordinates
  FROM public.rpas r
  WHERE
    r.is_active = true
    AND (p_search_text IS NULL OR r.search_vector @@ websearch_to_tsquery('french', p_search_text))
    AND (p_region IS NULL OR r.region = p_region)
    AND (p_city IS NULL OR r.city = p_city)
    AND (p_min_price IS NULL OR r.pricing_max >= p_min_price)
    AND (p_max_price IS NULL OR r.pricing_min <= p_max_price)
    AND (p_category IS NULL OR r.category = p_category)
    AND (
      p_has_availability = false
      OR EXISTS (
        SELECT 1 FROM public.availability a
        WHERE a.rpa_id = r.id
        AND a.units_available > 0
        AND a.reported_at > NOW() - INTERVAL '7 days'
      )
    )
  ORDER BY r.rating DESC, r.last_availability_update DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.rpas IS 'Retirement residences (Résidences pour Personnes Âgées)';
COMMENT ON TABLE public.availability IS 'Time-series tracking of available units per RPA';
COMMENT ON TABLE public.rpa_profiles IS 'Links users to RPAs with roles and SMS preferences';
COMMENT ON TABLE public.healthcare_profiles IS 'Healthcare worker profiles (social workers, case managers)';
COMMENT ON TABLE public.requests IS 'Patient placement requests with AI conversation history';
COMMENT ON TABLE public.contacts IS 'Communication logs between families/healthcare and RPAs';
COMMENT ON TABLE public.sms_logs IS 'SMS message tracking for availability updates and notifications';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
