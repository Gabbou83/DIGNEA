/**
 * DIGNEA AI Package - Type Definitions
 * Types for NLU, entity extraction, matching, and conversations
 */

// ============================================================================
// Patient Profile Entities (Extracted by AI)
// ============================================================================

export interface PatientProfile {
  // Demographics
  age?: number;
  gender?: 'male' | 'female' | 'other';
  relation?: string; // "mother", "father", "spouse", etc.

  // Autonomy Level
  autonomy?: 'autonomous' | 'semi_autonomous' | 'loss_of_independence';

  // Medical Conditions
  conditions?: {
    alzheimers?: boolean;
    parkinsons?: boolean;
    diabetes?: boolean;
    mobility_issues?: boolean;
    cognitive_decline?: boolean;
    other?: string[];
  };

  // Care Needs
  care_needs?: {
    nursing?: boolean;
    medication_management?: boolean;
    adl_assistance?: boolean; // Activities of Daily Living
    specialized_care?: string[];
  };

  // Budget
  budget?: {
    amount?: number;
    flexibility?: 'strict' | 'flexible' | 'negotiable';
    currency?: 'CAD';
  };

  // Location Preferences
  location?: {
    city?: string;
    region?: string;
    proximity_to?: string; // Address or landmark
    max_distance_km?: number;
  };

  // Urgency
  urgency?: {
    level?: 'normal' | 'urgent_48h' | 'urgent_24h';
    reason?: string;
    deadline?: string; // ISO date string
  };

  // Preferences
  preferences?: {
    language?: string[]; // ["fr", "en"]
    religion?: string;
    activities?: string[];
    dietary_restrictions?: string[];
    pet_friendly?: boolean;
    smoking_allowed?: boolean;
  };

  // Additional Context
  notes?: string;
  raw_input?: string;
}

// ============================================================================
// Conversation Types
// ============================================================================

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ConversationContext {
  conversation_id?: string;
  messages: ConversationMessage[];
  extracted_entities?: PatientProfile;
  requester_type?: 'family' | 'healthcare_worker';
  metadata?: Record<string, unknown>;
}

// ============================================================================
// RPA Matching Types
// ============================================================================

export interface RPAMatchCriteria {
  profile: PatientProfile;
  hard_filters: {
    budget_range?: { min: number; max: number };
    care_level?: number[]; // RPA categories [1, 2, 3, 4]
    location?: { city?: string; region?: string; max_distance_km?: number };
    required_services?: string[];
  };
  soft_preferences: {
    preferred_languages?: string[];
    preferred_amenities?: string[];
    preferred_activities?: string[];
  };
}

export interface RPAMatch {
  rpa_id: string;
  score: number; // 0-100
  match_details: {
    budget_match: number; // 0-100
    care_match: number;
    location_match: number;
    availability_match: number;
    responsiveness_match: number;
  };
  reasons: string[]; // Human-readable reasons for the match
  availability: {
    units_available: number;
    last_updated: Date;
  };
  rpa_info: {
    name: string;
    city: string;
    region: string;
    pricing_min: number;
    pricing_max: number;
    rating?: number;
  };
}

// ============================================================================
// NLU Engine Types
// ============================================================================

export interface NLUExtractionResult {
  entities: PatientProfile;
  confidence: number; // 0-1
  missing_fields: string[];
  clarification_needed?: {
    field: string;
    question: string;
  }[];
}

export interface NLUGenerationOptions {
  tone?: 'empathetic' | 'professional' | 'direct';
  language?: 'fr' | 'en';
  context?: ConversationContext;
  include_suggestions?: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export class AIError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'RATE_LIMIT_EXCEEDED'
      | 'API_ERROR'
      | 'INVALID_INPUT'
      | 'EXTRACTION_FAILED'
      | 'GENERATION_FAILED',
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export class MatchingError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'NO_MATCHES_FOUND'
      | 'INVALID_CRITERIA'
      | 'DATABASE_ERROR',
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'MatchingError';
  }
}
