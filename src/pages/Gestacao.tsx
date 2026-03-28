import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { calculatePregnancyInfo, weeklyData, parseLocalDate } from '@/lib/pregnancy-data';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

// ── Mapeamento semana → imagem ──────────────────────────────────
function getFetalImage(week: number): string {
  if (week <= 7)  return '/fetal/6s.png';
  if (week <= 9)  return '/fetal/8s.png';
  if (week <= 11) return '/fetal/10s.png';
  if (week <= 19) return '/fetal/12s.png';
  return '/fetal/20s.png';
}

// ── Descrição clínica resumida por semana ───────────────────────
function getWeekDescription(week: number): string {
  if (week <= 6)  return 'O embrião tem formato em C, com broto de membros e olho em formação. O coração já bate.';
  if (week <= 8)  return 'Dedos começam a se separar. Ouvidos internos se formam. O embrião se move, mas você ainda não sente.';
  if (week <= 10) return 'Fase fetal: todos os órgãos principais estão formados. Unhas começam a crescer.';
  if (week <= 12) return 'Reflexo de sucção presente. Rim já produz urina. Genitália externa em diferenciação.';
  if (week <= 14) return 'Expressões faciais aparecem. Bebê pode chupar o dedo. Cabelos finos surgem.';
  if (week <= 16) return 'Movimentos coordenados. Sistema nervoso mais ativo. Você pode começar a sentir.';
  if (week <= 20) return 'Vernix caseosa protege a pele. Bebê engole líquido amniótico. Sonambulismo em ciclos.';
  if (week <= 24) return 'Pulmões em maturação. Pálpebras se separam. Bebê responde a sons externos.';
  if (week <= 28) return 'Olhos abertos. Cérebro em desenvolvimento acelerado. Gordura subcutânea aumenta.';
  if (week <= 32) return 'Pulmões quase maduros. Bebê adota posição final. Movimentos mais fortes e perceptíveis.';
  if (week <= 36) return 'Gordura corporal aumentada. Reflexos prontos para o parto. Descida para a pelve.';
  return 'Bebê a termo: pronto para nascer. Todos os sistemas maduros. Aguardando o grande momento!';
}

const vaccines = [
  { name: 'Influenza', period: 'Qualquer trimestre', desc: 'Protege contra gripe' },
  { name: 'dTpa', period: '27–36 semanas', desc: 'Difteria, tétano e coqueluche' },
  { name: 'Hepatite B', period: 'Se não vacinada', desc: '3 doses se necessário' },
];

// ── Trimestres para navegação rápida ───────────────────────────
const TRIMESTRES = [
  { label: '1º Tri', range: [4, 12] },
  { label: '2º Tri', range: [13, 26] },
  { label: '3º Tri', range: [27, 40] },
];

export default function Gestacao() {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const dum = profile?.dum ? parseLocalDate(profile.dum) : null;
  const info = dum ? calculatePregnancyInfo(dum) : null;
  const currentWeek = info ? Math.min(Math.max(info.weeks, 4), 40) : 4;

  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [activeTri, setActiveTri] = useState(currentWeek <= 12 ? 0 : currentWeek <= 26 ? 1 : 2);

  if (!profile?.dum) return null;

  const selectedData = weeklyData.find(w => w.week === selectedWeek);
  const fetalImage = getFetalImage(selectedWeek);
  const description = getWeekDescription(selectedWeek);

  function goWeek(delta: number) {
    const next = Math.min(Math.max(selectedWeek + delta, 4), 40);
    setSelectedWeek(next);
    setActiveTri(next <= 12 ? 0 : next <= 26 ? 1 : 2);
  }

  const isPast = (w: number) => w < currentWeek;
  const isCurrent = (w: number) => w === currentWeek;
  const isSelected = (w: number) => w === selectedWeek;

  return (
    <div className="dashboard-bg min-h-screen pb-28">
      <div className="app-container px-5 pt-6">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <h1 className="font-display text-2xl font-bold text-foreground">Sua Gestação</h1>
        </div>

        {/* CARD PRINCIPAL — imagem + semana selecionada */}
        <div
          className="rounded-[28px] overflow-hidden mb-4 relative bg-card border border-border"
          style={{
            boxShadow: '0 8px 32px hsl(var(--primary) / 0.10)',
          }}
        >
          {/* Navegação semana */}
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <button
              onClick={() => goWeek(-1)}
              disabled={selectedWeek <= 4}
              className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center disabled:opacity-30"
            >
              <ChevronLeft size={16} className="text-muted-foreground" />
            </button>

            <div className="text-center">
              <div className="flex items-baseline gap-1 justify-center">
                <span className="font-display text-5xl font-extrabold text-primary leading-none">{selectedWeek}</span>
                <span className="font-display text-lg text-primary/60">sem</span>
              </div>
              {isCurrent(selectedWeek) && (
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Você está aqui ✨
                </span>
              )}
              {isPast(selectedWeek) && !isCurrent(selectedWeek) && (
                <span className="text-[10px] text-muted-foreground">já passou</span>
              )}
              {selectedWeek > currentWeek && (
                <span className="text-[10px] text-muted-foreground">em breve</span>
              )}
            </div>

            <button
              onClick={() => goWeek(1)}
              disabled={selectedWeek >= 40}
              className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center disabled:opacity-30"
            >
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* IMAGEM FETAL */}
          <div className="flex justify-center px-8 py-2">
            <img
              key={fetalImage}
              src={fetalImage}
              alt={`Desenvolvimento fetal semana ${selectedWeek}`}
              className="w-52 h-52 object-contain animate-fade-up"
              style={{ filter: 'drop-shadow(0 8px 24px hsl(var(--primary) / 0.15))' }}
            />
          </div>

          {/* DADOS da semana */}
          {selectedData && (
            <div className="px-5 pb-5">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-secondary rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Tamanho de</p>
                  <p className="font-display text-sm font-bold text-foreground">{selectedData.fruit}</p>
                </div>
                <div className="bg-secondary rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Peso</p>
                  <p className="font-display text-sm font-bold text-foreground">{selectedData.weight}</p>
                </div>
                <div className="bg-secondary rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Tamanho</p>
                  <p className="font-display text-sm font-bold text-foreground">{selectedData.size}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed text-center px-2">
                {description}
              </p>
            </div>
          )}
        </div>

        {/* FILTRO TRIMESTRES */}
        <div className="flex gap-2 mb-4">
          {TRIMESTRES.map((tri, i) => (
            <button
              key={tri.label}
              onClick={() => {
                setActiveTri(i);
                const target = currentWeek >= tri.range[0] && currentWeek <= tri.range[1]
                  ? currentWeek
                  : tri.range[0];
                setSelectedWeek(target);
              }}
              className={`flex-1 py-2 rounded-2xl text-xs font-semibold transition-all ${
                activeTri === i
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              {tri.label}
            </button>
          ))}
        </div>

        {/* TIMELINE de semanas — filtrada por trimestre */}
        <div className="bg-card rounded-[20px] border border-border p-4 mb-4">
          <div className="grid grid-cols-7 gap-1.5">
            {weeklyData
              .filter(w => w.week >= TRIMESTRES[activeTri].range[0] && w.week <= TRIMESTRES[activeTri].range[1])
              .map(w => (
                <button
                  key={w.week}
                  onClick={() => setSelectedWeek(w.week)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[11px] font-bold transition-all ${
                    isSelected(w.week)
                      ? 'bg-primary text-primary-foreground scale-110 shadow-md'
                      : isPast(w.week)
                      ? 'bg-primary/15 text-primary'
                      : isCurrent(w.week)
                      ? 'bg-primary/20 text-primary ring-2 ring-primary ring-offset-1'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {isPast(w.week) && !isSelected(w.week) ? (
                    <Check size={10} />
                  ) : (
                    w.week
                  )}
                </button>
              ))}
          </div>
        </div>

        {/* ATALHOS */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => navigate('/jornada-saude')}
            className="bg-card rounded-[20px] border border-border p-4 text-left active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl mb-2">🩺</div>
            <p className="font-display text-sm font-semibold text-foreground">Jornada de Saúde</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Exames e consultas</p>
          </button>
          <button
            onClick={() => navigate('/plano-parto')}
            className="bg-card rounded-[20px] border border-border p-4 text-left active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl mb-2">📋</div>
            <p className="font-display text-sm font-semibold text-foreground">Plano de Parto</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Personalizado</p>
          </button>
        </div>

        {/* CALENDÁRIO VACINAL */}
        <div className="bg-card rounded-[20px] border border-border p-4 mb-4">
          <h2 className="font-display text-base font-semibold text-foreground mb-3">💉 Calendário Vacinal</h2>
          <div className="space-y-2">
            {vaccines.map(v => (
              <div key={v.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{v.name}</p>
                  <p className="text-[10px] text-muted-foreground">{v.desc}</p>
                </div>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{v.period}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CRÉDITO das ilustrações */}
        <p className="text-[10px] text-muted-foreground/40 text-center mb-2">
          Ilustrações geradas com IA · uso educacional
        </p>

      </div>
      <BottomNav />
    </div>
  );
}
