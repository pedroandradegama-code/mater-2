import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Profissional {
  id: string;
  user_id: string;
  email: string;
  nome: string | null;
  profissao: "enfermeira" | "doula" | "medica" | "outro";
  status: "ativo" | "inativo" | "pendente";
  codigo_afiliada: string;
  link_kiwify: string | null;
  codigo_convite: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfissionalContextType {
  profissional: Profissional | null;
  isProfissional: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ProfissionalContext = createContext<ProfissionalContextType>({
  profissional: null,
  isProfissional: false,
  loading: true,
  refresh: async () => {},
});

export function ProfissionalProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profissional, setProfissional] = useState<Profissional | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) {
      setProfissional(null);
      setLoading(false);
      return;
    }
    const { data, error } = await (supabase as any)
      .from("profissionais")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setProfissional(data as Profissional);
    } else {
      setProfissional(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!authLoading) load();
  }, [user, authLoading]);

  // Escuta eventos de auth para recarregar (evita race condition em signup/login)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      load();
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <ProfissionalContext.Provider
      value={{ profissional, isProfissional: !!profissional && profissional.status === "ativo", loading, refresh: load }}
    >
      {children}
    </ProfissionalContext.Provider>
  );
}

export function useProfissional() {
  return useContext(ProfissionalContext);
}
