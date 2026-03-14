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
      cartas: {
        Row: {
          created_at: string
          data: string
          id: string
          semana: number | null
          texto: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          semana?: number | null
          texto: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          semana?: number | null
          texto?: string
          user_id?: string
        }
        Relationships: []
      }
      checklist_mala: {
        Row: {
          checked: boolean
          created_at: string
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          checked?: boolean
          created_at?: string
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          checked?: boolean
          created_at?: string
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: []
      }
      consultas: {
        Row: {
          created_at: string
          data: string
          id: string
          local: string | null
          medico: string | null
          observacoes: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          id?: string
          local?: string | null
          medico?: string | null
          observacoes?: string | null
          tipo?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          local?: string | null
          medico?: string | null
          observacoes?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      diario: {
        Row: {
          created_at: string
          data: string
          foto_url: string | null
          fotos: Json | null
          humor: string | null
          id: string
          semana: number | null
          texto_livre: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          foto_url?: string | null
          fotos?: Json | null
          humor?: string | null
          id?: string
          semana?: number | null
          texto_livre?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          foto_url?: string | null
          fotos?: Json | null
          humor?: string | null
          id?: string
          semana?: number | null
          texto_livre?: string | null
          user_id?: string
        }
        Relationships: []
      }
      enquetes: {
        Row: {
          created_at: string
          id: string
          opcoes: Json
          pergunta: string
          semana_max: number
          semana_min: number
        }
        Insert: {
          created_at?: string
          id?: string
          opcoes?: Json
          pergunta: string
          semana_max: number
          semana_min: number
        }
        Update: {
          created_at?: string
          id?: string
          opcoes?: Json
          pergunta?: string
          semana_max?: number
          semana_min?: number
        }
        Relationships: []
      }
      enquetes_respostas: {
        Row: {
          created_at: string
          enquete_id: string
          id: string
          opcao_escolhida: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enquete_id: string
          id?: string
          opcao_escolhida: string
          user_id: string
        }
        Update: {
          created_at?: string
          enquete_id?: string
          id?: string
          opcao_escolhida?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquetes_respostas_enquete_id_fkey"
            columns: ["enquete_id"]
            isOneToOne: false
            referencedRelation: "enquetes"
            referencedColumns: ["id"]
          },
        ]
      }
      nome_favoritos: {
        Row: {
          created_at: string
          id: string
          nome: string
          origem: string | null
          significado: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          origem?: string | null
          significado?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          origem?: string | null
          significado?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plano_parto: {
        Row: {
          created_at: string
          id: string
          pdf_url: string | null
          respostas: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pdf_url?: string | null
          respostas?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pdf_url?: string | null
          respostas?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          dum: string | null
          email: string | null
          id: string
          nome: string | null
          nome_bebe: string | null
          onboarding_completed: boolean
          plano: string
          sexo_bebe: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dum?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          nome_bebe?: string | null
          onboarding_completed?: boolean
          plano?: string
          sexo_bebe?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dum?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          nome_bebe?: string | null
          onboarding_completed?: boolean
          plano?: string
          sexo_bebe?: string | null
          updated_at?: string
          user_id?: string
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
