import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import UpgradeModal from '@/components/UpgradeModal';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Download, Share2 } from 'lucide-react';

const ESTILOS = [
  { id: 'classico', label: 'Clássico / Instrumental', desc: 'Suave, atemporal, orquestral', emoji: '🎹' },
  { id: 'ninar', label: 'Canção de Ninar', desc: 'Delicada, lenta, aconchegante', emoji: '🌙' },
  { id: 'folk', label: 'Folk / Acústico', desc: 'Acolhedor, com violão e voz', emoji: '🎸' },
  { id: 'pop', label: 'Pop Infantil', desc: 'Alegre, animado, colorido', emoji: '🌟' },
  { id: 'natureza', label: 'Natureza / Ambient', desc: 'Calmo, etéreo, sons da natureza', emoji: '🌿' },
  { id: 'mpb', label: 'MPB / Brasileira', desc: 'Brasileira, afetiva, melodiosa', emoji: '🎺' },
];

const IDIOMAS = [
  { id: 'pt', label: 'Português', flag: '🇧🇷' },
  { id: 'en', label: 'Inglês', flag: '🇺🇸' },
];

const TEMAS = [
  { id: 'fe', label: '🙏 Fé & Deus' },
  { id: 'natureza', label: '🌿 Natureza' },
  { id: 'familia', label: '👨‍👩‍👧 Família' },
  { id: 'infancia', label: '🧸 Infância' },
  { id: 'brincar', label: '🎮 Brincar' },
  { id: 'amor', label: '💛 Amor' },
  { id: 'sonhos', label: '🌟 Sonhos' },
  { id: 'leveza', label: '🌊 Leveza' },
  { id: 'transformacao', label: '🦋 Transformação' },
  { id: 'lar', label: '🏠 Lar & Proteção' },
  { id: 'esperanca', label: '🌈 Esperança' },
  { id: 'aconchego', label: '🤗 Aconchego' },
];

const LOADING_MESSAGES = [
  'Escolhendo as notas certas para o seu bebê...',
  'Tecendo palavras de amor na melodia...',
  'Quase lá — sua música está ganhando vida...',
  'Cada nota pensada com carinho...',
];

export default function MusicaBebe() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isPaid = profile?.plano === 'premium' || profile?.plano === 'pago';

  // Check existing music record
  const { data: musicRecord, isLoading: loadingRecord } = useQuery({
    queryKey: ['musica-bebe', user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('musica_bebe')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1);
      return (data && data.length > 0) ? data[0] : null;
    },
    enabled: !!user,
    refetchInterval: (query) => {
      const d = query.state.data as any;
      if (d && (d.status === 'pending' || d.status === 'generating')) return 5000;
      return false;
    },
  });

  if (loadingRecord) {
    return (
      <div className="dashboard-bg min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!isPaid) {
    return (
      <div className="dashboard-bg min-h-screen pb-24">
        <div className="app-container px-5 pt-6">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-muted-foreground mb-6">
            <ArrowLeft size={20} /> Voltar
          </button>
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎵</div>
            <h1 className="font-display text-2xl font-bold mb-2">Música do Bebê</h1>
            <p className="text-muted-foreground text-sm mb-6">Esta é uma funcionalidade exclusiva do plano completo.</p>
            <Button onClick={() => setShowUpgrade(true)} className="gradient-hero text-primary-foreground rounded-xl">
              Desbloquear Mater Completo
            </Button>
          </div>
        </div>
        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
        <BottomNav />
      </div>
    );
  }

  // Determine view
  if (musicRecord?.status === 'done' && musicRecord.audio_url) {
    return <PlayerView record={musicRecord} />;
  }
  if (musicRecord?.status === 'generating' || musicRecord?.status === 'pending') {
    return <GeneratingView record={musicRecord} />;
  }
  if (musicRecord?.status === 'error') {
    return (
      <div className="dashboard-bg min-h-screen pb-24">
        <div className="app-container px-5 pt-6">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-muted-foreground mb-6">
            <ArrowLeft size={20} /> Voltar
          </button>
          <div className="text-center py-16">
            <div className="text-5xl mb-4">😔</div>
            <h1 className="font-display text-xl font-bold mb-2">Não foi possível gerar sua música</h1>
            <p className="text-muted-foreground text-sm mb-6">Ocorreu um erro. Sua criação não foi consumida — entre em contato com o suporte.</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return <CreationFlow profile={profile} userId={user!.id} onCreated={() => queryClient.invalidateQueries({ queryKey: ['musica-bebe'] })} />;
}

/* ==================== CREATION FLOW ==================== */
function CreationFlow({ profile, userId, onCreated }: { profile: any; userId: string; onCreated: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [estilo, setEstilo] = useState('');
  const [idioma, setIdioma] = useState('');
  const [temas, setTemas] = useState<string[]>([]);
  const [nomeBebe, setNomeBebe] = useState(profile?.nome_bebe || '');
  const [submitting, setSubmitting] = useState(false);
  const totalSteps = 6;

  const toggleTema = (id: string) => {
    if (temas.includes(id)) {
      setTemas(temas.filter(t => t !== id));
    } else if (temas.length < 3) {
      setTemas([...temas, id]);
    } else {
      toast('Máximo de 3 temas atingido 🎵');
    }
  };

  const canAdvance = () => {
    if (step === 2) return !!estilo;
    if (step === 3) return !!idioma;
    if (step === 4) return temas.length > 0;
    if (step === 5) return nomeBebe.trim().length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Insert record
      const { data: record, error: insertError } = await (supabase as any)
        .from('musica_bebe')
        .insert({
          user_id: userId,
          nome_bebe: nomeBebe.trim(),
          estilo,
          idioma,
          temas: temas as any,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Call edge function (fire and forget)
      supabase.functions.invoke('elevenlabs-music-generator', {
        body: { record_id: record.id },
      });

      onCreated();
    } catch (e: any) {
      toast.error('Erro ao iniciar geração: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)} className="flex items-center gap-1 text-muted-foreground">
            <ChevronLeft size={20} /> {step === 1 ? 'Voltar' : 'Anterior'}
          </button>
          <span className="text-xs text-muted-foreground">{step} de {totalSteps}</span>
        </div>

        {/* Progress */}
        <Progress value={(step / totalSteps) * 100} className="h-1 mb-8" />

        {/* Steps with slide animation */}
        <div className="animate-fade-in" key={step}>
          {step === 1 && <StepIntro nomeBebe={nomeBebe || profile?.nome_bebe || 'seu bebê'} />}
          {step === 2 && <StepEstilo value={estilo} onChange={setEstilo} />}
          {step === 3 && <StepIdioma value={idioma} onChange={setIdioma} />}
          {step === 4 && <StepTemas selected={temas} onToggle={toggleTema} />}
          {step === 5 && <StepNome value={nomeBebe} onChange={setNomeBebe} />}
          {step === 6 && <StepRevisao estilo={estilo} idioma={idioma} temas={temas} nomeBebe={nomeBebe} />}
        </div>

        {/* Actions */}
        <div className="mt-8">
          {step < 6 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="w-full gradient-hero text-primary-foreground rounded-xl"
            >
              {step === 1 ? 'Criar minha música' : 'Continuar'}
              <ChevronRight size={18} className="ml-1" />
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl">
                ← Ajustar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 gradient-hero text-primary-foreground rounded-xl"
              >
                {submitting ? 'Enviando...' : '✨ Gerar minha música'}
              </Button>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

/* Steps */
function StepIntro({ nomeBebe }: { nomeBebe: string }) {
  return (
    <div className="text-center">
      <svg className="w-24 h-24 mx-auto mb-6 text-primary" viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M48 24c-8 0-16 8-16 18s8 22 16 26c8-4 16-16 16-26s-8-18-16-18z" fill="currentColor" fillOpacity="0.08" />
        <path d="M35 36c-4-2-8 0-10 4" /><path d="M61 36c4-2 8 0 10 4" />
        <circle cx="30" cy="28" r="3" fill="currentColor" fillOpacity="0.15" /><circle cx="66" cy="28" r="3" fill="currentColor" fillOpacity="0.15" />
        <path d="M40 18c-2-4 0-8 4-10" /><path d="M56 18c2-4 0-8-4-10" />
        <path d="M26 48c-6 2-4 8 0 10" /><path d="M70 48c6 2 4 8 0 10" />
      </svg>
      <h1 className="font-display text-2xl font-bold mb-2">A música de {nomeBebe}</h1>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
        Vamos criar uma canção única, feita só para o seu bebê. Você escolhe o estilo e os temas — a magia acontece aqui. 🎶
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 max-w-xs mx-auto">
        ⚠️ Você tem direito a 1 criação. Escolha com carinho — esta será a música do seu bebê para sempre.
      </div>
    </div>
  );
}

function StepEstilo({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-1">Qual é o estilo da sua canção?</h2>
      <p className="text-muted-foreground text-sm mb-6">Escolha o que mais combina com vocês</p>
      <div className="grid grid-cols-2 gap-3">
        {ESTILOS.map(e => (
          <button
            key={e.id}
            onClick={() => onChange(e.id)}
            className={`card-press text-left rounded-2xl p-4 border-2 transition-all ${
              value === e.id
                ? 'border-primary bg-primary-light'
                : 'border-[var(--card-border-color)] bg-card'
            }`}
          >
            <span className="text-2xl block mb-1">{e.emoji}</span>
            <p className="font-display text-[15px] font-semibold">{e.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{e.desc}</p>
            {value === e.id && <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs">✓</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepIdioma({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-1">Em qual idioma?</h2>
      <p className="text-muted-foreground text-sm mb-6">O idioma da letra da música</p>
      <div className="grid grid-cols-2 gap-4">
        {IDIOMAS.map(i => (
          <button
            key={i.id}
            onClick={() => onChange(i.id)}
            className={`card-press text-center rounded-2xl p-6 border-2 transition-all ${
              value === i.id
                ? 'border-primary bg-primary-light'
                : 'border-[var(--card-border-color)] bg-card'
            }`}
          >
            <span className="text-4xl block mb-2">{i.flag}</span>
            <p className="font-display text-base font-semibold">{i.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepTemas({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-xl font-bold">Escolha até 4 temas</h2>
        <span className="text-sm text-muted-foreground">{selected.length} de 4</span>
      </div>
      <p className="text-muted-foreground text-sm mb-6">Temas centrais da letra e melodia</p>
      <div className="flex flex-wrap gap-2.5">
        {TEMAS.map(t => {
          const isSelected = selected.includes(t.id);
          const isDisabled = !isSelected && selected.length >= 4;
          return (
            <button
              key={t.id}
              onClick={() => onToggle(t.id)}
              disabled={isDisabled}
              className={`rounded-full px-4 py-2.5 text-sm font-medium border-[1.5px] transition-all card-press ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : isDisabled
                    ? 'opacity-40 border-[var(--card-border-color)] bg-card cursor-not-allowed'
                    : 'border-[var(--card-border-color)] bg-card hover:border-primary/30'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepNome({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <svg className="w-20 h-20 mx-auto mb-4 text-primary" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <ellipse cx="40" cy="45" rx="14" ry="16" fill="currentColor" fillOpacity="0.08" />
        <circle cx="40" cy="36" r="8" fill="currentColor" fillOpacity="0.08" />
        <path d="M28 28c-4 2-6 0-8-2" /><path d="M52 28c4 2 6 0 8-2" />
        <circle cx="22" cy="20" r="2" fill="currentColor" fillOpacity="0.15" />
        <circle cx="58" cy="20" r="2" fill="currentColor" fillOpacity="0.15" />
        <circle cx="34" cy="16" r="1.5" fill="currentColor" fillOpacity="0.15" />
        <circle cx="46" cy="16" r="1.5" fill="currentColor" fillOpacity="0.15" />
      </svg>
      <h2 className="font-display text-xl font-bold mb-1 text-center">Como o bebê se chama na música?</h2>
      <p className="text-muted-foreground text-sm mb-6 text-center">O nome aparecerá na letra com carinho 💛</p>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Nome do bebê"
        className="rounded-xl text-center text-lg font-display"
        maxLength={30}
      />
    </div>
  );
}

function StepRevisao({ estilo, idioma, temas, nomeBebe }: { estilo: string; idioma: string; temas: string[]; nomeBebe: string }) {
  const estiloLabel = ESTILOS.find(e => e.id === estilo)?.label || estilo;
  const idiomaLabel = IDIOMAS.find(i => i.id === idioma)?.label || idioma;
  const temasLabels = temas.map(t => TEMAS.find(x => x.id === t)?.label || t);

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-4 text-center">Revisão final</h2>
      <div className="bg-card rounded-2xl border border-[var(--card-border-color)] p-5 space-y-3 mb-4">
        <div><span className="text-xs text-muted-foreground uppercase tracking-wide">Estilo</span><p className="font-display font-semibold">{estiloLabel}</p></div>
        <div><span className="text-xs text-muted-foreground uppercase tracking-wide">Idioma</span><p className="font-display font-semibold">{idiomaLabel}</p></div>
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Temas</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {temasLabels.map(t => <span key={t} className="bg-primary-light text-primary text-xs rounded-full px-3 py-1 font-medium">{t}</span>)}
          </div>
        </div>
        <div><span className="text-xs text-muted-foreground uppercase tracking-wide">Nome do bebê</span><p className="font-display font-semibold">{nomeBebe}</p></div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        ⚠️ <strong>Atenção:</strong> após confirmar, a música será gerada e não poderá ser refeita. Esta é sua única criação. Tem certeza que está pronto(a)?
      </div>
    </div>
  );
}

/* ==================== GENERATING VIEW ==================== */
function GeneratingView({ record }: { record: any }) {
  const navigate = useNavigate();
  const [msgIdx, setMsgIdx] = useState(0);
  const nomeBebe = record?.nome_bebe || 'seu bebê';

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-bg min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm animate-fade-in">
        {/* Animated notes */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg className="w-24 h-24 text-primary animate-pulse" viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M48 20c-10 0-20 10-20 22s10 28 20 32c10-4 20-18 20-32s-10-22-20-22z" fill="currentColor" fillOpacity="0.08" />
            <circle cx="28" cy="30" r="4" className="animate-float" fill="currentColor" fillOpacity="0.2" />
            <circle cx="68" cy="26" r="3" className="animate-float" style={{ animationDelay: '0.5s' }} fill="currentColor" fillOpacity="0.2" />
            <circle cx="24" cy="50" r="2.5" className="animate-float" style={{ animationDelay: '1s' }} fill="currentColor" fillOpacity="0.15" />
            <circle cx="72" cy="50" r="3.5" className="animate-float" style={{ animationDelay: '1.5s' }} fill="currentColor" fillOpacity="0.15" />
          </svg>
        </div>
        <h1 className="font-display text-xl font-bold mb-2">Compondo a música de {nomeBebe}... 🎶</h1>
        <p className="text-muted-foreground text-sm mb-6 transition-opacity duration-500">{LOADING_MESSAGES[msgIdx]}</p>
        <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary/40 rounded-full animate-shimmer" style={{ width: '60%' }} />
        </div>
        <p className="text-xs text-muted-foreground mt-4">Pode levar até 2 minutos</p>
      </div>
    </div>
  );
}

/* ==================== PLAYER VIEW ==================== */
function PlayerView({ record }: { record: any }) {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loop, setLoop] = useState(false);

  const nomeBebe = record.nome_bebe || 'seu bebê';
  const estiloLabel = ESTILOS.find(e => e.id === record.estilo)?.label || record.estilo;
  const temasLabels = (record.temas as string[] || []).map((t: string) => TEMAS.find(x => x.id === t)?.label || t);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  }, [playing]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    const text = `Criei uma música especial para o meu bebê ${nomeBebe} com o Mater 🎵💛`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `A música de ${nomeBebe}`, text, url: record.audio_url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${record.audio_url}`);
      toast.success('Link copiado!');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(record.audio_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `musica-${nomeBebe.toLowerCase().replace(/\s+/g, '-')}.mp3`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao baixar. Tente novamente.");
    }
  };

  return (
    <div className="dashboard-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-muted-foreground mb-6">
          <ArrowLeft size={20} /> Voltar
        </button>

        <div className="bg-card rounded-[28px] border border-[var(--card-border-color)] overflow-hidden animate-fade-up">
          {/* Cover */}
          <div className="h-48 flex items-center justify-center" style={{
            background: 'radial-gradient(ellipse at top left, hsl(340 100% 94%) 0%, hsl(270 60% 97%) 50%, hsl(340 80% 96%) 100%)',
          }}>
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-2 text-primary animate-float" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 52V16l24-8v36" /><circle cx="18" cy="52" r="4" fill="currentColor" fillOpacity="0.15" /><circle cx="42" cy="44" r="4" fill="currentColor" fillOpacity="0.15" />
              </svg>
              <h2 className="font-display text-2xl font-bold text-primary">{nomeBebe}</h2>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-display text-lg font-bold mb-1">A música de {nomeBebe} 🎵</h3>
            <div className="flex flex-wrap gap-1.5 mb-5">
              <span className="bg-primary-light text-primary text-xs rounded-full px-2.5 py-0.5">{estiloLabel}</span>
              {temasLabels.map((t: string) => <span key={t} className="bg-primary-light text-primary text-xs rounded-full px-2.5 py-0.5">{t}</span>)}
            </div>

            {/* Audio element */}
            <audio
              ref={audioRef}
              src={record.audio_url}
              loop={loop}
              onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
              onEnded={() => { if (!loop) setPlaying(false); }}
            />

            {/* Progress bar */}
            <div className="cursor-pointer mb-2" onClick={handleSeek}>
              <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-4">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mb-5">
              <button onClick={() => setLoop(!loop)} className={`p-2 rounded-full transition-colors ${loop ? 'text-primary bg-primary-light' : 'text-muted-foreground'}`}>
                <RotateCcw size={22} />
              </button>
              <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground card-press">
                {playing ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
              </button>
              <div className="w-10" /> {/* spacer */}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleShare} className="rounded-xl">
                <Share2 size={16} className="mr-1.5" /> Compartilhar
              </Button>
              <Button variant="outline" onClick={handleDownload} className="rounded-xl">
                <Download size={16} className="mr-1.5" /> Baixar MP3
              </Button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
