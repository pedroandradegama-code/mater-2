import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Waves, RotateCcw } from "lucide-react";

function parseDate(str: string): Date | null {
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function semanasEDias(totalDias: number) {
  return { semanas: Math.floor(totalDias / 7), dias: totalDias % 7 };
}

function formatBR(d: Date): string {
  return d.toLocaleDateString("pt-BR");
}

function dppDeDate(dum: Date): Date {
  const dpp = new Date(dum);
  dpp.setDate(dpp.getDate() + 280);
  return dpp;
}

function trimestre(semanas: number): string {
  if (semanas < 13) return "1º Trimestre";
  if (semanas < 27) return "2º Trimestre";
  return "3º Trimestre";
}

function igFormatado(semanas: number, dias: number): string {
  if (dias === 0) return `${semanas} semanas`;
  return `${semanas} sem + ${dias} dia${dias > 1 ? "s" : ""}`;
}

interface IGResultado {
  semanas: number;
  dias: number;
  dpp: string;
  dumUsada: string;
  trimestre: string;
  totalDias: number;
}

function ResultadoIG({ r }: { r: IGResultado }) {
  const progresso = Math.min((r.totalDias / 280) * 100, 100);
  return (
    <div className="mt-6 space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Idade Gestacional</p>
        <p className="text-3xl font-bold text-primary">{igFormatado(r.semanas, r.dias)}</p>
        <Badge variant="secondary" className="mt-1">{r.trimestre}</Badge>
      </div>

      <div className="space-y-1">
        <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progresso}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 sem</span>
          <span>{Math.round(progresso)}% da gestação</span>
          <span>40 sem</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground">DUM usada</p>
          <p className="text-sm font-semibold">{r.dumUsada}</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground">DPP (Naegele)</p>
          <p className="text-sm font-semibold">{r.dpp}</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Semana atual</p>
          <p className="text-sm font-semibold">{r.semanas}ª</p>
        </div>
      </div>
    </div>
  );
}

function CalcPorDUM() {
  const [dum, setDum] = useState("");
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<IGResultado | null>(null);

  function calcular() {
    setErro("");
    const dumDate = parseDate(dum);
    if (!dumDate) { setErro("Informe uma data válida."); return; }
    const hoje = new Date();
    const total = diffDays(dumDate, hoje);
    if (total < 0) { setErro("A DUM não pode ser no futuro."); return; }
    if (total > 294) { setErro("DUM muito antiga — verifique a data."); return; }
    const { semanas, dias } = semanasEDias(total);
    setResultado({ semanas, dias, totalDias: total, dumUsada: formatBR(dumDate), dpp: formatBR(dppDeDate(dumDate)), trimestre: trimestre(semanas) });
  }

  function limpar() { setDum(""); setErro(""); setResultado(null); }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Data da Última Menstruação (DUM)</Label>
        <div className="flex gap-2">
          <Input type="date" value={dum}
            onChange={(e) => { setDum(e.target.value); setResultado(null); setErro(""); }}
            max={new Date().toISOString().split("T")[0]} className="flex-1" />
          {resultado && (
            <Button variant="ghost" size="icon" onClick={limpar}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
      </div>
      <Button onClick={calcular} className="w-full">Calcular IG</Button>
      {resultado && <ResultadoIG r={resultado} />}
      <p className="text-xs text-muted-foreground text-center mt-2">Método: Regra de Naegele · DPP = DUM + 280 dias</p>
    </div>
  );
}

function CalcPorUSG() {
  const [dataExame, setDataExame] = useState("");
  const [igSemanas, setIgSemanas] = useState("");
  const [igDias, setIgDias] = useState("0");
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<IGResultado | null>(null);

  function calcular() {
    setErro("");
    const exame = parseDate(dataExame);
    const sem = parseInt(igSemanas);
    const dias = parseInt(igDias) || 0;
    if (!exame) { setErro("Informe a data do exame."); return; }
    if (isNaN(sem) || sem < 6 || sem > 14) { setErro("IG na USG deve ser entre 6 e 14 semanas (1º trimestre)."); return; }
    const igNaData = sem * 7 + dias;
    const dumCorrigida = new Date(exame);
    dumCorrigida.setDate(dumCorrigida.getDate() - igNaData);
    const hoje = new Date();
    const totalHoje = diffDays(dumCorrigida, hoje);
    if (totalHoje < 0) { setErro("Data do exame no futuro?"); return; }
    if (totalHoje > 294) { setErro("Verifique os dados — gestação calculada muito longa."); return; }
    const { semanas: semH, dias: diasH } = semanasEDias(totalHoje);
    setResultado({ semanas: semH, dias: diasH, totalDias: totalHoje, dumUsada: `${formatBR(dumCorrigida)} (corrigida)`, dpp: formatBR(dppDeDate(dumCorrigida)), trimestre: trimestre(semH) });
  }

  function limpar() { setDataExame(""); setIgSemanas(""); setIgDias("0"); setErro(""); setResultado(null); }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        USG do 1º trimestre (6–14 semanas) — período de maior precisão para datação. Utilize a IG estimada pelo ultrassonografista na data do exame.
      </p>

      <div className="grid gap-4">
        <div className="space-y-1">
          <Label>Data do exame de USG</Label>
          <Input type="date" value={dataExame}
            onChange={(e) => { setDataExame(e.target.value); setResultado(null); setErro(""); }}
            max={new Date().toISOString().split("T")[0]} />
        </div>
        <div className="space-y-1">
          <Label>IG na USG — semanas</Label>
          <Input type="number" min={6} max={14} placeholder="Ex: 12" value={igSemanas}
            onChange={(e) => { setIgSemanas(e.target.value); setResultado(null); setErro(""); }} />
        </div>
        <div className="space-y-1">
          <Label>Dias adicionais</Label>
          <Select value={igDias} onValueChange={(v) => { setIgDias(v); setResultado(null); setErro(""); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[0,1,2,3,4,5,6].map((d) => (
                <SelectItem key={d} value={String(d)}>{d} dia{d !== 1 ? "s" : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <div className="flex gap-2">
        <Button onClick={calcular} className="flex-1">Calcular pela USG</Button>
        {resultado && <Button variant="ghost" size="icon" onClick={limpar}><RotateCcw className="w-4 h-4" /></Button>}
      </div>

      {resultado && <ResultadoIG r={resultado} />}
      <p className="text-xs text-muted-foreground text-center mt-2">DUM corrigida = data do exame − IG na USG · DPP = DUM corrigida + 280 dias</p>
    </div>
  );
}

export function CalculadorasIG() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Calculadoras de IG
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dum">
          <TabsList className="w-full">
            <TabsTrigger value="dum" className="flex-1">
              Por DUM
            </TabsTrigger>
            <TabsTrigger value="usg" className="flex-1">
              Por USG 1º Trim.
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dum"><CalcPorDUM /></TabsContent>
          <TabsContent value="usg"><CalcPorUSG /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
