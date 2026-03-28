import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { calculatePregnancyInfo, parseLocalDate } from '@/lib/pregnancy-data';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2, TrendingUp, Scale, Info, ZoomIn, ZoomOut } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface PesoEntry {
  id: string;
  semana: number;
  peso: number;
  data: string;
  observacao?: string | null;
}

interface IMCCategoria {
  key: 'baixo' | 'eutrofico' | 'sobrepeso' | 'obeso';
  label: string;
  imcRange: string;
  totalMin: number;
  totalMax: number;
  weekMin: number;
  weekMax: number;
  color: string;
  bgClass: string;
  textClass: string;
}

const CATEGORIAS: Record<string, IMCCategoria> = {
  baixo: {
    key: 'baixo', label: 'Baixo peso', imcRange: '< 18,5',
    totalMin: 12.5, totalMax: 18.0, weekMin: 0.44, weekMax: 0.58,
    color: 'hsl(210 70% 50%)', bgClass: 'bg-blue-50 text-blue-700', textClass: 'text-blue-600',
  },
  eutrofico: {
    key: 'eutrofico', label: 'Eutrófica', imcRange: '18,5 – 24,9',
    totalMin: 11.5, totalMax: 16.0, weekMin: 0.35, weekMax: 0.50,
    color: 'hsl(var(--primary))', bgClass: 'bg-primary-light text-primary', textClass: 'text-primary',
  },
  sobrepeso: {
    key: 'sobrepeso', label: 'Sobrepeso', imcRange: '25,0 – 29,9',
    totalMin: 7.0, totalMax: 11.5, weekMin: 0.23, weekMax: 0.33,
    color: 'hsl(35 90% 50%)', bgClass: 'bg-amber-50 text-amber-700', textClass: 'text-amber-600',
  },
  obeso: {
    key: 'obeso', label: 'Obesidade', imcRange: '≥ 30,0',
    totalMin: 5.0, totalMax: 9.0, weekMin: 0.17, weekMax: 0.27,
    color: 'hsl(0 70% 50%)', bgClass: 'bg-red-50 text-red-700', textClass: 'text-red-500',
  },
};

const PRIMEIRO_TRI_GANHO: Record<string, number> = {
  baixo: 2.3, eutrofico: 1.6, sobrepeso: 0.9, obeso: 0.5,
};

function calcCategoria(imc: number): string {
  if (imc < 18.5) return 'baixo';
  if (imc < 25.0) return 'eutrofico';
  if (imc < 30.0) return 'sobrepeso';
  return 'obeso';
}

function gerarFaixa(catKey: string): { semana: number; min: number; max: number }[] {
  const cat = CATEGORIAS[catKey];
  const primeiroTri = PRIMEIRO_TRI_GANHO[catKey];
  const result = [];
  for (let w = 4; w <= 42; w++) {
    let min: number, max: number;
    if (w <= 13) {
      const frac = (w - 4) / 9;
      min = +(frac * primeiroTri * 0.85).toFixed(2);
      max = +(frac * primeiroTri * 1.15).toFixed(2);
    } else {
      const semanasApos = w - 13;
      min = +(primeiroTri * 0.85 + semanasApos * cat.weekMin).toFixed(2);
      max = +(primeiroTri * 1.15 + semanasApos * cat.weekMax).toFixed(2);
    }
    result.push({ semana: w, min, max });
  }
  return result;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const ganho = payload.find((p: any) => p.dataKey === 'ganho')?.value;
  const min = payload.find((p: any) => p.dataKey === 'min')?.value;
  const max = payload.find((p: any) => p.dataKey === 'max')?.value;
  return (
    <div className="bg-card border border-[var(--card-border-color)] rounded-2xl p-3 shadow-lg text-sm">
      <p className="font-display font-semibold text-foreground mb-1">Semana {label}</p>
      {ganho != null && (
        <p className="text-primary font-medium">Seu ganho: {ganho > 0 ? '+' : ''}{Number(ganho).toFixed(1)} kg</p>
      )}
      {min != null && max != null && (
        <p className="text-muted-foreground text-xs mt-0.5">Faixa ideal: +{Number(min).toFixed(1)} – +{Number(max).toFixed(1)} kg</p>
      )}
    </div>
  );
}

export default function CurvaPeso() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formSemana, setFormSemana] = useState('');
  const [formPeso, setFormPeso] = useState('');
  const [formObs, setFormObs] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [zoomMode, setZoomMode] = useState(false);

  const hasDum = !!profile?.dum;
  const dum = hasDum ? parseLocalDate(profile!.dum!) : undefined;
  const info = dum ? calculatePregnancyInfo(dum) : null;
  const semanaAtual = info ? Math.min(info.weeks, 42) : null;

  const [pesoPreInput, setPesoPreInput] = useState(() => localStorage.getItem('mater_peso_pre') || '');
  const [alturaInput, setAlturaInput] = useState(() => localStorage.getItem('mater_altura') || '');

  const pesoPre = parseFloat(pesoPreInput) || null;
  const altura = parseFloat(alturaInput) || null;
  const imc = pesoPre && altura ? +(pesoPre / Math.pow(altura / 100, 2)).toFixed(1) : null;
  const catKey = imc ? calcCategoria(imc) : 'eutrofico';
  const cat = CATEGORIAS[catKey];
  const faixa = useMemo(() => gerarFaixa(catKey), [catKey]);

  const handlePesoPreChange = (v: string) => { setPesoPreInput(v); localStorage.setItem('mater_peso_pre', v); };
  const handleAlturaChange = (v: string) => { setAlturaInput(v); localStorage.setItem('mater_altura', v); };

  const { data: entradas = [] } = useQuery<PesoEntry[]>({
    queryKey: ['peso_gestacional', user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase.from('peso_gestacional' as any).select('*').eq('user_id', user!.id).order('semana', { ascending: true }) as any);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const addPeso = useMutation({
    mutationFn: async () => {
      const semana = parseInt(formSemana);
      const peso = parseFloat(formPeso);
      if (!semana || !peso || semana < 4 || semana > 42) throw new Error('Dados inválidos');
      const { error } = await (supabase.from('peso_gestacional' as any).upsert({ user_id: user!.id, semana, peso, data: new Date().toISOString().split('T')[0], observacao: formObs || null }, { onConflict: 'user_id,semana' }) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peso_gestacional'] });
      setDialogOpen(false); setFormSemana(''); setFormPeso(''); setFormObs('');
      toast.success('Peso registrado!');
    },
    onError: () => toast.error('Erro ao registrar peso. Tente novamente.'),
  });

  const deletePeso = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('peso_gestacional' as any).delete().eq('id', id).eq('user_id', user!.id) as any);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['peso_gestacional'] }); setDeleteId(null); toast.success('Registro removido.'); },
  });

  const chartData = useMemo(() => {
    const entradaMap = new Map(entradas.map(e => [e.semana, e.peso]));
    return faixa.map(({ semana, min, max }) => {
      const pesoRegistrado = entradaMap.get(semana);
      const ganho = pesoRegistrado != null && pesoPre ? +(pesoRegistrado - pesoPre).toFixed(2) : null;
      return { semana, min, max, ganho, hasEntry: pesoRegistrado != null };
    });
  }, [faixa, entradas, pesoPre]);

  // Zoom: show only ±6 weeks around current week
  const zoomedChartData = useMemo(() => {
    if (!zoomMode || !semanaAtual) return chartData;
    const minWeek = Math.max(4, semanaAtual - 6);
    const maxWeek = Math.min(42, semanaAtual + 6);
    return chartData.filter(d => d.semana >= minWeek && d.semana <= maxWeek);
  }, [chartData, zoomMode, semanaAtual]);

  const ultimaEntrada = entradas.length > 0 ? entradas[entradas.length - 1] : null;
  const ganhoTotal = ultimaEntrada && pesoPre ? +(ultimaEntrada.peso - pesoPre).toFixed(1) : null;

  const statusGanho = useMemo(() => {
    if (ganhoTotal == null || !semanaAtual) return null;
    const ponto = faixa.find(f => f.semana === Math.min(ultimaEntrada!.semana, 42));
    if (!ponto) return null;
    if (ganhoTotal < ponto.min) return 'abaixo';
    if (ganhoTotal > ponto.max) return 'acima';
    return 'ideal';
  }, [ganhoTotal, faixa, semanaAtual, ultimaEntrada]);

  const statusConfig = {
    ideal: { label: 'Dentro da faixa ideal ✓', className: 'bg-green-50 text-green-700 border-green-200' },
    abaixo: { label: 'Abaixo da faixa ideal ↓', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    acima: { label: 'Acima da faixa ideal ↑', className: 'bg-red-50 text-red-700 border-red-200' },
  };

  return (
    <div className="dashboard-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-[var(--card-border-color)] flex items-center justify-center">
            <ArrowLeft size={18} className="text-muted-foreground" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Curva de Peso</h1>
            <p className="text-xs text-muted-foreground">Acompanhamento baseado nas diretrizes do MS</p>
          </div>
        </div>

        <div className="bg-card rounded-[20px] border border-[var(--card-border-color)] p-4 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Dados iniciais</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Peso pré-gestacional (kg)</label>
              <Input type="number" placeholder="ex: 62,5" value={pesoPreInput} onChange={e => handlePesoPreChange(e.target.value)} className="rounded-xl text-sm h-10" step="0.1" min="30" max="200" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Altura (cm)</label>
              <Input type="number" placeholder="ex: 165" value={alturaInput} onChange={e => handleAlturaChange(e.target.value)} className="rounded-xl text-sm h-10" step="1" min="130" max="220" />
            </div>
          </div>
          {imc && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${cat.bgClass} border border-current/10`}>
              <Scale size={14} className="flex-shrink-0" />
              <span><strong>IMC: {imc}</strong> — {cat.label} · Ganho recomendado: <strong>{cat.totalMin}–{cat.totalMax} kg</strong></span>
            </div>
          )}
        </div>

        {imc && (
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="bg-card rounded-[16px] border border-[var(--card-border-color)] p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Semana</p>
              <p className="font-display text-2xl font-bold text-foreground leading-none">{semanaAtual ?? '—'}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">de 40</p>
            </div>
            <div className="bg-card rounded-[16px] border border-[var(--card-border-color)] p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Ganho</p>
              <p className={`font-display text-2xl font-bold leading-none ${
                statusGanho === 'ideal' ? 'text-green-600' : statusGanho === 'abaixo' ? 'text-amber-600' : statusGanho === 'acima' ? 'text-red-500' : 'text-foreground'
              }`}>
                {ganhoTotal != null ? `${ganhoTotal > 0 ? '+' : ''}${ganhoTotal}` : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{ganhoTotal != null ? 'kg total' : 'sem dados'}</p>
            </div>
            <div className="bg-card rounded-[16px] border border-[var(--card-border-color)] p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Meta</p>
              <p className="font-display text-base font-bold text-foreground leading-tight">{cat.totalMin}–{cat.totalMax}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">kg</p>
            </div>
          </div>
        )}

        {statusGanho && (
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border mb-4 ${statusConfig[statusGanho].className}`}>
            <TrendingUp size={14} className="flex-shrink-0" />
            <span className="font-medium">{statusConfig[statusGanho].label}</span>
            <span className="text-xs opacity-70 ml-1">— semana {ultimaEntrada?.semana}</span>
          </div>
        )}

        <div className="bg-card rounded-[20px] border border-[var(--card-border-color)] p-4 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-display text-base font-semibold text-foreground">Traçado de ganho de peso</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{imc ? `${cat.label} · faixa IOM/MS` : 'Configure os dados iniciais'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomMode(!zoomMode)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${zoomMode ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                title={zoomMode ? 'Ver curva completa' : 'Zoom no período atual'}
              >
                {zoomMode ? <ZoomOut size={14} /> : <ZoomIn size={14} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded" style={{ background: 'hsl(var(--primary))' }} />
              <span className="text-[10px] text-muted-foreground">Seu peso</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded-sm opacity-30" style={{ background: 'hsl(var(--primary))' }} />
              <span className="text-[10px] text-muted-foreground">Faixa ideal</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={zoomMode ? 280 : 240}>
            <AreaChart data={zoomedChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="faixaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="ganhoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="semana" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}s`} interval={zoomMode ? 1 : 4} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => `${v > 0 ? '+' : ''}${v}`} />
              <Tooltip content={<CustomTooltip />} />
              {semanaAtual && (
                <ReferenceLine x={semanaAtual} stroke="hsl(var(--primary))" strokeDasharray="4 3" strokeOpacity={0.5} label={{ value: 'hoje', position: 'top', fontSize: 9, fill: 'hsl(var(--primary))' }} />
              )}
              <Area type="monotone" dataKey="max" stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.4} fill="url(#faixaGrad)" dot={false} activeDot={false} />
              <Area type="monotone" dataKey="min" stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.4} fill="hsl(var(--background))" dot={false} activeDot={false} />
              <Area type="monotone" dataKey="ganho" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#ganhoGrad)"
                dot={(props: any) => {
                  if (!props.payload?.hasEntry) return <g key={props.key} />;
                  return <circle key={props.key} cx={props.cx} cy={props.cy} r={zoomMode ? 5 : 4} fill="hsl(var(--primary))" stroke="white" strokeWidth={2} />;
                }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'white', strokeWidth: 2 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          {zoomMode && semanaAtual && (
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              Mostrando semanas {Math.max(4, semanaAtual - 6)} a {Math.min(42, semanaAtual + 6)}
            </p>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full rounded-2xl h-12 gap-2 mb-4 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={18} /> Registrar peso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-semibold">Registrar peso</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Semana gestacional{semanaAtual && <span className="text-primary ml-1">(atual: semana {semanaAtual})</span>}
                </label>
                <Input type="number" placeholder="ex: 20" value={formSemana} onChange={e => setFormSemana(e.target.value)} className="rounded-xl" min="4" max="42" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Peso atual (kg)</label>
                <Input type="number" placeholder="ex: 65,0" value={formPeso} onChange={e => setFormPeso(e.target.value)} className="rounded-xl" step="0.1" min="30" max="200" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Observação (opcional)</label>
                <Input placeholder="ex: Consulta pré-natal" value={formObs} onChange={e => setFormObs(e.target.value)} className="rounded-xl" />
              </div>
              {formPeso && pesoPre && formSemana && (
                <PreviewStatus pesoPre={pesoPre} pesoAtual={parseFloat(formPeso)} semana={parseInt(formSemana)} faixa={faixa} />
              )}
              <Button onClick={() => addPeso.mutate()} disabled={addPeso.isPending || !formSemana || !formPeso} className="w-full rounded-xl bg-primary text-primary-foreground h-11">
                {addPeso.isPending ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {entradas.length > 0 && (
          <div className="bg-card rounded-[20px] border border-[var(--card-border-color)] overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-[var(--card-border-color)]">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Registros</p>
            </div>
            <div>
              {[...entradas].reverse().map(entrada => {
                const ganho = pesoPre ? +(entrada.peso - pesoPre).toFixed(1) : null;
                const ponto = faixa.find(f => f.semana === entrada.semana);
                const status = ganho != null && ponto ? ganho < ponto.min ? 'abaixo' : ganho > ponto.max ? 'acima' : 'ideal' : null;
                const statusDot = { ideal: 'bg-green-400', abaixo: 'bg-amber-400', acima: 'bg-red-400' };
                return (
                  <div key={entrada.id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--card-border-color)] last:border-0">
                    <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-primary">{entrada.semana}s</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{entrada.peso} kg</p>
                        {ganho != null && <span className="text-xs text-muted-foreground">({ganho > 0 ? '+' : ''}{ganho} kg)</span>}
                        {status && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[status]}`} />}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(entrada.data + 'T00:00:00'), "dd MMM yyyy", { locale: ptBR })}
                        {entrada.observacao && ` · ${entrada.observacao}`}
                      </p>
                    </div>
                    <button
                      onClick={() => { if (deleteId === entrada.id) { deletePeso.mutate(entrada.id); } else { setDeleteId(entrada.id); setTimeout(() => setDeleteId(null), 3000); } }}
                      className={`p-1.5 rounded-lg transition-colors ${deleteId === entrada.id ? 'bg-red-100 text-red-500' : 'text-muted-foreground hover:text-red-400 hover:bg-red-50'}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <ReferenceTable catAtiva={catKey} />
      </div>
      <BottomNav />
    </div>
  );
}

function PreviewStatus({ pesoPre, pesoAtual, semana, faixa }: { pesoPre: number; pesoAtual: number; semana: number; faixa: { semana: number; min: number; max: number }[] }) {
  const ganho = +(pesoAtual - pesoPre).toFixed(1);
  const ponto = faixa.find(f => f.semana === semana);
  if (!ponto) return null;
  const status = ganho < ponto.min ? 'abaixo' : ganho > ponto.max ? 'acima' : 'ideal';
  const cfg = {
    ideal: { label: 'Dentro da faixa ideal ✓', className: 'bg-green-50 text-green-700 border-green-200' },
    abaixo: { label: `Abaixo da faixa ideal (mín. +${ponto.min} kg)`, className: 'bg-amber-50 text-amber-700 border-amber-200' },
    acima: { label: `Acima da faixa ideal (máx. +${ponto.max} kg)`, className: 'bg-red-50 text-red-700 border-red-200' },
  };
  return (
    <div className={`flex items-start gap-2 px-3 py-2 rounded-xl text-xs border ${cfg[status].className}`}>
      <Info size={12} className="flex-shrink-0 mt-0.5" />
      <span>Ganho de <strong>{ganho > 0 ? '+' : ''}{ganho} kg</strong> · {cfg[status].label}</span>
    </div>
  );
}

function ReferenceTable({ catAtiva }: { catAtiva: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card rounded-[20px] border border-[var(--card-border-color)] overflow-hidden mb-4">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tabela de referência IOM / MS</span>
        <span className="text-muted-foreground text-sm">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[var(--card-border-color)]">
          <div className="pt-3 space-y-2">
            {Object.values(CATEGORIAS).map(c => (
              <div key={c.key} className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm ${c.key === catAtiva ? `${c.bgClass} border border-current/20` : 'bg-muted/30'}`}>
                <div>
                  <p className="font-medium text-xs">{c.label}</p>
                  <p className="text-[10px] opacity-70">IMC {c.imcRange}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-xs">{c.totalMin}–{c.totalMax} kg</p>
                  <p className="text-[10px] opacity-70">total recomendado</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 text-center">Fonte: Institute of Medicine (IOM) 2009, adotado pelo Ministério da Saúde. Gestação única a termo.</p>
        </div>
      )}
    </div>
  );
}
