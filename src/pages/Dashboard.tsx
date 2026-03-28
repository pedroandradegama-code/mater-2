import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { calculatePregnancyInfo, getWeekData, getGreeting, parseLocalDate } from '@/lib/pregnancy-data';
import { Bell, ChevronRight, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BottomNav from '@/components/BottomNav';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import EnqueteSemanal from '@/components/dashboard/EnqueteSemanal';
import { BabyViewer3D } from '@/components/dashboard/BabyViewer3D';
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
  MusicaIcon,
  EstetoscopioIcon,
  CalendarioVazioIcon,
  BalancaIcon,
  ReguaIcon,
} from '@/components/dashboard/DashboardIcons';
import { useEffect, useState } from 'react';

function GestacaoIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="10" cy="11" rx="5" ry="6" fill="currentColor" fillOpacity={0.08} />
      <path d="M10 2c0 0 1.5 1 1.5 3" /><path d="M8.5 5c0 0-1 .5-1.5 1.5" />
    </svg>
  );
}
function EventosIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="13" rx="2.5" /><path d="M3 8h14" /><path d="M7 2v3M13 2v3" /><path d="M7 12h2M11 12h2" />
    </svg>
  );
}
function CurvaPesoIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 15l4-4 3 3 4-5 3 2" /><path d="M3 3v14h14" />
    </svg>
  );
}

// Custom icons for sections
function AcompanhamentoSectionIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 4 5-8" />
      <circle cx="7" cy="16" r="1.5" fill="currentColor" fillOpacity={0.3} />
      <circle cx="11" cy="10" r="1.5" fill="currentColor" fillOpacity={0.3} />
      <circle cx="15" cy="14" r="1.5" fill="currentColor" fillOpacity={0.3} />
      <circle cx="20" cy="6" r="1.5" fill="currentColor" fillOpacity={0.3} />
    </svg>
  );
}
function MeuEspacoSectionIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8 2.4-7.2-6-4.8h7.6z" fill="currentColor" fillOpacity={0.1} />
      <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity={0.15} />
    </svg>
  );
}
function ComunidadeSectionIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="4" fill="currentColor" fillOpacity={0.1} />
      <circle cx="16" cy="9" r="4" fill="currentColor" fillOpacity={0.1} />
      <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
      <path d="M15 15c3 0 6 2 6 5" />
    </svg>
  );
}

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
      if (current >= steps) { setCount(target); clearInterval(timer); }
    }, interval);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count}</>;
}

interface QuickLink {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  paid?: boolean;
}
interface ToolGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: QuickLink[];
}

function ExamesIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="12" height="16" rx="2" /><path d="M8 6h4M8 10h4M8 14h2" />
    </svg>
  );
}
function JornadaIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v16" /><circle cx="10" cy="5" r="2" /><circle cx="10" cy="11" r="2" /><circle cx="10" cy="17" r="1.5" />
      <path d="M5 5h3M12 5h3M5 11h3M12 11h3" />
    </svg>
  );
}
function PassaporteIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="14" height="16" rx="3" /><circle cx="10" cy="9" r="3" /><path d="M6 15h8" />
    </svg>
  );
}

const toolGroups: ToolGroup[] = [
  {
    label: 'Acompanhamento',
    icon: AcompanhamentoSectionIcon,
    items: [
      { icon: CalculadoraIcon, label: 'Calculadoras', path: '/calculadoras' },
      { icon: GestacaoIcon,    label: 'Gestação semana a semana', path: '/gestacao' },
      { icon: CurvaPesoIcon,   label: 'Curva de Peso', path: '/curva-peso' },
      { icon: JornadaIcon,     label: 'Jornada de Saúde', path: '/jornada-saude' },
      { icon: FAQIcon,         label: 'FAQ médico', path: '/faq' },
    ],
  },
  {
    label: 'Meu Espaço',
    icon: MeuEspacoSectionIcon,
    items: [
      { icon: DiarioIcon,      label: 'Diário emocional',    path: '/diario',      paid: true },
      { icon: AgendaIcon,      label: 'Agenda & consultas',  path: '/agenda',      paid: true },
      { icon: ExamesIcon,      label: 'Meus Exames',         path: '/meus-exames', paid: true },
      { icon: EventosIcon,     label: 'Eventos & Convites',  path: '/eventos',     paid: true },
      { icon: MusicaIcon,      label: 'Playlists por Mood',  path: '/playlists' },
      { icon: PlanoPartoIcon,  label: 'Plano de Parto',      path: '/plano-parto', paid: true },
      { icon: MalaIcon,        label: 'Mala da Maternidade', path: '/mala',        paid: true },
      { icon: NomesIcon,       label: 'Nomes do Bebê',       path: '/nomes',       paid: true },
      { icon: PassaporteIcon,  label: 'Passaporte da Mamãe', path: '/passaporte',  paid: true },
    ],
  },
  {
    label: 'Comunidade',
    icon: ComunidadeSectionIcon,
    items: [
      { icon: EnqueteIcon, label: 'Enquetes semanais', path: '#enquetes' },
    ],
  },
];

export default function Dashboard() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPaid = profile?.plano === 'premium' || profile?.plano === 'pago';

  const { data: nextConsulta } = useQuery({
    queryKey: ['next-consulta', user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('consultas').select('*').eq('user_id', user!.id)
        .gte('data', new Date().toISOString()).order('data', { ascending: true }).limit(1);
      return data?.[0] || null;
    },
    enabled: !!user,
  });

  // Use effective date (DUM or USG based on user preference)
  const { getEffectiveDate } = useProfile();
  const effectiveDate = getEffectiveDate();
  const hasDum = !!effectiveDate;
  const dum = hasDum ? parseLocalDate(effectiveDate!) : undefined;
  const info = dum ? calculatePregnancyInfo(dum) : null;
  const weekData = info ? getWeekData(Math.min(info.weeks, 40)) : null;
  const weeksDisplay = info ? Math.min(info.weeks, 40) : 0;

  const formatConsultaTime = (data: string) => {
    const d = new Date(data);
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    if (hasTime) return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    return format(d, 'dd/MM/yyyy', { locale: ptBR });
  };

  // Avatar
  const avatarUrl = profile?.avatar_url
    ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl
    : null;
  const initials = profile?.nome ? profile.nome.charAt(0).toUpperCase() : '?';

  const handleToolClick = (link: QuickLink) => {
    if (link.path === '#enquetes') {
      document.getElementById('enquetes-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (link.paid && !isPaid) { navigate('/perfil'); return; }
    navigate(link.path);
  };

  return (
    <div className="dashboard-bg min-h-screen pb-28">
      <div className="app-container px-5 pt-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <div>
            <p className="text-sm text-muted-foreground font-body">{getGreeting()} 👋</p>
            {info ? (
              <h1 className="font-display text-xl font-bold text-foreground">Semana {weeksDisplay} · {info.trimester}º tri</h1>
            ) : (
              <h1 className="font-display text-xl font-bold text-foreground">Olá, {profile?.nome || 'Mamãe'}</h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/perfil')} className="w-9 h-9 rounded-full overflow-hidden bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </button>
            <button className="w-9 h-9 rounded-full bg-card border border-[var(--card-border-color)] flex items-center justify-center">
              <Bell size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* HERO CARD */}
        {info ? (
          <div className="rounded-[28px] p-6 mb-4 animate-fade-up" style={{ background: `radial-gradient(ellipse at top left, hsl(var(--primary-light)) 0%, hsl(var(--background)) 50%, hsl(var(--secondary)) 100%)`, border: `1px solid var(--card-border-color)`, boxShadow: `0 8px 32px hsl(var(--primary) / 0.10)` }}>
            <div className="flex items-start">
              <div className="flex-1">
                <div className="flex items-start gap-1 mb-1">
                  <span className="font-display text-7xl font-extrabold text-primary leading-none"><AnimatedWeekNumber target={weeksDisplay} /></span>
                  <span className="font-display text-xl font-medium text-primary/70 mt-1">sem</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3"><span className="font-bold">{info.days} dias</span> · {info.trimester}º trimestre</p>
                <div className="mb-3">
                  <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${info.progress}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{Math.round(info.progress)}% concluída</p>
                  <p className="text-[9px] text-muted-foreground/40 mt-1">
                    Modelo 3D: <a href="https://sketchfab.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-1">Sketchfab</a> · CC BY 4.0
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="12" height="11" rx="2" /><path d="M2 7h12" /><path d="M5 1v3" /><path d="M11 1v3" /></svg>
                    <span>DPP · {format(info.dpp, 'dd MMM yyyy', { locale: ptBR })}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 ml-5.5">(Data Provável do Parto)</p>
                </div>
              </div>
              <div className="ml-2" style={{ filter: 'drop-shadow(0 4px 16px hsl(var(--primary) / 0.25))' }}>
                <BabyViewer3D
                  week={weeksDisplay}
                  sex={profile?.sexo_bebe as 'menina' | 'menino' | 'surpresa' | null}
                  className="w-[110px] h-[110px]"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-[28px] p-6 mb-4 border border-[var(--card-border-color)] animate-fade-up text-center">
            <p className="text-muted-foreground text-sm mb-2">DUM não informada</p>
            <button onClick={() => navigate('/perfil')} className="text-primary text-sm font-medium hover:underline">Adicionar no perfil →</button>
          </div>
        )}

        {/* COMPARATIVO FETAL */}
        {weekData && info && (
          <div className="bg-card rounded-[20px] p-4 mb-4 border border-[var(--card-border-color)] animate-fade-up">
            <div className="grid grid-cols-3 gap-0">
              <div className="text-center border-r border-[var(--card-border-color)] pr-3">
                <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-primary-light flex items-center justify-center"><SvgFruit fruit={weekData.fruit} /></div>
                <p className="text-[10px] text-muted-foreground">Tamanho de</p>
                <p className="font-display text-sm font-bold text-foreground">{weekData.fruit}</p>
              </div>
              <div className="text-center border-r border-[var(--card-border-color)] px-3">
                <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-primary-light flex items-center justify-center"><BalancaIcon className="w-5 h-5 text-primary" /></div>
                <p className="text-[10px] text-muted-foreground">Peso</p>
                <p className="font-display text-lg font-bold text-foreground">{weekData.weight}</p>
              </div>
              <div className="text-center pl-3">
                <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-primary-light flex items-center justify-center"><ReguaIcon className="w-5 h-5 text-primary" /></div>
                <p className="text-[10px] text-muted-foreground">Tamanho</p>
                <p className="font-display text-lg font-bold text-foreground">{weekData.size}</p>
              </div>
            </div>
          </div>
        )}

        {/* FEATURE EXCLUSIVA — dois blocos: Música e Eventos */}
        <div className="grid grid-cols-2 gap-3 mb-5 animate-fade-up">
          {/* Música */}
          <div className="rounded-[20px] p-4 relative overflow-hidden" style={{ background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-mid)) 100%)`, boxShadow: `0 6px 20px hsl(var(--primary) / 0.3)` }}>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none" aria-hidden>
              <svg width="60" height="40" viewBox="0 0 60 40" fill="white"><path d="M0 20Q15 5 30 20Q45 35 60 20L60 40L0 40Z" /></svg>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2">
              <MusicaIcon className="w-5 h-5 text-white" />
            </div>
            <p className="text-white/80 text-[10px] font-medium mb-0.5">Feature exclusiva ✨</p>
            <h3 className="font-display text-white text-sm font-bold leading-snug mb-2">
              Música do Bebê
            </h3>
            <button onClick={() => navigate('/musica-bebe')}
              className="w-full py-2 rounded-full bg-white text-primary font-semibold text-xs active:scale-[0.97]">
              {isPaid ? '🎵 Criar' : '🔒 Ver'}
            </button>
          </div>

          {/* Eventos */}
          <div className="rounded-[20px] p-4 relative overflow-hidden" style={{ background: `linear-gradient(135deg, hsl(var(--primary-mid)) 0%, hsl(var(--primary)) 100%)`, boxShadow: `0 6px 20px hsl(var(--primary) / 0.3)` }}>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none" aria-hidden>
              <svg width="60" height="40" viewBox="0 0 60 40" fill="white"><path d="M0 20Q15 5 30 20Q45 35 60 20L60 40L0 40Z" /></svg>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2">
              <EventosIcon className="w-5 h-5 text-white" />
            </div>
            <p className="text-white/80 text-[10px] font-medium mb-0.5">Feature exclusiva ✨</p>
            <h3 className="font-display text-white text-sm font-bold leading-snug mb-2">
              Eventos & Convites
            </h3>
            <button onClick={() => navigate('/eventos')}
              className="w-full py-2 rounded-full bg-white text-primary font-semibold text-xs active:scale-[0.97]">
              {isPaid ? '🎉 Criar' : '🔒 Ver'}
            </button>
          </div>
        </div>

        {/* GRUPOS DE FERRAMENTAS */}
        {toolGroups.map((group) => {
          const SectionIcon = group.icon;
          return (
            <div key={group.label} className="mb-6 animate-fade-up">
              <div className="flex items-center gap-2.5 mb-3">
                <SectionIcon className="w-5 h-5 text-primary" />
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{group.label}</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {group.items.map((link) => {
                  const Icon = link.icon;
                  const locked = link.paid && !isPaid;
                  return (
                    <button
                      key={link.path}
                      onClick={() => handleToolClick(link)}
                      className="card-press flex items-center gap-3 bg-card rounded-2xl border border-[var(--card-border-color)] px-3.5 py-3.5 h-[4.5rem] relative"
                    >
                      <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ${locked ? 'bg-muted' : 'bg-primary-light'}`}>
                        <Icon className={`w-5 h-5 ${locked ? 'text-muted-foreground' : 'text-primary'}`} />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground flex-1 text-left leading-tight">{link.label}</span>
                      <div className="flex-shrink-0 w-5 flex items-center justify-center">
                        {locked ? <Lock size={13} className="text-muted-foreground/50" /> : <ChevronRight size={16} className="text-muted-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {group.label === 'Meu Espaço' && !isPaid && (
                <button
                  onClick={() => navigate('/perfil')}
                  className="mt-2.5 w-full py-2.5 rounded-2xl border border-primary/30 bg-primary/5 text-primary text-xs font-semibold transition-all active:scale-[0.98]"
                >
                  🌟 Desbloquear tudo por R$19 vitalício →
                </button>
              )}
            </div>
          );
        })}

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
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center"><EstetoscopioIcon className="w-5 h-5 text-primary" /></div>
              <div className="flex-1">
                <p className="font-display text-base font-semibold text-foreground">{nextConsulta.tipo}</p>
                <p className="text-xs text-muted-foreground">{formatConsultaTime(nextConsulta.data)}{nextConsulta.local && ` · ${nextConsulta.local}`}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <CalendarioVazioIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Nenhuma consulta agendada</p>
              <button onClick={() => navigate('/agenda')} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium card-press">+ Agendar</button>
            </div>
          )}
        </div>

      </div>
      <BottomNav />
    </div>
  );
}

function SvgFruit({ fruit }: { fruit: string }) {
  return (
    <svg className="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2c-3 0-6 3-6 7s3 8 6 9c3-1 6-5 6-9s-3-7-6-7z" fill="currentColor" fillOpacity="0.1" />
      <path d="M10 2v4" /><path d="M7 3c1 1 3 1 4 0" />
    </svg>
  );
}
