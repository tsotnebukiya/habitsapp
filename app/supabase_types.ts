export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      habit_completions: {
        Row: {
          completion_date: string
          created_at: string
          habit_id: string
          id: string
          status: Database["public"]["Enums"]["habit_completion_status"]
          user_id: string
          value: number | null
        }
        Insert: {
          completion_date: string
          created_at?: string
          habit_id: string
          id?: string
          status?: Database["public"]["Enums"]["habit_completion_status"]
          user_id: string
          value?: number | null
        }
        Update: {
          completion_date?: string
          created_at?: string
          habit_id?: string
          id?: string
          status?: Database["public"]["Enums"]["habit_completion_status"]
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          category_name: string | null
          color: string
          completions_per_day: number
          created_at: string
          days_of_week: number[] | null
          description: string | null
          end_date: string | null
          frequency_type: string
          gamification_attributes: string | null
          goal_unit: string | null
          goal_value: number | null
          icon: string
          id: string
          is_active: boolean
          name: string
          reminder_time: string | null
          start_date: string
          streak_goal: number | null
          type: Database["public"]["Enums"]["habit_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          category_name?: string | null
          color: string
          completions_per_day?: number
          created_at?: string
          days_of_week?: number[] | null
          description?: string | null
          end_date?: string | null
          frequency_type: string
          gamification_attributes?: string | null
          goal_unit?: string | null
          goal_value?: number | null
          icon: string
          id?: string
          is_active?: boolean
          name: string
          reminder_time?: string | null
          start_date: string
          streak_goal?: number | null
          type?: Database["public"]["Enums"]["habit_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          category_name?: string | null
          color?: string
          completions_per_day?: number
          created_at?: string
          days_of_week?: number[] | null
          description?: string | null
          end_date?: string | null
          frequency_type?: string
          gamification_attributes?: string | null
          goal_unit?: string | null
          goal_value?: number | null
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          reminder_time?: string | null
          start_date?: string
          streak_goal?: number | null
          type?: Database["public"]["Enums"]["habit_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          badge: number | null
          body: string
          created_at: string
          data: Json | null
          habit_id: string | null
          id: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          processed: boolean
          scheduled_for: string
          sound: string | null
          subtitle: string | null
          title: string
          user_id: string
        }
        Insert: {
          badge?: number | null
          body: string
          created_at?: string
          data?: Json | null
          habit_id?: string | null
          id?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          processed?: boolean
          scheduled_for: string
          sound?: string | null
          subtitle?: string | null
          title: string
          user_id: string
        }
        Update: {
          badge?: number | null
          body?: string
          created_at?: string
          data?: Json | null
          habit_id?: string | null
          id?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          processed?: boolean
          scheduled_for?: string
          sound?: string | null
          subtitle?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          cat1: number | null
          cat2: number | null
          cat3: number | null
          cat4: number | null
          cat5: number | null
          created_at: string
          current_streak: number
          id: string
          max_streak: number
          streak_achievements: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          cat1?: number | null
          cat2?: number | null
          cat3?: number | null
          cat4?: number | null
          cat5?: number | null
          created_at?: string
          current_streak?: number
          id?: string
          max_streak?: number
          streak_achievements?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          cat1?: number | null
          cat2?: number | null
          cat3?: number | null
          cat4?: number | null
          cat5?: number | null
          created_at?: string
          current_streak?: number
          id?: string
          max_streak?: number
          streak_achievements?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          allow_daily_update_notifications: boolean | null
          allow_streak_notifications: boolean | null
          cat1: number | null
          cat2: number | null
          cat3: number | null
          cat4: number | null
          cat5: number | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          email: string
          id: string
          onboarding_complete: boolean | null
          push_token: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          allow_daily_update_notifications?: boolean | null
          allow_streak_notifications?: boolean | null
          cat1?: number | null
          cat2?: number | null
          cat3?: number | null
          cat4?: number | null
          cat5?: number | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email: string
          id: string
          onboarding_complete?: boolean | null
          push_token?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          allow_daily_update_notifications?: boolean | null
          allow_streak_notifications?: boolean | null
          cat1?: number | null
          cat2?: number | null
          cat3?: number | null
          cat4?: number | null
          cat5?: number | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email?: string
          id?: string
          onboarding_complete?: boolean | null
          push_token?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      habit_completion_status:
        | "not_started"
        | "skipped"
        | "completed"
        | "in_progress"
      habit_type: "GOOD" | "BAD"
      notification_type: "HABIT" | "MORNING" | "EVENING" | "STREAK" | "GENERAL"
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
  public: {
    Enums: {
      habit_completion_status: [
        "not_started",
        "skipped",
        "completed",
        "in_progress",
      ],
      habit_type: ["GOOD", "BAD"],
      notification_type: ["HABIT", "MORNING", "EVENING", "STREAK", "GENERAL"],
    },
  },
} as const
