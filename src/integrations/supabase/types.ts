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
      carbon_credit_batches: {
        Row: {
          buyer: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          estimated_co2_tons: number | null
          id: string
          sale_date: string | null
          sale_price: number | null
          state: string | null
          status: string | null
          title: string
          tree_count: number | null
          zlto_distributed: number | null
        }
        Insert: {
          buyer?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_co2_tons?: number | null
          id?: string
          sale_date?: string | null
          sale_price?: number | null
          state?: string | null
          status?: string | null
          title: string
          tree_count?: number | null
          zlto_distributed?: number | null
        }
        Update: {
          buyer?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_co2_tons?: number | null
          id?: string
          sale_date?: string | null
          sale_price?: number | null
          state?: string | null
          status?: string | null
          title?: string
          tree_count?: number | null
          zlto_distributed?: number | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string | null
          completion_code: string | null
          created_at: string | null
          description: string | null
          duration_hours: number | null
          id: string
          provider: string | null
          title: string
          zlto_reward: number | null
        }
        Insert: {
          category?: string | null
          completion_code?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          provider?: string | null
          title: string
          zlto_reward?: number | null
        }
        Update: {
          category?: string | null
          completion_code?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          provider?: string | null
          title?: string
          zlto_reward?: number | null
        }
        Relationships: []
      }
      gig_applications: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          gig_id: string
          id: string
          status: Database["public"]["Enums"]["gig_status"] | null
          tx_hash: string | null
          updated_at: string | null
          user_id: string
          verified_by: string | null
          zlto_awarded: number | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          gig_id: string
          id?: string
          status?: Database["public"]["Enums"]["gig_status"] | null
          tx_hash?: string | null
          updated_at?: string | null
          user_id: string
          verified_by?: string | null
          zlto_awarded?: number | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          gig_id?: string
          id?: string
          status?: Database["public"]["Enums"]["gig_status"] | null
          tx_hash?: string | null
          updated_at?: string | null
          user_id?: string
          verified_by?: string | null
          zlto_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gig_applications_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      gigs: {
        Row: {
          budget: number | null
          category: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          employer_id: string | null
          escrow_milestones: Json | null
          id: string
          is_escrow: boolean | null
          location: string | null
          skills_required: string[] | null
          state: string | null
          status: Database["public"]["Enums"]["gig_status"] | null
          title: string
          updated_at: string | null
          zlto_reward: number | null
        }
        Insert: {
          budget?: number | null
          category?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          employer_id?: string | null
          escrow_milestones?: Json | null
          id?: string
          is_escrow?: boolean | null
          location?: string | null
          skills_required?: string[] | null
          state?: string | null
          status?: Database["public"]["Enums"]["gig_status"] | null
          title: string
          updated_at?: string | null
          zlto_reward?: number | null
        }
        Update: {
          budget?: number | null
          category?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          employer_id?: string | null
          escrow_milestones?: Json | null
          id?: string
          is_escrow?: boolean | null
          location?: string | null
          skills_required?: string[] | null
          state?: string | null
          status?: Database["public"]["Enums"]["gig_status"] | null
          title?: string
          updated_at?: string | null
          zlto_reward?: number | null
        }
        Relationships: []
      }
      green_projects: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          lga: string | null
          program: string | null
          start_date: string | null
          state: string | null
          survival_bonus_zlto: number | null
          target_trees: number | null
          title: string
          updated_at: string | null
          zlto_per_tree: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          lga?: string | null
          program?: string | null
          start_date?: string | null
          state?: string | null
          survival_bonus_zlto?: number | null
          target_trees?: number | null
          title: string
          updated_at?: string | null
          zlto_per_tree?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          lga?: string | null
          program?: string | null
          start_date?: string | null
          state?: string | null
          survival_bonus_zlto?: number | null
          target_trees?: number | null
          title?: string
          updated_at?: string | null
          zlto_per_tree?: number | null
        }
        Relationships: []
      }
      marketplace_items: {
        Row: {
          available: boolean | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          partner: string | null
          title: string
          zlto_cost: number
        }
        Insert: {
          available?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          partner?: string | null
          title: string
          zlto_cost: number
        }
        Update: {
          available?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          partner?: string | null
          title?: string
          zlto_cost?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          affiliations: string[] | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string
          id: string
          lga: string | null
          on_chain_reputation: Json | null
          phone: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          wallet_address: string | null
          zlto_balance: number | null
        }
        Insert: {
          affiliations?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          id?: string
          lga?: string | null
          on_chain_reputation?: Json | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          wallet_address?: string | null
          zlto_balance?: number | null
        }
        Update: {
          affiliations?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          id?: string
          lga?: string | null
          on_chain_reputation?: Json | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string | null
          zlto_balance?: number | null
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          status: string | null
          user_id: string
          voucher_code: string | null
          zlto_spent: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          status?: string | null
          user_id: string
          voucher_code?: string | null
          zlto_spent: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          status?: string | null
          user_id?: string
          voucher_code?: string | null
          zlto_spent?: number
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_completions: {
        Row: {
          completion_code: string | null
          course_id: string
          created_at: string | null
          id: string
          tx_hash: string | null
          user_id: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
          zlto_awarded: number | null
        }
        Insert: {
          completion_code?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          tx_hash?: string | null
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          zlto_awarded?: number | null
        }
        Update: {
          completion_code?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          tx_hash?: string | null
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          zlto_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_completions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      tree_submissions: {
        Row: {
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          photo_url: string
          project_id: string
          status: Database["public"]["Enums"]["tree_status"] | null
          survival_checks: Json | null
          tree_species: string | null
          tx_hash: string | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
          zlto_awarded: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          photo_url: string
          project_id: string
          status?: Database["public"]["Enums"]["tree_status"] | null
          survival_checks?: Json | null
          tree_species?: string | null
          tx_hash?: string | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          zlto_awarded?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          photo_url?: string
          project_id?: string
          status?: Database["public"]["Enums"]["tree_status"] | null
          survival_checks?: Json | null
          tree_species?: string | null
          tx_hash?: string | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          zlto_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tree_submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "green_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          program: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          program?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          program?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      zlto_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          tx_hash: string | null
          tx_type: Database["public"]["Enums"]["zlto_tx_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          tx_hash?: string | null
          tx_type: Database["public"]["Enums"]["zlto_tx_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          tx_hash?: string | null
          tx_type?: Database["public"]["Enums"]["zlto_tx_type"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "youth" | "admin" | "employer" | "partner" | "national_admin"
      gig_status:
        | "open"
        | "applied"
        | "in_progress"
        | "completed"
        | "verified"
        | "disputed"
      tree_status: "submitted" | "verified" | "rejected" | "alive" | "dead"
      zlto_tx_type:
        | "skill_reward"
        | "gig_reward"
        | "tree_reward"
        | "tree_survival_bonus"
        | "redemption"
        | "carbon_credit_distribution"
        | "escrow_deposit"
        | "escrow_release"
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
      app_role: ["youth", "admin", "employer", "partner", "national_admin"],
      gig_status: [
        "open",
        "applied",
        "in_progress",
        "completed",
        "verified",
        "disputed",
      ],
      tree_status: ["submitted", "verified", "rejected", "alive", "dead"],
      zlto_tx_type: [
        "skill_reward",
        "gig_reward",
        "tree_reward",
        "tree_survival_bonus",
        "redemption",
        "carbon_credit_distribution",
        "escrow_deposit",
        "escrow_release",
      ],
    },
  },
} as const
