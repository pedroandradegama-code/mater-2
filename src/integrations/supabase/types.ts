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
      afiliadas: {
        Row: {
          codigo_afiliada: string | null
          created_at: string | null
          email: string
          id: string
          indicada_por: string | null
          link_kiwify: string | null
          nome: string
          profissao: string | null
          status: string | null
          whatsapp: string | null
        }
        Insert: {
          codigo_afiliada?: string | null
          created_at?: string | null
          email: string
          id?: string
          indicada_por?: string | null
          link_kiwify?: string | null
          nome: string
          profissao?: string | null
          status?: string | null
          whatsapp?: string | null
        }
        Update: {
          codigo_afiliada?: string | null
          created_at?: string | null
          email?: string
          id?: string
          indicada_por?: string | null
          link_kiwify?: string | null
          nome?: string
          profissao?: string | null
          status?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      afiliadas_vendas: {
        Row: {
          afiliada_id: string | null
          comissao: number | null
          data_venda: string | null
          email_compradora: string | null
          id: string
          kiwify_order_id: string | null
          status_pagamento: string | null
          valor_venda: number | null
        }
        Insert: {
          afiliada_id?: string | null
          comissao?: number | null
          data_venda?: string | null
          email_compradora?: string | null
          id?: string
          kiwify_order_id?: string | null
          status_pagamento?: string | null
          valor_venda?: number | null
        }
        Update: {
          afiliada_id?: string | null
          comissao?: number | null
          data_venda?: string | null
          email_compradora?: string | null
          id?: string
          kiwify_order_id?: string | null
          status_pagamento?: string | null
          valor_venda?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "afiliadas_vendas_afiliada_id_fkey"
            columns: ["afiliada_id"]
            isOneToOne: false
            referencedRelation: "afiliadas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "afiliadas_vendas_afiliada_id_fkey"
            columns: ["afiliada_id"]
            isOneToOne: false
            referencedRelation: "afiliadas_performance"
            referencedColumns: ["id"]
          },
        ]
      }
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
      eventos: {
        Row: {
          created_at: string
          data_hora: string
          id: string
          image_url: string | null
          local: string
          mensagem: string | null
          nome_bebe: string | null
          nome_familia: string
          rsvp: string | null
          status: string
          template_id: string
          templated_render_id: string | null
          tipo_evento: string
          titulo_evento: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_hora: string
          id?: string
          image_url?: string | null
          local: string
          mensagem?: string | null
          nome_bebe?: string | null
          nome_familia: string
          rsvp?: string | null
          status?: string
          template_id: string
          templated_render_id?: string | null
          tipo_evento: string
          titulo_evento: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_hora?: string
          id?: string
          image_url?: string | null
          local?: string
          mensagem?: string | null
          nome_bebe?: string | null
          nome_familia?: string
          rsvp?: string | null
          status?: string
          template_id?: string
          templated_render_id?: string | null
          tipo_evento?: string
          titulo_evento?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      musica_bebe: {
        Row: {
          audio_url: string | null
          created_at: string
          elevenlabs_generation_id: string | null
          estilo: string
          id: string
          idioma: string
          nome_bebe: string | null
          prompt_gerado: string | null
          status: string
          temas: Json
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          elevenlabs_generation_id?: string | null
          estilo: string
          id?: string
          idioma: string
          nome_bebe?: string | null
          prompt_gerado?: string | null
          status?: string
          temas?: Json
          user_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          elevenlabs_generation_id?: string | null
          estilo?: string
          id?: string
          idioma?: string
          nome_bebe?: string | null
          prompt_gerado?: string | null
          status?: string
          temas?: Json
          user_id?: string
        }
        Relationships: []
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
      peso_gestacional: {
        Row: {
          created_at: string
          data: string
          id: string
          observacao: string | null
          peso: number
          semana: number
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          observacao?: string | null
          peso: number
          semana: number
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          observacao?: string | null
          peso?: number
          semana?: number
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
      afiliadas_performance: {
        Row: {
          codigo_afiliada: string | null
          comissao_paga: number | null
          comissao_pendente: number | null
          created_at: string | null
          email: string | null
          id: string | null
          indicada_por: string | null
          link_kiwify: string | null
          nome: string | null
          profissao: string | null
          status: string | null
          total_vendas: number | null
          whatsapp: string | null
        }
        Relationships: []
      }
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
