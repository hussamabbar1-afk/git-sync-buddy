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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ai_agents: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          fallback_message: string | null
          human_handoff_enabled: boolean
          id: string
          is_active: boolean
          language: string
          name: string
          response_style: string
          updated_at: string | null
          welcome_message: string | null
          widget_key: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          fallback_message?: string | null
          human_handoff_enabled?: boolean
          id?: string
          is_active?: boolean
          language?: string
          name: string
          response_style?: string
          updated_at?: string | null
          welcome_message?: string | null
          widget_key?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          fallback_message?: string | null
          human_handoff_enabled?: boolean
          id?: string
          is_active?: boolean
          language?: string
          name?: string
          response_style?: string
          updated_at?: string | null
          welcome_message?: string | null
          widget_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          address: string | null
          appointment_date: string | null
          company_id: string
          conversation_id: string | null
          created_at: string
          customer_name: string | null
          email: string | null
          end_time: string | null
          id: string
          lead_id: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          service_type: string | null
          start_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          appointment_date?: string | null
          company_id: string
          conversation_id?: string | null
          created_at?: string
          customer_name?: string | null
          email?: string | null
          end_time?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          service_type?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          appointment_date?: string | null
          company_id?: string
          conversation_id?: string | null
          created_at?: string
          customer_name?: string | null
          email?: string | null
          end_time?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          service_type?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          appointment_duration_minutes: number
          created_at: string
          description: string | null
          email: string | null
          id: string
          industry: string | null
          minimum_booking_notice_minutes: number
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          appointment_duration_minutes?: number
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          minimum_booking_notice_minutes?: number
          name?: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          appointment_duration_minutes?: number
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          minimum_booking_notice_minutes?: number
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          company_id: string
          created_at: string
          handoff_reason: string | null
          handoff_requested_at: string | null
          id: string
          status: string
          updated_at: string
          visitor_email: string | null
          visitor_name: string | null
          visitor_phone: string | null
          widget_key: string
        }
        Insert: {
          company_id: string
          created_at?: string
          handoff_reason?: string | null
          handoff_requested_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
          widget_key: string
        }
        Update: {
          company_id?: string
          created_at?: string
          handoff_reason?: string | null
          handoff_requested_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
          widget_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          appointment_reason: string | null
          booking_confirmation_received: boolean | null
          cancellation_selection_pending: boolean
          company_id: string
          conversation_id: string | null
          created_at: string
          draft_appointment_date: string | null
          draft_start_time: string | null
          email: string | null
          id: string
          issue_description: string | null
          issue_type: string | null
          name: string | null
          pending_appointment_date: string | null
          pending_service_type: string | null
          pending_start_time: string | null
          phone: string | null
          postal_code: string | null
          preferred_appointment: string | null
          preferred_contact_method: string | null
          reschedule_confirmation_received: boolean
          reschedule_new_date: string | null
          reschedule_new_start_time: string | null
          reschedule_selection_pending: boolean
          reschedule_target_appointment_id: string | null
          status: string
          updated_at: string
          urgency: string | null
        }
        Insert: {
          address?: string | null
          appointment_reason?: string | null
          booking_confirmation_received?: boolean | null
          cancellation_selection_pending?: boolean
          company_id: string
          conversation_id?: string | null
          created_at?: string
          draft_appointment_date?: string | null
          draft_start_time?: string | null
          email?: string | null
          id?: string
          issue_description?: string | null
          issue_type?: string | null
          name?: string | null
          pending_appointment_date?: string | null
          pending_service_type?: string | null
          pending_start_time?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_appointment?: string | null
          preferred_contact_method?: string | null
          reschedule_confirmation_received?: boolean
          reschedule_new_date?: string | null
          reschedule_new_start_time?: string | null
          reschedule_selection_pending?: boolean
          reschedule_target_appointment_id?: string | null
          status?: string
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          address?: string | null
          appointment_reason?: string | null
          booking_confirmation_received?: boolean | null
          cancellation_selection_pending?: boolean
          company_id?: string
          conversation_id?: string | null
          created_at?: string
          draft_appointment_date?: string | null
          draft_start_time?: string | null
          email?: string | null
          id?: string
          issue_description?: string | null
          issue_type?: string | null
          name?: string | null
          pending_appointment_date?: string | null
          pending_service_type?: string | null
          pending_start_time?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_appointment?: string | null
          preferred_contact_method?: string | null
          reschedule_confirmation_received?: boolean
          reschedule_new_date?: string | null
          reschedule_new_start_time?: string | null
          reschedule_selection_pending?: boolean
          reschedule_target_appointment_id?: string | null
          status?: string
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: true
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_hours: {
        Row: {
          close_time: string | null
          company_id: string
          created_at: string
          day_of_week: number
          id: string
          is_open: boolean
          open_time: string | null
          updated_at: string
        }
        Insert: {
          close_time?: string | null
          company_id: string
          created_at?: string
          day_of_week: number
          id?: string
          is_open?: boolean
          open_time?: string | null
          updated_at?: string
        }
        Update: {
          close_time?: string | null
          company_id?: string
          created_at?: string
          day_of_week?: number
          id?: string
          is_open?: boolean
          open_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opening_hours_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string | null
          full_name: string | null
          id: string
          preferences: Json
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          preferences?: Json
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          preferences?: Json
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      service_areas: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          postal_codes: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          postal_codes?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          postal_codes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_areas_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_errors: {
        Row: {
          company_id: string | null
          conversation_id: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          error_payload: Json | null
          id: string
          lead_id: string | null
          source: string
        }
        Insert: {
          company_id?: string | null
          conversation_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          error_payload?: Json | null
          id?: string
          lead_id?: string | null
          source: string
        }
        Update: {
          company_id?: string | null
          conversation_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          error_payload?: Json | null
          id?: string
          lead_id?: string | null
          source?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_company_onboarding: {
        Args: {
          company_address: string
          company_description: string
          company_email: string
          company_industry: string
          company_name: string
          company_phone: string
          opening_hours_data: Json
          service_areas_data: Json
          services_data: Json
        }
        Returns: string
      }
      create_ai_agent_for_current_company: {
        Args: {
          agent_description?: string
          agent_fallback_message?: string
          agent_human_handoff_enabled?: boolean
          agent_language?: string
          agent_name: string
          agent_response_style?: string
          agent_welcome_message?: string
        }
        Returns: string
      }
      create_company_and_profile: {
        Args: {
          company_address: string
          company_email: string
          company_industry: string
          company_name: string
          company_phone: string
        }
        Returns: string
      }
      get_chatbot_context: { Args: { p_widget_key: string }; Returns: Json }
      get_or_create_conversation: {
        Args: { p_conversation_id?: string; p_widget_key: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
