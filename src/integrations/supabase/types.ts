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
      admin_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          title: string
          type: Database["public"]["Enums"]["announcement_type"]
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          title: string
          type?: Database["public"]["Enums"]["announcement_type"]
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          title?: string
          type?: Database["public"]["Enums"]["announcement_type"]
        }
        Relationships: []
      }
      attendance: {
        Row: {
          class_id: string
          created_at: string
          date: string
          id: string
          marked_by: string
          notes: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          date: string
          id?: string
          marked_by: string
          notes?: string | null
          status: string
          student_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          date?: string
          id?: string
          marked_by?: string
          notes?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          name: string
          section: string | null
          year: number
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          name: string
          section?: string | null
          year: number
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          name?: string
          section?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "batches_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      breathing_sessions: {
        Row: {
          completed_at: string
          created_at: string
          duration_seconds: number
          id: string
          pattern: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          duration_seconds: number
          id?: string
          pattern?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          pattern?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_participants: {
        Row: {
          chat_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string | null
          type: Database["public"]["Enums"]["chat_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          type?: Database["public"]["Enums"]["chat_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          type?: Database["public"]["Enums"]["chat_type"]
          updated_at?: string
        }
        Relationships: []
      }
      class_schedules: {
        Row: {
          class_id: string
          day_of_week: string
          end_time: string
          id: string
          start_time: string
        }
        Insert: {
          class_id: string
          day_of_week: string
          end_time: string
          id?: string
          start_time: string
        }
        Update: {
          class_id?: string
          day_of_week?: string
          end_time?: string
          id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          course_id: string
          created_at: string
          faculty_id: string
          id: string
          name: string
          room: string | null
          year: string
        }
        Insert: {
          course_id: string
          created_at?: string
          faculty_id: string
          id?: string
          name: string
          room?: string | null
          year: string
        }
        Update: {
          course_id?: string
          created_at?: string
          faculty_id?: string
          id?: string
          name?: string
          room?: string | null
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          department_id: string | null
          duration_years: number | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          department_id?: string | null
          duration_years?: number | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string | null
          duration_years?: number | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      faculty_classes: {
        Row: {
          class_id: string
          faculty_id: string
          id: string
        }
        Insert: {
          class_id: string
          faculty_id: string
          id?: string
        }
        Update: {
          class_id?: string
          faculty_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          designation: string | null
          email: string
          id: string
          name: string
          office_hours: string | null
          status: Database["public"]["Enums"]["user_status"]
          subjects: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email: string
          id?: string
          name: string
          office_hours?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          subjects?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email?: string
          id?: string
          name?: string
          office_hours?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          subjects?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          break_duration_seconds: number | null
          completed_at: string
          created_at: string
          focus_duration_seconds: number
          id: string
          session_count: number
          task_label: string | null
          user_id: string
        }
        Insert: {
          break_duration_seconds?: number | null
          completed_at?: string
          created_at?: string
          focus_duration_seconds: number
          id?: string
          session_count?: number
          task_label?: string | null
          user_id: string
        }
        Update: {
          break_duration_seconds?: number | null
          completed_at?: string
          created_at?: string
          focus_duration_seconds?: number
          id?: string
          session_count?: number
          task_label?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meditation_sessions: {
        Row: {
          completed_at: string
          created_at: string
          duration_seconds: number
          id: string
          notes: string | null
          session_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          duration_seconds: number
          id?: string
          notes?: string | null
          session_type?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          notes?: string | null
          session_type?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          sender_id: string | null
          updated_at: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          sender_id?: string | null
          updated_at?: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          sender_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      notice_reads: {
        Row: {
          id: string
          notice_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notice_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notice_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notice_reads_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          batch_id: string | null
          content: string
          created_at: string
          created_by: string
          department_id: string | null
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          batch_id?: string | null
          content: string
          created_at?: string
          created_by: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          batch_id?: string | null
          content?: string
          created_at?: string
          created_by?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          certificate_id: string | null
          content: string
          created_at: string
          id: string
          project_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          certificate_id?: string | null
          content: string
          created_at?: string
          id?: string
          project_id?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          certificate_id?: string | null
          content?: string
          created_at?: string
          id?: string
          project_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "user_certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          message_id: string | null
          reason: string
          reported_user_id: string | null
          reporter_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          reason: string
          reported_user_id?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          class_id: string
          enrolled_at: string
          id: string
          student_id: string
        }
        Insert: {
          class_id: string
          enrolled_at?: string
          id?: string
          student_id: string
        }
        Update: {
          class_id?: string
          enrolled_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          college: string | null
          course: string | null
          created_at: string
          email: string
          github_url: string | null
          id: string
          linkedin_url: string | null
          name: string
          portfolio_url: string | null
          semester: string | null
          skills: string[] | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          user_id: string
          username: string
          year: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          college?: string | null
          course?: string | null
          created_at?: string
          email: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          name: string
          portfolio_url?: string | null
          semester?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id: string
          username: string
          year?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          college?: string | null
          course?: string | null
          created_at?: string
          email?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string
          portfolio_url?: string | null
          semester?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string
          username?: string
          year?: string | null
        }
        Relationships: []
      }
      user_certificates: {
        Row: {
          created_at: string
          credential_url: string | null
          id: string
          issue_date: string | null
          issuer: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credential_url?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          credential_url?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          course_id: string | null
          created_at: string
          department_id: string | null
          full_name: string
          github_url: string | null
          id: string
          linkedin_url: string | null
          portfolio_url: string | null
          semester: string | null
          university: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          course_id?: string | null
          created_at?: string
          department_id?: string | null
          full_name: string
          github_url?: string | null
          id: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          semester?: string | null
          university?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          course_id?: string | null
          created_at?: string
          department_id?: string | null
          full_name?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          semester?: string | null
          university?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          project_url: string | null
          tech_stack: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          project_url?: string | null
          tech_stack?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          project_url?: string | null
          tech_stack?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          language: string
          notifications_messages: boolean
          notifications_notices: boolean
          notifications_reminders: boolean
          sound_effects: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          notifications_messages?: boolean
          notifications_notices?: boolean
          notifications_reminders?: boolean
          sound_effects?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          notifications_messages?: boolean
          notifications_notices?: boolean
          notifications_reminders?: boolean
          sound_effects?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string
          id: string
          skill: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          skill: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          skill?: string
          user_id?: string
        }
        Relationships: []
      }
      wellness_logs: {
        Row: {
          created_at: string
          id: string
          mood: string | null
          notes: string | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood?: string | null
          notes?: string | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mood?: string | null
          notes?: string | null
          stress_level?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_dashboard_stats: { Args: never; Returns: Json }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_chat_participant: {
        Args: { _chat_id: string; _user_id: string }
        Returns: boolean
      }
      is_enrolled_in_class: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      is_teaching_class: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      announcement_type: "normal" | "emergency"
      app_role: "student" | "faculty" | "admin"
      chat_type: "direct" | "group"
      report_status: "pending" | "reviewed" | "resolved" | "dismissed"
      user_status: "pending" | "active" | "suspended"
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
      announcement_type: ["normal", "emergency"],
      app_role: ["student", "faculty", "admin"],
      chat_type: ["direct", "group"],
      report_status: ["pending", "reviewed", "resolved", "dismissed"],
      user_status: ["pending", "active", "suspended"],
    },
  },
} as const
