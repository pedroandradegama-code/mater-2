import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { calculatePregnancyInfo, weeklyData, weekEmojis, parseLocalDate } from '@/lib/pregnancy-data';
import BottomNav from '@/components/BottomNav';
import { Check } from 'lucide-react';

const vaccines = [
  { name: 'Influenza', period: 'Qualquer trimestre', desc: 'Protege contra gripe' },
  { name: 'dTpa', period: '27-36 semanas', desc: 'Difteria, tétano e coqueluche' },
  { name: 'Hepatite B', period: 'Se não vacinada', desc: '3 doses se necessário' },
];

export default function Gestacao() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  if (!profile?.dum) return null;

  const dum = parseLocalDate(profile.dum);
  const info = calculatePregnancyInfo(dum);
  const currentWeek = Math.min(Math.max(info.weeks, 4), 40);

  return (
    <div className="gradient-mesh-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">
        <h1 className="font-display text-3xl font-semibold mb-6">Sua Gestação</h1>

        {/* Timeline */}
        <div className="space-y-3 mb-8">
          {weeklyData.map(w => {
            const isPast = w.week < currentWeek;
            const isCurrent = w.week === currentWeek;
            const emoji = weekEmojis[w.week] || '👶';

            return (
              <div key={w.week} className={`flex items-start gap-3 ${isCurrent ? '' : 'opacity-60'}`}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isPast ? 'bg-primary/20 text-primary' : isCurrent ? 'gradient-hero text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isPast ? <Check size={14} /> : w.week}
                  </div>
                  {w.week < 40 && <div className="w-0.5 h-6 bg-border" />}
                </div>
                <div className={`flex-1 ${isCurrent ? 'glass-card p-4 -mt-1' : 'pt-1'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm font-semibold">Semana {w.week}</span>
                    <span className="text-xs text-muted-foreground">— {w.fruit}</span>
                  </div>
                  {isCurrent && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Peso: {w.weight} • Tamanho: {w.size}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Jornada de Saúde */}
        <button onClick={() => navigate('/jornada-saude')} className="w-full glass-card p-5 mb-6 text-left hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center text-2xl text-primary-foreground">🩺</div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold">Jornada de Saúde</h3>
              <p className="text-xs text-muted-foreground">Timeline de exames, consultas e vacinas recomendadas</p>
            </div>
            <span className="text-muted-foreground">→</span>
          </div>
        </button>

        {/* Plano de Parto */}
        <button onClick={() => navigate('/plano-parto')} className="w-full glass-card p-5 mb-6 text-left hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center text-2xl text-primary-foreground">📋</div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold">Plano de Parto</h3>
              <p className="text-xs text-muted-foreground">Crie seu plano personalizado para compartilhar com o médico</p>
            </div>
            <span className="text-muted-foreground">→</span>
          </div>
        </button>

        {/* Vaccines */}
        <h2 className="font-display text-2xl font-semibold mb-3">Calendário Vacinal</h2>
        <div className="space-y-3 mb-6">
          {vaccines.map(v => (
            <div key={v.name} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.desc}</p>
                </div>
                <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">{v.period}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}