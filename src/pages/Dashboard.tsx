import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { calculatePregnancyInfo, getWeekData, getGreeting, parseLocalDate } from '@/lib/pregnancy-data';
import { Bell, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BottomNav from '@/components/BottomNav';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import EnqueteSemanal from '@/components/dashboard/EnqueteSemanal';
import {
  FetusIllustration,
  CalculadoraIcon,
  AgendaIcon,
  DiarioIcon,
  FAQIcon,
  MalaIcon,
  NomesIcon,
  PlanoPartoIcon,
  EnqueteIcon,
  EstetoscopioIcon,
  CalendarioVazioIcon,
  BalancaIcon,
  ReguaIcon,
} from '@/components/dashboard/DashboardIcons';
import { useEffect, useState } from 'react';

function AnimatedWeekNumber({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target <= 0) return;
    const duration = 600;
    const steps = Math.min(target, 30);
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current++;
      setCount(Math.round((current / steps) * target));
      if (current >= steps) {
        setCount(target);
        clearInterval(timer);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count}</>;
}

export default function Dashboard() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: nextConsulta } = useQuery({
    queryKey: ['next-consulta', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('consultas')
        .select('*')
        .eq('user_id', user!.id)
        .gte('data', new Date().toISOString())
        .order('data', { ascending: true })
        .limit(1);
      return data?.[0] || null;
    },
    enabled: !!user,
  });

  const hasDum = !!profile?.dum;
  const dum = hasDum ? parseLocalDate(profile.dum!) : undefined;
  const info = dum ? calculatePregnancyInfo(dum) : null;
  const weekData = info ? getWeekData(Math.min(info.weeks, 40)) : null;
  const weeksDisplay = info ? Math.min(info.weeks, 40) : 0;

  const quickLinks = [
    { icon: CalculadoraIcon, label: 'Calculadoras', path: '/calculadoras' },
    { icon: AgendaIcon, label: 'Agenda', path: '/agenda' },
    { icon: DiarioIcon, label: 'Diário', path: '/diario' },
    { icon: FAQIcon, label: 'FAQ', path: '/faq' },
    { icon: MalaIcon, label: 'Mala da Maternidade', path: '/mala' },
    { icon: NomesIcon, label: 'Nomes do Bebê', path: '/nomes' },
    { icon: PlanoPartoIcon, label: 'Plano de Parto', path: '/plano-parto' },
    { icon: MusicaIcon, label: 'Música do Bebê', path: '/musica-bebe' },
    { icon: EnqueteIcon, label: 'Enquetes', path: '#enquetes' },
  ];

  const formatConsultaTime = (data: string) => {
    const d = new Date(data);
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    if (hasTime) return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    return format(d, "dd/MM/yyyy", { locale: ptBR });
  };

  const initials = profile?.nome ? profile.nome.charAt(0).toUpperCase() : '?';

  return (
    <div className="dashboard-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <div>
            <p className="text-sm text-muted-foreground font-body">{getGreeting()} 👋</p>
            {info ? (
              <h1 className="font-display text-xl font-bold text-foreground">
                Semana {weeksDisplay} · {info.trimester}º tri
              </h1>
            ) : (
              <h1 className="font-display text-xl font-bold text-foreground">
                Olá, {profile?.nome || 'Mamãe'}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/perfil')} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
              {initials}
            </button>
            <button className="w-9 h-9 rounded-full bg-card border border-[var(--card-border-color)] flex items-center justify-center">
              <Bell size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* HERO CARD */}
        {info ? (
          <div
            className="rounded-[28px] p-6 mb-4 animate-fade-up"
            style={{
              background: 'radial-gradient(ellipse at top left, hsl(340 100% 94%) 0%, hsl(270 60% 97%) 50%, hsl(340 80% 96%) 100%)',
              border: '1px solid rgba(194, 24, 91, 0.12)',
              boxShadow: '0 8px 32px rgba(194, 24, 91, 0.10)',
            }}
          >
            <div className="flex items-start">
              {/* Left side */}
              <div className="flex-1">
                <div className="flex items-start gap-1 mb-1">
                  <span className="font-display text-7xl font-extrabold text-primary leading-none">
                    <AnimatedWeekNumber target={weeksDisplay} />
                  </span>
                  <span className="font-display text-xl font-medium text-primary/70 mt-1">sem</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {info.days} dias · {info.trimester}º trimestre
                </p>
                {/* Progress */}
                <div className="mb-3">
                  <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${info.progress}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{Math.round(info.progress)}% concluída</p>
                </div>
                {/* DPP */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="12" height="11" rx="2" /><path d="M2 7h12" /><path d="M5 1v3" /><path d="M11 1v3" /></svg>
                  <span>DPP · {format(info.dpp, "dd MMM yyyy", { locale: ptBR })}</span>
                </div>
              </div>
              {/* Right side — Fetus illustration */}
              <div className="animate-float ml-2">
                <FetusIllustration />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-[28px] p-6 mb-4 border border-[var(--card-border-color)] animate-fade-up text-center">
            <p className="text-muted-foreground text-sm mb-2">DUM não informada</p>
            <button onClick={() => navigate('/perfil')} className="text-primary text-sm font-medium hover:underline">
              Adicionar no perfil →
            </button>
          </div>
        )}

        {/* COMPARATIVO FETAL */}
        {weekData && info && (
          <div className="bg-card rounded-[20px] p-4 mb-4 border border-[var(--card-border-color)] animate-fade-up">
            <div className="grid grid-cols-3 gap-0">
              {/* Fruit */}
              <div className="text-center border-r border-[var(--card-border-color)] pr-3">
                <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-primary-light flex items-center justify-center">
                  <SvgFruit fruit={weekData.fruit} />
                </div>
                <p className="text-[10px] text-muted-foreground">Tamanho de</p>
                <p className="font-display text-sm font-bold text-foreground">{weekData.fruit}</p>
              </div>
              {/* Weight */}
              <div className="text-center border-r border-[var(--card-border-color)] px-3">
                <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-primary-light flex items-center justify-center">
                  <BalancaIcon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-[10px] text-muted-foreground">Peso</p>
                <p className="font-display text-lg font-bold text-foreground">{weekData.weight}</p>
              </div>
              {/* Size */}
              <div className="text-center pl-3">
                <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-primary-light flex items-center justify-center">
                  <ReguaIcon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-[10px] text-muted-foreground">Tamanho</p>
                <p className="font-display text-lg font-bold text-foreground">{weekData.size}</p>
              </div>
            </div>
          </div>
        )}

        {/* FERRAMENTAS — Quick links */}
        <div className="mb-4 animate-fade-up">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Ferramentas</p>
          <div className="grid grid-cols-2 gap-2.5">
            {quickLinks.map(link => {
              const Icon = link.icon;
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    if (link.path === '#enquetes') {
                      document.getElementById('enquetes-section')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigate(link.path);
                    }
                  }}
                  className="card-press flex items-center gap-3 bg-card rounded-2xl border border-[var(--card-border-color)] px-3.5 py-3 h-16"
                >
                  <div className="w-10 h-10 rounded-[10px] bg-primary-light flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1 text-left">{link.label}</span>
                  <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* ENQUETES */}
        {info && weeksDisplay >= 4 && (
          <div id="enquetes-section" className="mb-4 animate-fade-up">
            <EnqueteSemanal semana={weeksDisplay} />
          </div>
        )}

        {/* PRÓXIMA CONSULTA */}
        <div className="bg-card rounded-[20px] p-5 border border-[var(--card-border-color)] animate-fade-up mb-4">
          <h3 className="font-display text-lg font-semibold mb-3 text-foreground">Próxima consulta</h3>
          {nextConsulta ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                <EstetoscopioIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-display text-base font-semibold text-foreground">{nextConsulta.tipo}</p>
                <p className="text-xs text-muted-foreground">
                  {formatConsultaTime(nextConsulta.data)}
                  {nextConsulta.local && ` · ${nextConsulta.local}`}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <CalendarioVazioIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Nenhuma consulta agendada</p>
              <button
                onClick={() => navigate('/agenda')}
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium card-press"
              >
                + Agendar
              </button>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

// Simple SVG fruit placeholder — provides a generic leaf/fruit shape
function SvgFruit({ fruit }: { fruit: string }) {
  return (
    <svg className="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2c-3 0-6 3-6 7s3 8 6 9c3-1 6-5 6-9s-3-7-6-7z" fill="currentColor" fillOpacity="0.1" />
      <path d="M10 2v4" />
      <path d="M7 3c1 1 3 1 4 0" />
    </svg>
  );
}
