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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      booking_seats: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          price: number
          row_number: number
          seat_number: number
          showtime_id: string
          tier: Database["public"]["Enums"]["seat_tier_name"]
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          price: number
          row_number: number
          seat_number: number
          showtime_id: string
          tier: Database["public"]["Enums"]["seat_tier_name"]
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          price?: number
          row_number?: number
          seat_number?: number
          showtime_id?: string
          tier?: Database["public"]["Enums"]["seat_tier_name"]
        }
        Relationships: [
          {
            foreignKeyName: "booking_seats_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_seats_showtime_id_fkey"
            columns: ["showtime_id"]
            isOneToOne: false
            referencedRelation: "showtimes"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          confirmation_code: string
          created_at: string
          id: string
          showtime_id: string
          status: Database["public"]["Enums"]["booking_status"]
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          confirmation_code?: string
          created_at?: string
          id?: string
          showtime_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          confirmation_code?: string
          created_at?: string
          id?: string
          showtime_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_showtime_id_fkey"
            columns: ["showtime_id"]
            isOneToOne: false
            referencedRelation: "showtimes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author: string
          created_at: string
          id: string
          movie_id: number
          rating: number
          text: string
          user_id: string
        }
        Insert: {
          author: string
          created_at?: string
          id?: string
          movie_id: number
          rating: number
          text: string
          user_id: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: string
          movie_id?: number
          rating?: number
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      screens: {
        Row: {
          created_at: string
          id: string
          name: string
          seats_per_row: number
          theater_id: string
          total_rows: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          seats_per_row?: number
          theater_id: string
          total_rows?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          seats_per_row?: number
          theater_id?: string
          total_rows?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "screens_theater_id_fkey"
            columns: ["theater_id"]
            isOneToOne: false
            referencedRelation: "theaters"
            referencedColumns: ["id"]
          },
        ]
      }
      seat_tiers: {
        Row: {
          created_at: string
          id: string
          price_multiplier: number
          row_end: number
          row_start: number
          screen_id: string
          tier: Database["public"]["Enums"]["seat_tier_name"]
        }
        Insert: {
          created_at?: string
          id?: string
          price_multiplier?: number
          row_end: number
          row_start: number
          screen_id: string
          tier: Database["public"]["Enums"]["seat_tier_name"]
        }
        Update: {
          created_at?: string
          id?: string
          price_multiplier?: number
          row_end?: number
          row_start?: number
          screen_id?: string
          tier?: Database["public"]["Enums"]["seat_tier_name"]
        }
        Relationships: [
          {
            foreignKeyName: "seat_tiers_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      showtimes: {
        Row: {
          base_price: number
          created_at: string
          id: string
          movie_id: number
          movie_title: string
          poster_path: string | null
          screen_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          id?: string
          movie_id: number
          movie_title: string
          poster_path?: string | null
          screen_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          id?: string
          movie_id?: number
          movie_title?: string
          poster_path?: string | null
          screen_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "showtimes_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      theaters: {
        Row: {
          address: string | null
          city: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
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
      watchlist: {
        Row: {
          created_at: string
          genre_ids: number[] | null
          id: string
          movie_id: number
          movie_title: string
          poster_path: string | null
          release_date: string | null
          user_id: string
          vote_average: number | null
        }
        Insert: {
          created_at?: string
          genre_ids?: number[] | null
          id?: string
          movie_id: number
          movie_title: string
          poster_path?: string | null
          release_date?: string | null
          user_id: string
          vote_average?: number | null
        }
        Update: {
          created_at?: string
          genre_ids?: number[] | null
          id?: string
          movie_id?: number
          movie_title?: string
          poster_path?: string | null
          release_date?: string | null
          user_id?: string
          vote_average?: number | null
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
      app_role: "admin" | "user"
      booking_status: "pending" | "confirmed" | "cancelled" | "failed"
      seat_tier_name: "standard" | "premium" | "vip"
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
      app_role: ["admin", "user"],
      booking_status: ["pending", "confirmed", "cancelled", "failed"],
      seat_tier_name: ["standard", "premium", "vip"],
    },
  },
} as const
