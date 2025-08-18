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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agent_activity_logs: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          agent_id: string
          created_at: string
          details: Json | null
          id: string
          project_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          agent_id: string
          created_at?: string
          details?: Json | null
          id?: string
          project_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          agent_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_activity_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_activity_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          permissions: Json | null
          role: Database["public"]["Enums"]["agent_role"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          permissions?: Json | null
          role: Database["public"]["Enums"]["agent_role"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["agent_role"]
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          cost: number
          created_at: string
          id: string
          message_type: Database["public"]["Enums"]["message_type"]
          metadata: Json | null
          sender_agent_id: string | null
          sender_type: Database["public"]["Enums"]["sender_type"]
          session_id: string
          tokens_used: number
        }
        Insert: {
          content: string
          cost?: number
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json | null
          sender_agent_id?: string | null
          sender_type: Database["public"]["Enums"]["sender_type"]
          session_id: string
          tokens_used?: number
        }
        Update: {
          content?: string
          cost?: number
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json | null
          sender_agent_id?: string | null
          sender_type?: Database["public"]["Enums"]["sender_type"]
          session_id?: string
          tokens_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_sender_agent_id_fkey"
            columns: ["sender_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          ended_at: string | null
          id: string
          is_active: boolean
          project_id: string
          started_at: string
          title: string | null
          total_cost: number
          total_messages: number
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          is_active?: boolean
          project_id: string
          started_at?: string
          title?: string | null
          total_cost?: number
          total_messages?: number
          user_id: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          is_active?: boolean
          project_id?: string
          started_at?: string
          title?: string | null
          total_cost?: number
          total_messages?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cli_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          session_type?: Database["public"]["Enums"]["session_type"]
          token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          session_type?: Database["public"]["Enums"]["session_type"]
          token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cli_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string
          id: string
          is_active: boolean
          last_triggered_at: string | null
          project_id: string | null
          threshold_amount: number
          user_id: string
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          project_id?: string | null
          threshold_amount: number
          user_id: string
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          project_id?: string | null
          threshold_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_alerts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      file_operations: {
        Row: {
          agent_id: string
          cost: number
          created_at: string
          executed_at: string | null
          file_content_after: string | null
          file_content_before: string | null
          file_path: string
          id: string
          operation_type: Database["public"]["Enums"]["operation_type"]
          project_id: string
          tokens_used: number
          user_approved: boolean
        }
        Insert: {
          agent_id: string
          cost?: number
          created_at?: string
          executed_at?: string | null
          file_content_after?: string | null
          file_content_before?: string | null
          file_path: string
          id?: string
          operation_type: Database["public"]["Enums"]["operation_type"]
          project_id: string
          tokens_used?: number
          user_approved?: boolean
        }
        Update: {
          agent_id?: string
          cost?: number
          created_at?: string
          executed_at?: string | null
          file_content_after?: string | null
          file_content_before?: string | null
          file_path?: string
          id?: string
          operation_type?: Database["public"]["Enums"]["operation_type"]
          project_id?: string
          tokens_used?: number
          user_approved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "file_operations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_operations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_providers: {
        Row: {
          api_key: string
          cost_per_1k_tokens: number | null
          created_at: string
          id: string
          is_active: boolean
          provider_name: Database["public"]["Enums"]["llm_provider_name"]
          rate_limit_per_minute: number | null
          user_id: string
        }
        Insert: {
          api_key: string
          cost_per_1k_tokens?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          provider_name: Database["public"]["Enums"]["llm_provider_name"]
          rate_limit_per_minute?: number | null
          user_id: string
        }
        Update: {
          api_key?: string
          cost_per_1k_tokens?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          provider_name?: Database["public"]["Enums"]["llm_provider_name"]
          rate_limit_per_minute?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "llm_providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          project_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          project_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_agents: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_assigned: boolean
          last_active_at: string | null
          project_id: string
          tasks_completed: number
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_assigned?: boolean
          last_active_at?: string | null
          project_id: string
          tasks_completed?: number
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_assigned?: boolean
          last_active_at?: string | null
          project_id?: string
          tasks_completed?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_agents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_analytics: {
        Row: {
          agent_operations: number
          api_calls_count: number
          created_at: string
          daily_cost: number
          date: string
          files_modified: number
          id: string
          project_id: string
          tokens_used: number
        }
        Insert: {
          agent_operations?: number
          api_calls_count?: number
          created_at?: string
          daily_cost?: number
          date: string
          files_modified?: number
          id?: string
          project_id: string
          tokens_used?: number
        }
        Update: {
          agent_operations?: number
          api_calls_count?: number
          created_at?: string
          daily_cost?: number
          date?: string
          files_modified?: number
          id?: string
          project_id?: string
          tokens_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_dependencies: {
        Row: {
          created_at: string
          depends_on_project_id: string
          id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          depends_on_project_id: string
          id?: string
          project_id: string
        }
        Update: {
          created_at?: string
          depends_on_project_id?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_dependencies_depends_on_project_id_fkey"
            columns: ["depends_on_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_dependencies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_users: {
        Row: {
          id: string
          joined_at: string
          project_id: string
          role: Database["public"]["Enums"]["user_project_role"]
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          project_id: string
          role?: Database["public"]["Enums"]["user_project_role"]
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          project_id?: string
          role?: Database["public"]["Enums"]["user_project_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_users_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          last_accessed_at: string | null
          local_path: string | null
          name: string
          owner_id: string
          repository_url: string | null
          selected_llm_provider_id: string | null
          status: Database["public"]["Enums"]["project_status"]
          total_api_calls: number
          total_cost: number
          total_tokens_used: number
          type: Database["public"]["Enums"]["project_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          last_accessed_at?: string | null
          local_path?: string | null
          name: string
          owner_id: string
          repository_url?: string | null
          selected_llm_provider_id?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          total_api_calls?: number
          total_cost?: number
          total_tokens_used?: number
          type: Database["public"]["Enums"]["project_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          last_accessed_at?: string | null
          local_path?: string | null
          name?: string
          owner_id?: string
          repository_url?: string | null
          selected_llm_provider_id?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          total_api_calls?: number
          total_cost?: number
          total_tokens_used?: number
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_selected_llm_provider_id_fkey"
            columns: ["selected_llm_provider_id"]
            isOneToOne: false
            referencedRelation: "llm_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      repository_sync: {
        Row: {
          branch_name: string
          created_at: string
          error_message: string | null
          id: string
          last_commit_hash: string | null
          last_sync_at: string | null
          project_id: string
          sync_status: Database["public"]["Enums"]["sync_status"]
        }
        Insert: {
          branch_name?: string
          created_at?: string
          error_message?: string | null
          id?: string
          last_commit_hash?: string | null
          last_sync_at?: string | null
          project_id: string
          sync_status?: Database["public"]["Enums"]["sync_status"]
        }
        Update: {
          branch_name?: string
          created_at?: string
          error_message?: string | null
          id?: string
          last_commit_hash?: string | null
          last_sync_at?: string | null
          project_id?: string
          sync_status?: Database["public"]["Enums"]["sync_status"]
        }
        Relationships: [
          {
            foreignKeyName: "repository_sync_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      users_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          total_projects: number
          total_sessions: number
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          total_projects?: number
          total_sessions?: number
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          total_projects?: number
          total_sessions?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      version_control_events: {
        Row: {
          author_agent_id: string | null
          author_user_id: string | null
          branch_name: string
          commit_hash: string | null
          created_at: string
          details: Json | null
          event_type: Database["public"]["Enums"]["version_event_type"]
          id: string
          project_id: string
        }
        Insert: {
          author_agent_id?: string | null
          author_user_id?: string | null
          branch_name: string
          commit_hash?: string | null
          created_at?: string
          details?: Json | null
          event_type: Database["public"]["Enums"]["version_event_type"]
          id?: string
          project_id: string
        }
        Update: {
          author_agent_id?: string | null
          author_user_id?: string | null
          branch_name?: string
          commit_hash?: string | null
          created_at?: string
          details?: Json | null
          event_type?: Database["public"]["Enums"]["version_event_type"]
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "version_control_events_author_agent_id_fkey"
            columns: ["author_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "version_control_events_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "version_control_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type:
        | "login"
        | "logout"
        | "assigned_task"
        | "merged_code"
        | "comment"
        | "system_event"
      agent_role:
        | "manager"
        | "assistant"
        | "product_manager"
        | "business_analyst"
        | "ui_designer"
        | "ux_designer"
        | "frontend_dev"
        | "backend_dev"
        | "fullstack_dev"
        | "mobile_dev_ios"
        | "mobile_dev_android"
        | "game_dev"
        | "embedded_iot"
        | "qa_engineer"
        | "devops_engineer"
        | "security_engineer"
        | "ai_ml_engineer"
        | "data_engineer"
        | "cloud_engineer"
        | "technical_writer"
        | "tech_lead"
      alert_type: "daily_threshold" | "project_threshold" | "monthly_threshold"
      llm_provider_name: "openai" | "anthropic" | "google" | "cohere"
      message_type: "text" | "file_operation" | "code_change" | "system"
      notification_type:
        | "agent_action"
        | "project_update"
        | "session_complete"
        | "cost_alert"
      operation_type: "read" | "write" | "create" | "delete" | "analyze"
      project_status: "active" | "paused" | "completed" | "archived"
      project_type: "web" | "mobile" | "game" | "embedded" | "ai_ml" | "data"
      sender_type: "user" | "manager" | "assistant" | "agent"
      session_type: "temporary" | "long_lived"
      subscription_tier: "free" | "pro" | "enterprise"
      sync_status: "synced" | "pending" | "error"
      user_project_role: "owner" | "admin" | "editor" | "viewer"
      version_event_type:
        | "commit"
        | "merge"
        | "pull_request"
        | "conflict"
        | "revert"
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
    Enums: {
      activity_type: [
        "login",
        "logout",
        "assigned_task",
        "merged_code",
        "comment",
        "system_event",
      ],
      agent_role: [
        "manager",
        "assistant",
        "product_manager",
        "business_analyst",
        "ui_designer",
        "ux_designer",
        "frontend_dev",
        "backend_dev",
        "fullstack_dev",
        "mobile_dev_ios",
        "mobile_dev_android",
        "game_dev",
        "embedded_iot",
        "qa_engineer",
        "devops_engineer",
        "security_engineer",
        "ai_ml_engineer",
        "data_engineer",
        "cloud_engineer",
        "technical_writer",
        "tech_lead",
      ],
      alert_type: ["daily_threshold", "project_threshold", "monthly_threshold"],
      llm_provider_name: ["openai", "anthropic", "google", "cohere"],
      message_type: ["text", "file_operation", "code_change", "system"],
      notification_type: [
        "agent_action",
        "project_update",
        "session_complete",
        "cost_alert",
      ],
      operation_type: ["read", "write", "create", "delete", "analyze"],
      project_status: ["active", "paused", "completed", "archived"],
      project_type: ["web", "mobile", "game", "embedded", "ai_ml", "data"],
      sender_type: ["user", "manager", "assistant", "agent"],
      session_type: ["temporary", "long_lived"],
      subscription_tier: ["free", "pro", "enterprise"],
      sync_status: ["synced", "pending", "error"],
      user_project_role: ["owner", "admin", "editor", "viewer"],
      version_event_type: [
        "commit",
        "merge",
        "pull_request",
        "conflict",
        "revert",
      ],
    },
  },
} as const
