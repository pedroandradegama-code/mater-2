import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calculator, Users, Stethoscope } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfissional } from "@/hooks/useProfissional";
import { CalculadorasIG } from "@/components/profissional/CalculadorasIG";
import { PainelAfiliada } from "@/components/profissional/PainelAfiliada";

export default function ProfissionalDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { profissional, isProfissional, loading: profLoading } = useProfissional();
  const [tab, setTab] = useState("calculadoras");

  if (authLoading || profLoading) return (
    <div className="gradient-mesh-bg min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Carregando...</div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (!isProfissional) return <Navigate to="/dashboard" replace />;

  const primeiroNome = profissional?.nome?.split(" ")[0] ?? "Profissional";

  return (
    <div className="gradient-mesh-bg min-h-screen pb-8">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        <div className="glass-card-elevated p-5 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">Olá, {primeiroNome} 👋</h1>
                <Badge variant="secondary" className="text-xs">
                  {profissional?.profissao ?? "Profissional"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Acesso profissional · Mater</p>
            </div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="calculadoras" className="flex-1 gap-1.5">
              <Calculator className="w-4 h-4" />
              Calculadoras IG
            </TabsTrigger>
            <TabsTrigger value="indicadas" className="flex-1 gap-1.5">
              <Users className="w-4 h-4" />
              Minhas indicadas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="calculadoras"><CalculadorasIG /></TabsContent>
          <TabsContent value="indicadas"><PainelAfiliada /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
