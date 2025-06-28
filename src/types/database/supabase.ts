export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      organization_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_domains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_sla_settings: {
        Row: {
          business_hours_only: boolean | null
          created_at: string | null
          first_response_hours: number | null
          id: string
          is_active: boolean | null
          organization_id: string
          priority: Database["public"]["Enums"]["ticket_priority_enum"]
          resolution_hours: number | null
          updated_at: string | null
        }
        Insert: {
          business_hours_only?: boolean | null
          created_at?: string | null
          first_response_hours?: number | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          priority: Database["public"]["Enums"]["ticket_priority_enum"]
          resolution_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          business_hours_only?: boolean | null
          created_at?: string | null
          first_response_hours?: number | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          priority?: Database["public"]["Enums"]["ticket_priority_enum"]
          resolution_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_sla_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          profile: Json | null
          subdomain: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          profile?: Json | null
          subdomain: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          profile?: Json | null
          subdomain?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type_enum"]
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          ticket_id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type_enum"]
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          ticket_id: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type_enum"]
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          ticket_id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_activities_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          response_id: string | null
          thumbnail_url: string | null
          ticket_id: string | null
          uploaded_by_email: string | null
          uploaded_by_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          response_id?: string | null
          thumbnail_url?: string | null
          ticket_id?: string | null
          uploaded_by_email?: string | null
          uploaded_by_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          response_id?: string | null
          thumbnail_url?: string | null
          ticket_id?: string | null
          uploaded_by_email?: string | null
          uploaded_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "ticket_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_uploaded_by_user_id_fkey"
            columns: ["uploaded_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_responses: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          is_internal: boolean | null
          response_text: string
          response_type: string | null
          ticket_id: string
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          response_text: string
          response_type?: string | null
          ticket_id: string
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          response_text?: string
          response_type?: string | null
          ticket_id?: string
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_slas: {
        Row: {
          actual_time: string | null
          breach_duration: unknown | null
          created_at: string | null
          id: string
          is_breached: boolean | null
          notification_sent: boolean | null
          sla_type: string
          target_time: string
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          actual_time?: string | null
          breach_duration?: unknown | null
          created_at?: string | null
          id?: string
          is_breached?: boolean | null
          notification_sent?: boolean | null
          sla_type: string
          target_time: string
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          actual_time?: string | null
          breach_duration?: unknown | null
          created_at?: string | null
          id?: string
          is_breached?: boolean | null
          notification_sent?: boolean | null
          sla_type?: string
          target_time?: string
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_slas_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_tags: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          tag_color: string | null
          tag_name: string
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          tag_color?: string | null
          tag_name: string
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          tag_color?: string | null
          tag_name?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_tags_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category_id: string | null
          closed_at: string | null
          created_at: string | null
          customer_satisfaction: number | null
          description: string | null
          due_date: string | null
          first_response_at: string | null
          id: string
          organization_id: string
          priority: Database["public"]["Enums"]["ticket_priority_enum"] | null
          reference_id: string
          resolution_notes: string | null
          resolved_at: string | null
          source: Database["public"]["Enums"]["ticket_source_enum"] | null
          status: Database["public"]["Enums"]["ticket_status_enum"] | null
          subject: string
          tags: string[] | null
          updated_at: string | null
          user_email: string
        }
        Insert: {
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          customer_satisfaction?: number | null
          description?: string | null
          due_date?: string | null
          first_response_at?: string | null
          id?: string
          organization_id: string
          priority?: Database["public"]["Enums"]["ticket_priority_enum"] | null
          reference_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          source?: Database["public"]["Enums"]["ticket_source_enum"] | null
          status?: Database["public"]["Enums"]["ticket_status_enum"] | null
          subject: string
          tags?: string[] | null
          updated_at?: string | null
          user_email: string
        }
        Update: {
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          customer_satisfaction?: number | null
          description?: string | null
          due_date?: string | null
          first_response_at?: string | null
          id?: string
          organization_id?: string
          priority?: Database["public"]["Enums"]["ticket_priority_enum"] | null
          reference_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          source?: Database["public"]["Enums"]["ticket_source_enum"] | null
          status?: Database["public"]["Enums"]["ticket_status_enum"] | null
          subject?: string
          tags?: string[] | null
          updated_at?: string | null
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_ticket_reference_id: {
        Args: { org_id: string }
        Returns: string
      }
    }
    Enums: {
      activity_type_enum:
        | "created"
        | "assigned"
        | "unassigned"
        | "status_changed"
        | "priority_changed"
        | "commented"
        | "resolved"
        | "closed"
        | "reopened"
        | "tagged"
        | "categorized"
        | "note_added"
        | "attachment_added"
      ticket_priority_enum: "low" | "normal" | "high" | "urgent" | "critical"
      ticket_source_enum:
        | "portal"
        | "email"
        | "chat"
        | "phone"
        | "api"
        | "widget"
      ticket_status_enum:
        | "new"
        | "open"
        | "pending"
        | "in_progress"
        | "resolved"
        | "closed"
        | "on_hold"
      user_role_enum: "owner" | "admin" | "agent" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_type_enum: [
        "created",
        "assigned",
        "unassigned",
        "status_changed",
        "priority_changed",
        "commented",
        "resolved",
        "closed",
        "reopened",
        "tagged",
        "categorized",
        "note_added",
        "attachment_added",
      ],
      ticket_priority_enum: ["low", "normal", "high", "urgent", "critical"],
      ticket_source_enum: ["portal", "email", "chat", "phone", "api", "widget"],
      ticket_status_enum: [
        "new",
        "open",
        "pending",
        "in_progress",
        "resolved",
        "closed",
        "on_hold",
      ],
      user_role_enum: ["owner", "admin", "agent", "member"],
    },
  },
} as const
