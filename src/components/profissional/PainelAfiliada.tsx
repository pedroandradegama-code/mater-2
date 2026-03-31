import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, TrendingUp, DollarSign, Link2, Copy, CheckCheck, Clock, ShoppingCart, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfissional } from "@/hooks/useProfissional";

interface DashStats {
  total_cadastros: number;
  total_conversoes: number;
  comissao_total: number;
  comissao_paga: number;
  comissao_pendente: number;
}

interface Indicada {
  nome_indicada: string | null;
  email_indicada: string;
  plano: string | null;
  data_cadastro: string | null;
  comissao: number | null;
  status_pagamento: string | null;
}

function brl(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function dataBR(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("pt-BR");
}

function Stat({ icon: Icon, label, value, sub, destaque }: { icon: React.ElementType; label: string; value: string | number; sub?: string; destaque?: boolean }) {
  return (
    <div className={`rounded-xl p-4 text-center ${destaque ? "bg-primary/10 border border-primary/20" : "bg-muted/50"}`}>
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={`text-xl font-bold ${destaque ? "text-primary" : ""}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function LinksAfiliada({ codigo, linkKiwify }: { codigo: string; linkKiwify: string | null }) {
  const [copied, setCopied] = useState<string | null>(null);
  const linkCadastro = `https://materapp.com.br/cadastro?ref=${codigo}`;
  const linkVenda = linkKiwify ?? `https://pay.kiwify.com.br/yrK0rg9?aff=${codigo}`;

  function copiar(texto: string, id: string) {
    navigator.clipboard.writeText(texto);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function LinkRow({ label, url, id, hint }: { label: string; url: string; id: string; hint: string }) {
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <p className="text-xs truncate flex-1 text-muted-foreground">{url}</p>
          <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={() => copiar(url, id)}>
            {copied === id ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="w-5 h-5 text-primary" />
          Seus links de indicação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LinkRow label="Link de cadastro" url={linkCadastro} id="cadastro" hint="Paciente se cadastra por aqui e fica vinculada a você" />
        <LinkRow label="Link de venda (Kiwify)" url={linkVenda} id="venda" hint="Paciente compra diretamente — comissão automática" />
        <p className="text-xs text-center text-muted-foreground pt-2">
          💰 Comissão de 50% por venda · ~R$9,50 por assinante
        </p>
      </CardContent>
    </Card>
  );
}

function TabelaIndicadas({ profissionalId }: { profissionalId: string }) {
  const [lista, setLista] = useState<Indicada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any)
      .from("profissional_indicadas")
      .select("*")
      .eq("profissional_id", profissionalId)
      .then(({ data }: { data: any }) => { setLista((data ?? []) as Indicada[]); setLoading(false); });
  }, [profissionalId]);

  if (loading) return <div className="h-20 flex items-center justify-center text-muted-foreground text-sm">Carregando...</div>;

  if (lista.length === 0) return (
    <div className="text-center py-8 space-y-2">
      <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
      <p className="text-sm font-medium">Nenhuma indicada ainda.</p>
      <p className="text-xs text-muted-foreground">Compartilhe seu link de cadastro para começar!</p>
    </div>
  );

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead>Comissão</TableHead>
            <TableHead>Pgto.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lista.map((ind, i) => (
            <TableRow key={i}>
              <TableCell>
                <p className="font-medium text-sm">{ind.nome_indicada ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{ind.email_indicada}</p>
              </TableCell>
              <TableCell>
                <Badge variant={ind.plano && ind.plano !== "gratuito" ? "default" : "secondary"}>
                  {ind.plano && ind.plano !== "gratuito" ? "Assinante ✓" : "Gratuito"}
                </Badge>
              </TableCell>
              <TableCell>{dataBR(ind.data_cadastro)}</TableCell>
              <TableCell>{ind.comissao != null ? brl(ind.comissao) : "—"}</TableCell>
              <TableCell>
                {ind.status_pagamento === "pago" ? (
                  <Badge variant="default" className="bg-green-600">Pago</Badge>
                ) : ind.status_pagamento === "pendente" ? (
                  <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function PainelAfiliada() {
  const { profissional, loading: profLoading } = useProfissional();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!profissional) return;
    (supabase as any)
      .from("profissional_dashboard")
      .select("total_cadastros,total_conversoes,comissao_total,comissao_paga,comissao_pendente")
      .eq("profissional_id", profissional.id)
      .maybeSingle()
      .then(({ data }: { data: any }) => { setStats(data as DashStats | null); setLoadingStats(false); });
  }, [profissional]);

  if (profLoading || loadingStats) return <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Carregando...</div>;

  if (!profissional) return (
    <div className="text-center py-12 space-y-2">
      <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
      <p className="font-medium">Perfil de afiliada não encontrado.</p>
      <p className="text-sm text-muted-foreground">Fale com a equipe Mater para ativar seu acesso.</p>
    </div>
  );

  const s = stats ?? { total_cadastros: 0, total_conversoes: 0, comissao_total: 0, comissao_paga: 0, comissao_pendente: 0 };
  const taxaConv = s.total_cadastros > 0 ? `${Math.round((s.total_conversoes / s.total_cadastros) * 100)}% conversão` : "0% conversão";

  return (
    <div className="space-y-6">
      <LinksAfiliada codigo={profissional.codigo_afiliada} linkKiwify={profissional.link_kiwify} />

      <div className="grid grid-cols-2 gap-3">
        <Stat icon={Users} label="Cadastros" value={s.total_cadastros} sub={taxaConv} />
        <Stat icon={ShoppingCart} label="Conversões" value={s.total_conversoes} />
        <Stat icon={DollarSign} label="Comissão Total" value={brl(s.comissao_total)} destaque />
        <Stat icon={TrendingUp} label="Pendente" value={brl(s.comissao_pendente)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Minhas indicadas
            {s.total_cadastros > 0 && <Badge variant="secondary">{s.total_cadastros}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TabelaIndicadas profissionalId={profissional.id} />
        </CardContent>
      </Card>
    </div>
  );
}
