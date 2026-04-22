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
      cartao_gestante: {
        Row: {
          acido_folico: Json | null
          antecedentes_clinicos: Json | null
          antecedentes_familiares: Json | null
          confianca_extracao: number | null
          consultas_cartao: Json | null
          created_at: string | null
          dpp_clinico: string | null
          dpp_usg: string | null
          dum: string | null
          exames: Json | null
          gestacao_atual: Json | null
          gestas_previas: Json | null
          gravidez_planejada: boolean | null
          grupo_sanguineo: string | null
          id: string
          risco: string | null
          sulfato_ferroso: Json | null
          tipo_gravidez: string | null
          ultimo_pdf_processado_em: string | null
          ultimo_pdf_url: string | null
          ultrassonografias: Json | null
          updated_at: string | null
          user_id: string
          vacinas: Json | null
        }
        Insert: {
          acido_folico?: Json | null
          antecedentes_clinicos?: Json | null
          antecedentes_familiares?: Json | null
          confianca_extracao?: number | null
          consultas_cartao?: Json | null
          created_at?: string | null
          dpp_clinico?: string | null
          dpp_usg?: string | null
          dum?: string | null
          exames?: Json | null
          gestacao_atual?: Json | null
          gestas_previas?: Json | null
          gravidez_planejada?: boolean | null
          grupo_sanguineo?: string | null
          id?: string
          risco?: string | null
          sulfato_ferroso?: Json | null
          tipo_gravidez?: string | null
          ultimo_pdf_processado_em?: string | null
          ultimo_pdf_url?: string | null
          ultrassonografias?: Json | null
          updated_at?: string | null
          user_id: string
          vacinas?: Json | null
        }
        Update: {
          acido_folico?: Json | null
          antecedentes_clinicos?: Json | null
          antecedentes_familiares?: Json | null
          confianca_extracao?: number | null
          consultas_cartao?: Json | null
          created_at?: string | null
          dpp_clinico?: string | null
          dpp_usg?: string | null
          dum?: string | null
          exames?: Json | null
          gestacao_atual?: Json | null
          gestas_previas?: Json | null
          gravidez_planejada?: boolean | null
          grupo_sanguineo?: string | null
          id?: string
          risco?: string | null
          sulfato_ferroso?: Json | null
          tipo_gravidez?: string | null
          ultimo_pdf_processado_em?: string | null
          ultimo_pdf_url?: string | null
          ultrassonografias?: Json | null
          updated_at?: string | null
          user_id?: string
          vacinas?: Json | null
        }
        Relationships: []
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
      eventos_assistenciais_agendados: {
        Row: {
          created_at: string
          data_agendada: string | null
          id: string
          nome: string
          realizado: boolean
          semana_prevista: number | null
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_agendada?: string | null
          id?: string
          nome: string
          realizado?: boolean
          semana_prevista?: number | null
          tipo?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_agendada?: string | null
          id?: string
          nome?: string
          realizado?: boolean
          semana_prevista?: number | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      exames: {
        Row: {
          arquivo_nome: string | null
          arquivo_tipo: string | null
          arquivo_url: string | null
          categoria: string
          created_at: string
          data_coleta: string | null
          id: string
          nome_exame: string
          observacoes: string | null
          semana_gestacional: number | null
          user_id: string
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_tipo?: string | null
          arquivo_url?: string | null
          categoria?: string
          created_at?: string
          data_coleta?: string | null
          id?: string
          nome_exame: string
          observacoes?: string | null
          semana_gestacional?: number | null
          user_id: string
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_tipo?: string | null
          arquivo_url?: string | null
          categoria?: string
          created_at?: string
          data_coleta?: string | null
          id?: string
          nome_exame?: string
          observacoes?: string | null
          semana_gestacional?: number | null
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
      passaporte: {
        Row: {
          card_url: string | null
          created_at: string
          frase_gerada: string | null
          id: string
          respostas: Json
          user_id: string
        }
        Insert: {
          card_url?: string | null
          created_at?: string
          frase_gerada?: string | null
          id?: string
          respostas?: Json
          user_id: string
        }
        Update: {
          card_url?: string | null
          created_at?: string
          frase_gerada?: string | null
          id?: string
          respostas?: Json
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
          avatar_url: string | null
          created_at: string
          date_reference: string | null
          dum: string | null
          email: string | null
          id: string
          nome: string | null
          nome_bebe: string | null
          onboarding_completed: boolean
          plano: string
          primeira_gestacao: boolean | null
          sexo_bebe: string | null
          updated_at: string
          user_id: string
          usg_1t_date: string | null
          utm_ref: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_reference?: string | null
          dum?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          nome_bebe?: string | null
          onboarding_completed?: boolean
          plano?: string
          primeira_gestacao?: boolean | null
          sexo_bebe?: string | null
          updated_at?: string
          user_id: string
          usg_1t_date?: string | null
          utm_ref?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_reference?: string | null
          dum?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          nome_bebe?: string | null
          onboarding_completed?: boolean
          plano?: string
          primeira_gestacao?: boolean | null
          sexo_bebe?: string | null
          updated_at?: string
          user_id?: string
          usg_1t_date?: string | null
          utm_ref?: string | null
        }
        Relationships: []
      }
      profissionais: {
        Row: {
          codigo_afiliada: string
          codigo_convite: string | null
          created_at: string | null
          email: string
          id: string
          link_kiwify: string | null
          nome: string | null
          profissao: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          codigo_afiliada: string
          codigo_convite?: string | null
          created_at?: string | null
          email: string
          id?: string
          link_kiwify?: string | null
          nome?: string | null
          profissao?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          codigo_afiliada?: string
          codigo_convite?: string | null
          created_at?: string | null
          email?: string
          id?: string
          link_kiwify?: string | null
          nome?: string | null
          profissao?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profissionais_convites: {
        Row: {
          codigo: string
          created_at: string | null
          criado_por: string | null
          email_destino: string | null
          expires_at: string | null
          id: string
          profissional_id: string | null
          usado: boolean | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          criado_por?: string | null
          email_destino?: string | null
          expires_at?: string | null
          id?: string
          profissional_id?: string | null
          usado?: boolean | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          criado_por?: string | null
          email_destino?: string | null
          expires_at?: string | null
          id?: string
          profissional_id?: string | null
          usado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profissionais_convites_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profissionais_convites_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_admin_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profissionais_convites_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissional_dashboard"
            referencedColumns: ["profissional_id"]
          },
          {
            foreignKeyName: "profissionais_convites_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissional_indicadas"
            referencedColumns: ["profissional_id"]
          },
        ]
      }
      upload_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          usado: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          usado?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          usado?: boolean | null
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
      profissionais_admin_view: {
        Row: {
          codigo_afiliada: string | null
          codigo_convite: string | null
          comissao_paga: number | null
          comissao_pendente: number | null
          comissao_total: number | null
          created_at: string | null
          email: string | null
          id: string | null
          link_kiwify: string | null
          nome: string | null
          profissao: string | null
          status: string | null
          total_cadastros: number | null
          total_conversoes: number | null
          user_id: string | null
        }
        Relationships: []
      }
      profissional_dashboard: {
        Row: {
          codigo_afiliada: string | null
          comissao_paga: number | null
          comissao_pendente: number | null
          comissao_total: number | null
          email: string | null
          link_kiwify: string | null
          nome: string | null
          profissao: string | null
          profissional_id: string | null
          status: string | null
          total_cadastros: number | null
          total_conversoes: number | null
          user_id: string | null
        }
        Relationships: []
      }
      profissional_indicadas: {
        Row: {
          codigo_afiliada: string | null
          comissao: number | null
          data_cadastro: string | null
          data_venda: string | null
          email_indicada: string | null
          nome_indicada: string | null
          perfil_id: string | null
          plano: string | null
          profissional_id: string | null
          status_pagamento: string | null
          valor_venda: number | null
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
