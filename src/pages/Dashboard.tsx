import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { calculatePregnancyInfo, getWeekData, weekEmojis, getGreeting, parseLocalDate } from '@/lib/pregnancy-data';
import { Bell, Calculator, CalendarDays, BookOpen, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BottomNav from '@/components/BottomNav';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  const dum = hasDum ? new Date(profile.dum!) : undefined;
  const info = dum ? calculatePregnancyInfo(dum) : null;
  const weekData = info ? getWeekData(Math.min(info.weeks, 40)) : null;
  const emoji = info ? (weekEmojis[Math.min(Math.max(info.weeks, 4), 40)] || '👶') : '👶';

  const quickLinks = [
    { icon: Calculator, label: 'Calculadoras', path: '/calculadoras', emoji: '🧮' },
    { icon: CalendarDays, label: 'Agenda', path: '/agenda', emoji: '📅' },
    { icon: BookOpen, label: 'Diário', path: '/diario', emoji: '📖' },
    { icon: MessageCircle, label: 'FAQ', path: '/faq', emoji: '💬' },
  ];

  const formatConsultaTime = (data: string) => {
    const d = new Date(data);
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    if (hasTime) {
      return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    }
    return format(d, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="gradient-mesh-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <p className="text-sm text-muted-foreground">{getGreeting()}</p>
            <h1 className="font-display text-2xl font-semibold">{profile?.nome} ✨</h1>
          </div>
          <button className="glass-card p-2.5 rounded-full">
            <Bell size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Hero Card */}
        {info ? (
          <div className="gradient-hero rounded-[28px] p-6 text-primary-foreground mb-4 animate-fade-in relative overflow-hidden">
            <div className="absolute -top-[30px] -right-[30px] w-[120px] h-[120px] rounded-full bg-white/10" />
            <div className="absolute -bottom-[20px] left-[20px] w-[70px] h-[70px] rounded-full bg-white/[0.07]" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-4xl font-display font-bold">
                    {info.weeks}<span className="text-lg font-normal opacity-80">sem</span> {info.days}<span className="text-lg font-normal opacity-80">d</span>
                  </div>
                  <p className="text-sm opacity-80 mt-1">{info.trimester}º trimestre</p>
                </div>
                <div className="text-5xl">{emoji}</div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs opacity-80 mb-1">
                  <span>{Math.round(info.progress)}% concluída</span>
                  <span>{info.daysRemaining} dias restantes</span>
                </div>
                <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-foreground/80 rounded-full transition-all" style={{ width: `${info.progress}%` }} />
                </div>
              </div>
              <div>
                <p className="text-sm opacity-90">
                  DPP: {format(info.dpp, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <p className="text-xs opacity-60">(Data Provável do Parto)</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 mb-4 animate-fade-in text-center">
            <p className="text-muted-foreground text-sm mb-2">DUM não informada</p>
            <button onClick={() => navigate('/perfil')} className="text-primary text-sm font-medium hover:underline">
              Adicionar no perfil →
            </button>
          </div>
        )}

        {/* Week comparison card */}
        {weekData && info && (
          <div className="glass-card p-5 mb-4 animate-fade-in">
            <h3 className="font-display text-lg font-semibold mb-3">Semana {info.weeks} — Comparativo</h3>
            <div className="flex items-center gap-4">
              <div className="text-5xl">{emoji}</div>
              <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Tamanho de</p>
                  <p className="font-semibold text-sm">{weekData.fruit}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Peso</p>
                  <p className="font-semibold text-sm">{weekData.weight}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tamanho</p>
                  <p className="font-semibold text-sm">{weekData.size}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick access grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {quickLinks.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="glass-card p-3 text-center hover:scale-105 transition-transform animate-scale-in"
            >
              <div className="text-2xl mb-1">{link.emoji}</div>
              <div className="text-[10px] font-medium text-muted-foreground">{link.label}</div>
            </button>
          ))}
        </div>

        {/* Next appointment */}
        <div className="glass-card p-5 animate-fade-in">
          <h3 className="font-display text-lg font-semibold mb-3">Próxima consulta</h3>
          {nextConsulta ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-primary-foreground text-lg">
                📅
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{nextConsulta.tipo}</p>
                <p className="text-xs text-muted-foreground">
                  {formatConsultaTime(nextConsulta.data)}
                  {nextConsulta.local && ` • ${nextConsulta.local}`}
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/agenda')}
              className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              + Adicionar consulta
            </button>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
