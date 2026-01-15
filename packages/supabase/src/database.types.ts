export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          is_personal_account: boolean
          name: string
          picture_url: string | null
          primary_owner_user_id: string
          public_data: Json
          slug: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_personal_account?: boolean
          name: string
          picture_url?: string | null
          primary_owner_user_id?: string
          public_data?: Json
          slug?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_personal_account?: boolean
          name?: string
          picture_url?: string | null
          primary_owner_user_id?: string
          public_data?: Json
          slug?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      accounts_memberships: {
        Row: {
          account_id: string
          account_role: string
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          account_role: string
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          account_role?: string
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_memberships_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_memberships_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_memberships_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_memberships_account_role_fkey"
            columns: ["account_role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
        ]
      }
      availability: {
        Row: {
          id: string
          notes: string | null
          reported_at: string | null
          reported_by: string | null
          rpa_id: string
          source: Database["public"]["Enums"]["availability_source"]
          unit_types: Json | null
          units_available: number
        }
        Insert: {
          id?: string
          notes?: string | null
          reported_at?: string | null
          reported_by?: string | null
          rpa_id: string
          source: Database["public"]["Enums"]["availability_source"]
          unit_types?: Json | null
          units_available: number
        }
        Update: {
          id?: string
          notes?: string | null
          reported_at?: string | null
          reported_by?: string | null
          rpa_id?: string
          source?: Database["public"]["Enums"]["availability_source"]
          unit_types?: Json | null
          units_available?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_rpa_id_fkey"
            columns: ["rpa_id"]
            isOneToOne: false
            referencedRelation: "rpas"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_customers: {
        Row: {
          account_id: string
          customer_id: string
          email: string | null
          id: number
          provider: Database["public"]["Enums"]["billing_provider"]
        }
        Insert: {
          account_id: string
          customer_id: string
          email?: string | null
          id?: number
          provider: Database["public"]["Enums"]["billing_provider"]
        }
        Update: {
          account_id?: string
          customer_id?: string
          email?: string | null
          id?: number
          provider?: Database["public"]["Enums"]["billing_provider"]
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_customers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_customers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      config: {
        Row: {
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          enable_account_billing: boolean
          enable_team_account_billing: boolean
          enable_team_accounts: boolean
        }
        Insert: {
          billing_provider?: Database["public"]["Enums"]["billing_provider"]
          enable_account_billing?: boolean
          enable_team_account_billing?: boolean
          enable_team_accounts?: boolean
        }
        Update: {
          billing_provider?: Database["public"]["Enums"]["billing_provider"]
          enable_account_billing?: boolean
          enable_team_account_billing?: boolean
          enable_team_accounts?: boolean
        }
        Relationships: []
      }
      contacts: {
        Row: {
          contact_type: Database["public"]["Enums"]["contact_type"]
          created_at: string | null
          follow_up_date: string | null
          id: string
          message: string | null
          outcome: string | null
          request_id: string | null
          requester_email: string | null
          requester_id: string | null
          requester_phone: string | null
          responded_at: string | null
          responded_by: string | null
          response: string | null
          response_time_minutes: number | null
          rpa_id: string
          updated_at: string | null
        }
        Insert: {
          contact_type: Database["public"]["Enums"]["contact_type"]
          created_at?: string | null
          follow_up_date?: string | null
          id?: string
          message?: string | null
          outcome?: string | null
          request_id?: string | null
          requester_email?: string | null
          requester_id?: string | null
          requester_phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          response_time_minutes?: number | null
          rpa_id: string
          updated_at?: string | null
        }
        Update: {
          contact_type?: Database["public"]["Enums"]["contact_type"]
          created_at?: string | null
          follow_up_date?: string | null
          id?: string
          message?: string | null
          outcome?: string | null
          request_id?: string | null
          requester_email?: string | null
          requester_id?: string | null
          requester_phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          response_time_minutes?: number | null
          rpa_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_rpa_id_fkey"
            columns: ["rpa_id"]
            isOneToOne: false
            referencedRelation: "rpas"
            referencedColumns: ["id"]
          },
        ]
      }
      healthcare_profiles: {
        Row: {
          can_use_urgent_mode: boolean | null
          created_at: string | null
          department: string | null
          employee_id: string | null
          id: string
          is_verified: boolean | null
          organization_name: string | null
          organization_type: string | null
          role: string | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
          work_email: string | null
          work_phone: string | null
        }
        Insert: {
          can_use_urgent_mode?: boolean | null
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          id?: string
          is_verified?: boolean | null
          organization_name?: string | null
          organization_type?: string | null
          role?: string | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          work_email?: string | null
          work_phone?: string | null
        }
        Update: {
          can_use_urgent_mode?: boolean | null
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          id?: string
          is_verified?: boolean | null
          organization_name?: string | null
          organization_type?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          work_email?: string | null
          work_phone?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          account_id: string
          created_at: string
          email: string
          expires_at: string
          id: number
          invite_token: string
          invited_by: string
          role: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: number
          invite_token: string
          invited_by: string
          role: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: number
          invite_token?: string
          invited_by?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
        ]
      }
      nonces: {
        Row: {
          client_token: string
          created_at: string
          expires_at: string
          id: string
          last_verification_at: string | null
          last_verification_ip: unknown
          last_verification_user_agent: string | null
          metadata: Json | null
          nonce: string
          purpose: string
          revoked: boolean
          revoked_reason: string | null
          scopes: string[] | null
          used_at: string | null
          user_id: string | null
          verification_attempts: number
        }
        Insert: {
          client_token: string
          created_at?: string
          expires_at: string
          id?: string
          last_verification_at?: string | null
          last_verification_ip?: unknown
          last_verification_user_agent?: string | null
          metadata?: Json | null
          nonce: string
          purpose: string
          revoked?: boolean
          revoked_reason?: string | null
          scopes?: string[] | null
          used_at?: string | null
          user_id?: string | null
          verification_attempts?: number
        }
        Update: {
          client_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          last_verification_at?: string | null
          last_verification_ip?: unknown
          last_verification_user_agent?: string | null
          metadata?: Json | null
          nonce?: string
          purpose?: string
          revoked?: boolean
          revoked_reason?: string | null
          scopes?: string[] | null
          used_at?: string | null
          user_id?: string | null
          verification_attempts?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          account_id: string
          body: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          dismissed: boolean
          expires_at: string | null
          id: number
          link: string | null
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          account_id: string
          body: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          dismissed?: boolean
          expires_at?: string | null
          id?: never
          link?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          account_id?: string
          body?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          dismissed?: boolean
          expires_at?: string | null
          id?: never
          link?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_amount: number | null
          product_id: string
          quantity: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          id: string
          order_id: string
          price_amount?: number | null
          product_id: string
          quantity?: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_amount?: number | null
          product_id?: string
          quantity?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          account_id: string
          billing_customer_id: number
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          created_at: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          account_id: string
          billing_customer_id: number
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          created_at?: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          account_id?: string
          billing_customer_id?: number
          billing_provider?: Database["public"]["Enums"]["billing_provider"]
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_billing_customer_id_fkey"
            columns: ["billing_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          ai_conversation: Json | null
          budget_max: number | null
          budget_min: number | null
          completed_at: string | null
          created_at: string | null
          deadline_date: string | null
          extracted_entities: Json | null
          id: string
          location_coordinates: Json | null
          location_preference: string | null
          outcome: string | null
          patient_profile: Json
          placed_at_rpa_id: string | null
          requester_contact: Json | null
          requester_id: string | null
          requester_type: string
          status: string | null
          updated_at: string | null
          urgency_level: Database["public"]["Enums"]["urgency_level"] | null
        }
        Insert: {
          ai_conversation?: Json | null
          budget_max?: number | null
          budget_min?: number | null
          completed_at?: string | null
          created_at?: string | null
          deadline_date?: string | null
          extracted_entities?: Json | null
          id?: string
          location_coordinates?: Json | null
          location_preference?: string | null
          outcome?: string | null
          patient_profile: Json
          placed_at_rpa_id?: string | null
          requester_contact?: Json | null
          requester_id?: string | null
          requester_type: string
          status?: string | null
          updated_at?: string | null
          urgency_level?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Update: {
          ai_conversation?: Json | null
          budget_max?: number | null
          budget_min?: number | null
          completed_at?: string | null
          created_at?: string | null
          deadline_date?: string | null
          extracted_entities?: Json | null
          id?: string
          location_coordinates?: Json | null
          location_preference?: string | null
          outcome?: string | null
          patient_profile?: Json
          placed_at_rpa_id?: string | null
          requester_contact?: Json | null
          requester_id?: string | null
          requester_type?: string
          status?: string | null
          updated_at?: string | null
          urgency_level?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_placed_at_rpa_id_fkey"
            columns: ["placed_at_rpa_id"]
            isOneToOne: false
            referencedRelation: "rpas"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["app_permissions"]
          role: string
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["app_permissions"]
          role: string
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["app_permissions"]
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
        ]
      }
      roles: {
        Row: {
          hierarchy_level: number
          name: string
        }
        Insert: {
          hierarchy_level: number
          name: string
        }
        Update: {
          hierarchy_level?: number
          name?: string
        }
        Relationships: []
      }
      rpa_profiles: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string | null
          rpa_id: string
          sms_daily_reminder: boolean | null
          sms_enabled: boolean | null
          sms_inquiry_alerts: boolean | null
          sms_phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string | null
          rpa_id: string
          sms_daily_reminder?: boolean | null
          sms_enabled?: boolean | null
          sms_inquiry_alerts?: boolean | null
          sms_phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string | null
          rpa_id?: string
          sms_daily_reminder?: boolean | null
          sms_enabled?: boolean | null
          sms_inquiry_alerts?: boolean | null
          sms_phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rpa_profiles_rpa_id_fkey"
            columns: ["rpa_id"]
            isOneToOne: false
            referencedRelation: "rpas"
            referencedColumns: ["id"]
          },
        ]
      }
      rpas: {
        Row: {
          address: string | null
          amenities: Json | null
          care_capabilities: Json | null
          category: number | null
          city: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          k10_id: string
          languages_spoken: Json | null
          last_availability_update: string | null
          manager_user_id: string | null
          name: string
          owner_name: string | null
          phone: string | null
          photos: string[] | null
          postal_code: string | null
          pricing_details: Json | null
          pricing_max: number | null
          pricing_min: number | null
          rating: number | null
          region: string | null
          response_time_hours: number | null
          search_vector: unknown
          services: Json | null
          subscription_id: string | null
          subscription_plan: string | null
          total_reviews: number | null
          total_units: number | null
          updated_at: string | null
          virtual_tour_url: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          amenities?: Json | null
          care_capabilities?: Json | null
          category?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          k10_id: string
          languages_spoken?: Json | null
          last_availability_update?: string | null
          manager_user_id?: string | null
          name: string
          owner_name?: string | null
          phone?: string | null
          photos?: string[] | null
          postal_code?: string | null
          pricing_details?: Json | null
          pricing_max?: number | null
          pricing_min?: number | null
          rating?: number | null
          region?: string | null
          response_time_hours?: number | null
          search_vector?: unknown
          services?: Json | null
          subscription_id?: string | null
          subscription_plan?: string | null
          total_reviews?: number | null
          total_units?: number | null
          updated_at?: string | null
          virtual_tour_url?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          amenities?: Json | null
          care_capabilities?: Json | null
          category?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          k10_id?: string
          languages_spoken?: Json | null
          last_availability_update?: string | null
          manager_user_id?: string | null
          name?: string
          owner_name?: string | null
          phone?: string | null
          photos?: string[] | null
          postal_code?: string | null
          pricing_details?: Json | null
          pricing_max?: number | null
          pricing_min?: number | null
          rating?: number | null
          region?: string | null
          response_time_hours?: number | null
          search_vector?: unknown
          services?: Json | null
          subscription_id?: string | null
          subscription_plan?: string | null
          total_reviews?: number | null
          total_units?: number | null
          updated_at?: string | null
          virtual_tour_url?: string | null
          website?: string | null
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          created_at: string | null
          direction: Database["public"]["Enums"]["sms_direction"]
          id: string
          is_processed: boolean | null
          message: string
          phone: string
          processed_at: string | null
          processing_result: Json | null
          rpa_id: string | null
          twilio_error_code: string | null
          twilio_error_message: string | null
          twilio_sid: string | null
          twilio_status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          direction: Database["public"]["Enums"]["sms_direction"]
          id?: string
          is_processed?: boolean | null
          message: string
          phone: string
          processed_at?: string | null
          processing_result?: Json | null
          rpa_id?: string | null
          twilio_error_code?: string | null
          twilio_error_message?: string | null
          twilio_sid?: string | null
          twilio_status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          direction?: Database["public"]["Enums"]["sms_direction"]
          id?: string
          is_processed?: boolean | null
          message?: string
          phone?: string
          processed_at?: string | null
          processing_result?: Json | null
          rpa_id?: string | null
          twilio_error_code?: string | null
          twilio_error_message?: string | null
          twilio_sid?: string | null
          twilio_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_rpa_id_fkey"
            columns: ["rpa_id"]
            isOneToOne: false
            referencedRelation: "rpas"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_items: {
        Row: {
          created_at: string
          id: string
          interval: string
          interval_count: number
          price_amount: number | null
          product_id: string
          quantity: number
          subscription_id: string
          type: Database["public"]["Enums"]["subscription_item_type"]
          updated_at: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          id: string
          interval: string
          interval_count: number
          price_amount?: number | null
          product_id: string
          quantity?: number
          subscription_id: string
          type: Database["public"]["Enums"]["subscription_item_type"]
          updated_at?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interval?: string
          interval_count?: number
          price_amount?: number | null
          product_id?: string
          quantity?: number
          subscription_id?: string
          type?: Database["public"]["Enums"]["subscription_item_type"]
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_items_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          account_id: string
          active: boolean
          billing_customer_id: number
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          cancel_at_period_end: boolean
          created_at: string
          currency: string
          id: string
          period_ends_at: string
          period_starts_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          trial_starts_at: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          active: boolean
          billing_customer_id: number
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          cancel_at_period_end: boolean
          created_at?: string
          currency: string
          id: string
          period_ends_at: string
          period_starts_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          active?: boolean
          billing_customer_id?: number
          billing_provider?: Database["public"]["Enums"]["billing_provider"]
          cancel_at_period_end?: boolean
          created_at?: string
          currency?: string
          id?: string
          period_ends_at?: string
          period_starts_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_account_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_billing_customer_id_fkey"
            columns: ["billing_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          onboarding_completed: boolean | null
          onboarding_step: number | null
          preferences: Json | null
          profile_id: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string | null
          id: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          preferences?: Json | null
          profile_id?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          preferences?: Json | null
          profile_id?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
    }
    Views: {
      user_account_workspace: {
        Row: {
          id: string | null
          name: string | null
          picture_url: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
        }
        Relationships: []
      }
      user_accounts: {
        Row: {
          id: string | null
          name: string | null
          picture_url: string | null
          role: string | null
          slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_memberships_account_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
        ]
      }
    }
    Functions: {
      accept_invitation: {
        Args: { token: string; user_id: string }
        Returns: string
      }
      add_invitations_to_account: {
        Args: {
          account_slug: string
          invitations: Database["public"]["CompositeTypes"]["invitation"][]
          invited_by: string
        }
        Returns: Database["public"]["Tables"]["invitations"]["Row"][]
      }
      can_action_account_member: {
        Args: { target_team_account_id: string; target_user_id: string }
        Returns: boolean
      }
      create_invitation: {
        Args: { account_id: string; email: string; role: string }
        Returns: {
          account_id: string
          created_at: string
          email: string
          expires_at: string
          id: number
          invite_token: string
          invited_by: string
          role: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invitations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_nonce: {
        Args: {
          p_expires_in_seconds?: number
          p_metadata?: Json
          p_purpose?: string
          p_revoke_previous?: boolean
          p_scopes?: string[]
          p_user_id?: string
        }
        Returns: Json
      }
      create_team_account: {
        Args: { account_name: string; account_slug?: string; user_id: string }
        Returns: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          is_personal_account: boolean
          name: string
          picture_url: string | null
          primary_owner_user_id: string
          public_data: Json
          slug: string | null
          updated_at: string | null
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "accounts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_account_invitations: {
        Args: { account_slug: string }
        Returns: {
          account_id: string
          created_at: string
          email: string
          expires_at: string
          id: number
          invited_by: string
          inviter_email: string
          inviter_name: string
          role: string
          updated_at: string
        }[]
      }
      get_account_members: {
        Args: { account_slug: string }
        Returns: {
          account_id: string
          created_at: string
          email: string
          id: string
          name: string
          picture_url: string
          primary_owner_user_id: string
          role: string
          role_hierarchy_level: number
          updated_at: string
          user_id: string
        }[]
      }
      get_config: { Args: never; Returns: Json }
      get_latest_availability: {
        Args: { p_rpa_id: string }
        Returns: {
          reported_at: string
          source: Database["public"]["Enums"]["availability_source"]
          unit_types: Json
          units_available: number
        }[]
      }
      get_nonce_status: { Args: { p_id: string }; Returns: Json }
      get_upper_system_role: { Args: never; Returns: string }
      get_user_profile: {
        Args: { user_id?: string }
        Returns: {
          email: string
          id: string
          onboarding_completed: boolean
          preferences: Json
          profile_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }[]
      }
      has_active_subscription: {
        Args: { target_account_id: string }
        Returns: boolean
      }
      has_more_elevated_role: {
        Args: {
          role_name: string
          target_account_id: string
          target_user_id: string
        }
        Returns: boolean
      }
      has_permission: {
        Args: {
          account_id: string
          permission_name: Database["public"]["Enums"]["app_permissions"]
          user_id: string
        }
        Returns: boolean
      }
      has_role_on_account: {
        Args: { account_id: string; account_role?: string }
        Returns: boolean
      }
      has_same_role_hierarchy_level: {
        Args: {
          role_name: string
          target_account_id: string
          target_user_id: string
        }
        Returns: boolean
      }
      is_aal2: { Args: never; Returns: boolean }
      is_account_owner: { Args: { account_id: string }; Returns: boolean }
      is_account_team_member: {
        Args: { target_account_id: string }
        Returns: boolean
      }
      is_mfa_compliant: { Args: never; Returns: boolean }
      is_set: { Args: { field_name: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      is_team_member: {
        Args: { account_id: string; user_id: string }
        Returns: boolean
      }
      revoke_nonce: {
        Args: { p_id: string; p_reason?: string }
        Returns: boolean
      }
      search_rpas: {
        Args: {
          p_category?: number
          p_city?: string
          p_has_availability?: boolean
          p_limit?: number
          p_max_price?: number
          p_min_price?: number
          p_offset?: number
          p_region?: string
          p_search_text?: string
        }
        Returns: {
          category: number
          city: string
          distance_km: number
          id: string
          last_availability_update: string
          latest_units_available: number
          name: string
          pricing_max: number
          pricing_min: number
          rating: number
          region: string
        }[]
      }
      team_account_workspace: {
        Args: { account_slug: string }
        Returns: {
          id: string
          name: string
          permissions: Database["public"]["Enums"]["app_permissions"][]
          picture_url: string
          primary_owner_user_id: string
          role: string
          role_hierarchy_level: number
          slug: string
          subscription_status: Database["public"]["Enums"]["subscription_status"]
        }[]
      }
      transfer_team_account_ownership: {
        Args: { new_owner_id: string; target_account_id: string }
        Returns: undefined
      }
      upsert_order: {
        Args: {
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          currency: string
          line_items: Json
          status: Database["public"]["Enums"]["payment_status"]
          target_account_id: string
          target_customer_id: string
          target_order_id: string
          total_amount: number
        }
        Returns: {
          account_id: string
          billing_customer_id: number
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          created_at: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_subscription: {
        Args: {
          active: boolean
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          cancel_at_period_end: boolean
          currency: string
          line_items: Json
          period_ends_at: string
          period_starts_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          target_account_id: string
          target_customer_id: string
          target_subscription_id: string
          trial_ends_at?: string
          trial_starts_at?: string
        }
        Returns: {
          account_id: string
          active: boolean
          billing_customer_id: number
          billing_provider: Database["public"]["Enums"]["billing_provider"]
          cancel_at_period_end: boolean
          created_at: string
          currency: string
          id: string
          period_ends_at: string
          period_starts_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          trial_starts_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      verify_nonce: {
        Args: {
          p_ip?: unknown
          p_max_verification_attempts?: number
          p_purpose: string
          p_required_scopes?: string[]
          p_token: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_permissions:
        | "roles.manage"
        | "billing.manage"
        | "settings.manage"
        | "members.manage"
        | "invites.manage"
      autonomy_level: "autonomous" | "semi_autonomous" | "loss_of_independence"
      availability_source: "sms" | "web" | "api"
      billing_provider: "stripe" | "lemon-squeezy" | "paddle"
      contact_type: "call" | "message" | "visit_request" | "urgent_broadcast"
      notification_channel: "in_app" | "email"
      notification_type: "info" | "warning" | "error"
      payment_status: "pending" | "succeeded" | "failed"
      sms_direction: "inbound" | "outbound"
      subscription_item_type: "flat" | "per_seat" | "metered"
      subscription_status:
        | "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
        | "paused"
      urgency_level: "normal" | "urgent_48h" | "urgent_24h"
      user_type: "public" | "rpa_manager" | "healthcare_worker" | "admin"
    }
    CompositeTypes: {
      invitation: {
        email: string | null
        role: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_permissions: [
        "roles.manage",
        "billing.manage",
        "settings.manage",
        "members.manage",
        "invites.manage",
      ],
      autonomy_level: ["autonomous", "semi_autonomous", "loss_of_independence"],
      availability_source: ["sms", "web", "api"],
      billing_provider: ["stripe", "lemon-squeezy", "paddle"],
      contact_type: ["call", "message", "visit_request", "urgent_broadcast"],
      notification_channel: ["in_app", "email"],
      notification_type: ["info", "warning", "error"],
      payment_status: ["pending", "succeeded", "failed"],
      sms_direction: ["inbound", "outbound"],
      subscription_item_type: ["flat", "per_seat", "metered"],
      subscription_status: [
        "active",
        "trialing",
        "past_due",
        "canceled",
        "unpaid",
        "incomplete",
        "incomplete_expired",
        "paused",
      ],
      urgency_level: ["normal", "urgent_48h", "urgent_24h"],
      user_type: ["public", "rpa_manager", "healthcare_worker", "admin"],
    },
  },
} as const
