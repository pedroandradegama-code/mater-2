import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calculatePregnancyInfo, parseLocalDate } from '@/lib/pregnancy-data';
import { getTimelinePeriodos, EventoRecomendado } from '@/lib/eventos-assistenciais';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';
import { ArrowLeft, Check, AlertTriangle, Calendar, Stethoscope, Syringe, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react';

const tipoIcon = {
  exame: FlaskConical,
  consulta: Stethoscope,
  vacina: Syringe,
};
const tipoColor = {
  exame: 'text-blue-600 bg-blue-50',
  consulta: 'text-primary bg-primary/10',
  vacina: 'text-amber-600 bg-amber-50',
};

export default function JornadaSaude() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const dum = profile?.dum ? parseLocalDate(profile.dum) : undefined;
  const info = dum ? calculatePregnancyInfo(dum) : null;
  const currentWeek = info ? Math.min(info.weeks, 42) : 0;

  const periodos = getTimelinePeriodos();

  const { data: agendados = [] } = useQuery({
    queryKey: ['eventos-assist', user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('eventos_assistenciais_agendados').select('*').eq('user_id', user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const toggleRealizado = useMutation({
    mutationFn: async ({ id, realizado }: { id: string; realizado: boolean }) => {
      await (supabase as any).from('eventos_assistenciais_agendados')
        .update({ realizado }).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['eventos-assist'] }),
  });

  const agendarEvento = useMutation({
    mutationFn: async (ev: EventoRecomendado) => {
      if (!user) return;
      await (supabase as any).from('eventos_assistenciais_agendados').insert({
        user_id: user.id,
        tipo: ev.tipo,
        nome: ev.nome,
        semana_prevista: ev.semanaMin,
      });
    },
    onSuccess: () => {
      toast.success('Adicionado à sua jornada!');
      queryClient.invalidateQueries({ queryKey: ['eventos-assist'] });
    },
  });

  const isAgendado = (nome: string) => agendados.some((a: any) => a.nome === nome);
  const getAgendado = (nome: string) => agendados.find((a: any) => a.nome === nome);

  // Summary counts
  const upcoming = periodos
    .filter(p => p.semanaMax >= currentWeek && p.semanaMin <= currentWeek + 4)
    .flatMap(p => p.eventos);
  const exameCount = upcoming.filter(e => e.tipo === 'exame').length;
  const consultaCount = upcoming.filter(e => e.tipo === 'consulta').length;
  const vacinaCount = upcoming.filter(e => e.tipo === 'vacina').length;

  if (!info) return (
    <div className="dashboard-bg min-h-screen pb-28">
      <div className="app-container px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-[var(--card-border-color)] flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display text-2xl font-semibold">Jornada de Saúde</h1>
        </div>
        <p className="text-muted-foreground text-sm text-center py-12">Informe sua DUM no perfil para ver a timeline.</p>
      </div>
      <BottomNav />
    </div>
  );

  return (
    <div className="dashboard-bg min-h-screen pb-28">
      <div className="app-container px-5 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5 animate-fade-up">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-[var(--card-border-color)] flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display text-2xl font-semibold">Jornada de Saúde</h1>
        </div>

        {/* Summary */}
        <div className="bg-card rounded-2xl border border-[var(--card-border-color)] p-4 mb-6 animate-fade-up">
          <p className="text-sm text-muted-foreground mb-3">
            Você está na <span className="font-bold text-foreground">semana {currentWeek}</span>. Nos próximos 30 dias:
          </p>
          <div className="flex gap-2">
            {exameCount > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{exameCount} exame{exameCount > 1 ? 's' : ''}</span>
            )}
            {consultaCount > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">{consultaCount} consulta{consultaCount > 1 ? 's' : ''}</span>
            )}
            {vacinaCount > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">{vacinaCount} vacina{vacinaCount > 1 ? 's' : ''}</span>
            )}
            {exameCount + consultaCount + vacinaCount === 0 && (
              <span className="text-xs text-muted-foreground">Nenhum evento nos próximos 30 dias 🎉</span>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2" />

          {periodos.map((periodo) => {
            const isPast = currentWeek > periodo.semanaMax;
            const isCurrent = currentWeek >= periodo.semanaMin && currentWeek <= periodo.semanaMax;
            const isExp = expanded[periodo.label] ?? isCurrent;

            return (
              <div key={periodo.label} className="relative mb-6 animate-fade-up">
                <div className="relative flex justify-center mb-3">
                  {isCurrent && (
                    <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary animate-pulse z-10" />
                  )}
                  <button
                    onClick={() => setExpanded(e => ({ ...e, [periodo.label]: !isExp }))}
                    className={`relative z-20 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                      isCurrent ? 'bg-primary text-primary-foreground shadow-lg' :
                      isPast ? 'bg-muted text-muted-foreground' : 'bg-card border border-[var(--card-border-color)] text-muted-foreground'
                    }`}>
                    {periodo.label}
                    {isExp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>

                {isExp && (
                  <div className="grid grid-cols-2 gap-2">
                    {/* Left: MS recommended */}
                    <div className="space-y-2 pr-2">
                      {periodo.eventos.map((ev, ei) => {
                        const agendadoItem = getAgendado(ev.nome);
                        const Icon = tipoIcon[ev.tipo];
                        const color = tipoColor[ev.tipo];
                        const done = agendadoItem?.realizado;

                        return (
                          <div key={ei}
                            className={`rounded-xl p-3 border-2 border-dashed ${
                              done ? 'border-green-300 bg-green-50/50' :
                              isPast && !done ? 'border-amber-300 bg-amber-50/50' :
                              'border-purple-200 bg-purple-50/30'
                            }`}>
                            <div className="flex items-start gap-2">
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${color}`}>
                                {done ? <Check size={12} className="text-green-600" /> :
                                 isPast ? <AlertTriangle size={12} className="text-amber-500" /> :
                                 <Icon size={12} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-foreground leading-tight">{ev.nome}</p>
                                <p className="text-[9px] text-primary/70 font-medium mt-0.5">Recomendado pelo MS</p>
                              </div>
                            </div>
                            {!agendadoItem && (
                              <button onClick={() => agendarEvento.mutate(ev)}
                                className="mt-2 w-full py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold">
                                + Agendar
                              </button>
                            )}
                            {agendadoItem && !done && (
                              <div className="mt-2 space-y-1">
                                <div className="w-full py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold text-center">
                                  ✓ Agendado
                                </div>
                                <button onClick={() => toggleRealizado.mutate({ id: agendadoItem.id, realizado: true })}
                                  className="w-full py-1 rounded-lg bg-green-100 text-green-700 text-[10px] font-semibold">
                                  Já realizei ✓
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: User's scheduled events */}
                    <div className="space-y-2 pl-2">
                      {agendados
                        .filter((a: any) => a.semana_prevista >= periodo.semanaMin && a.semana_prevista <= periodo.semanaMax)
                        .map((a: any) => {
                          const Icon = tipoIcon[a.tipo as keyof typeof tipoIcon] || Calendar;
                          return (
                            <div key={a.id}
                              className={`rounded-xl p-3 border bg-card ${
                                a.realizado ? 'border-green-300' : 'border-[var(--card-border-color)]'
                              }`}>
                              <div className="flex items-start gap-2">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                                  a.realizado ? 'bg-green-100' : 'bg-primary-light'
                                }`}>
                                  {a.realizado ? <Check size={12} className="text-green-600" /> : <Icon size={12} className="text-primary" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-semibold text-foreground leading-tight">{a.nome}</p>
                                  {a.data_agendada && <p className="text-[10px] text-muted-foreground">{a.data_agendada}</p>}
                                </div>
                              </div>
                              {!a.realizado && (
                                <button onClick={() => toggleRealizado.mutate({ id: a.id, realizado: true })}
                                  className="mt-2 w-full py-1 rounded-lg bg-green-100 text-green-700 text-[10px] font-semibold">
                                  Já realizei ✓
                                </button>
                              )}
                            </div>
                          );
                        })}
                      {agendados.filter((a: any) => a.semana_prevista >= periodo.semanaMin && a.semana_prevista <= periodo.semanaMax).length === 0 && (
                        <div className="rounded-xl p-3 border border-dashed border-muted text-center">
                          <p className="text-[10px] text-muted-foreground">Seus agendamentos aparecerão aqui</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
