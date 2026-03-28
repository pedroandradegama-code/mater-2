import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { calculatePregnancyInfo, parseLocalDate } from '@/lib/pregnancy-data';
import BottomNav from '@/components/BottomNav';
import UpgradeModal from '@/components/UpgradeModal';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Share2, Download, RotateCcw, Loader2, Check } from 'lucide-react';

const TOTAL_STEPS = 7; // 6 questions + result

interface Answers {
  descoberta?: string;
  sentimento?: string;
  medo?: string;
  preparacao?: string[];
  palavra?: string;
  expectativa?: string;
}

const optionCard = (selected: boolean) =>
  `p-3.5 rounded-2xl border-2 transition-all text-left ${
    selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background/60 hover:border-primary/30'
  }`;

const checkMark = (selected: boolean) =>
  `w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
    selected ? 'bg-primary text-primary-foreground' : 'border border-muted-foreground/30'
  }`;

// SVGs
function StarSVG() {
  return (
    <svg className="w-16 h-16 mx-auto text-primary" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M32 8l4 16h16l-13 9 5 16-12-9-12 9 5-16-13-9h16z" fill="currentColor" fillOpacity="0.1" />
      <path d="M32 4v4M50 14l-3 3M56 32h-4M50 50l-3-3M32 56v4M14 50l3-3M8 32h4M14 14l3 3" />
    </svg>
  );
}
function HeartSVG() {
  return (
    <svg className="w-16 h-16 mx-auto text-primary" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M32 56s-20-14-20-28c0-8 6-14 13-14 4 0 5 2 7 5 2-3 3-5 7-5 7 0 13 6 13 14 0 14-20 28-20 28z" fill="currentColor" fillOpacity="0.1" />
      <path d="M22 30c-2 2-1 6 2 10" /><path d="M42 30c2 2 1 6-2 10" />
    </svg>
  );
}
function ThoughtSVG() {
  return (
    <svg className="w-16 h-16 mx-auto text-primary" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <ellipse cx="32" cy="28" rx="20" ry="16" fill="currentColor" fillOpacity="0.1" />
      <circle cx="20" cy="50" r="3" /><circle cx="14" cy="56" r="2" />
    </svg>
  );
}
function BookSVG() {
  return (
    <svg className="w-16 h-16 mx-auto text-primary" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8 12h20c4 0 4 2 4 4v36c0-2-2-4-4-4H8V12z" fill="currentColor" fillOpacity="0.05" />
      <path d="M56 12H36c-4 0-4 2-4 4v36c0-2 2-4 4-4h20V12z" fill="currentColor" fillOpacity="0.05" />
    </svg>
  );
}
function SunSVG() {
  return (
    <svg className="w-16 h-16 mx-auto text-primary" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="32" cy="36" r="12" fill="currentColor" fillOpacity="0.1" />
      <path d="M32 18v-6M32 54v6M18 36H12M52 36h6M20 24l-4-4M44 24l4-4" />
      <path d="M8 48h48" />
    </svg>
  );
}
function BabySVG() {
  return (
    <svg className="w-16 h-16 mx-auto text-primary" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <ellipse cx="32" cy="34" rx="16" ry="20" fill="currentColor" fillOpacity="0.1" />
      <circle cx="26" cy="30" r="1.5" fill="currentColor" /><circle cx="38" cy="30" r="1.5" fill="currentColor" />
      <path d="M28 38c2 2 6 2 8 0" />
    </svg>
  );
}

function QuizStep({ step, answers, setAnswers }: { step: number; answers: Answers; setAnswers: (a: Answers) => void }) {
  const selectSingle = (key: keyof Answers, value: string) => setAnswers({ ...answers, [key]: value });
  const toggleMulti = (key: keyof Answers, value: string) => {
    const arr = (answers[key] as string[] | undefined) || [];
    const maxItems = 3;
    if (arr.includes(value)) setAnswers({ ...answers, [key]: arr.filter(v => v !== value) });
    else if (arr.length < maxItems) setAnswers({ ...answers, [key]: [...arr, value] });
  };
  const isSelected = (key: keyof Answers, value: string) => {
    const v = answers[key];
    if (Array.isArray(v)) return v.includes(value);
    return v === value;
  };

  const renderPills = (key: keyof Answers, options: { value: string; label: string }[], multi = false) => (
    <div className="space-y-2.5">
      {options.map(o => (
        <button key={o.value} className={`w-full ${optionCard(isSelected(key, o.value))}`}
          onClick={() => multi ? toggleMulti(key, o.value) : selectSingle(key, o.value)}>
          <div className="flex items-center gap-3">
            <div className={checkMark(isSelected(key, o.value))}>
              {isSelected(key, o.value) && <Check size={12} />}
            </div>
            <span className="text-sm font-medium">{o.label}</span>
          </div>
        </button>
      ))}
    </div>
  );

  if (step === 1) return (
    <div className="space-y-4 animate-fade-in">
      <StarSVG />
      <h2 className="font-display text-2xl font-semibold text-center">Como você descobriu que estava grávida?</h2>
      {renderPills('descoberta', [
        { value: 'banheiro', label: 'No banheiro de casa 🏠' },
        { value: 'consultorio', label: 'No consultório médico 🏥' },
        { value: 'desconfiava', label: 'Já desconfiava 💭' },
        { value: 'surpresa', label: 'Foi uma surpresa total 🎉' },
      ])}
    </div>
  );

  if (step === 2) return (
    <div className="space-y-4 animate-fade-in">
      <HeartSVG />
      <h2 className="font-display text-2xl font-semibold text-center">Como você se sentiu no primeiro momento?</h2>
      {renderPills('sentimento', [
        { value: 'chorei', label: 'Chorei de alegria 😭' },
        { value: 'choque', label: 'Fiquei em choque 😮' },
        { value: 'sorri', label: 'Sorri sozinha 😊' },
        { value: 'liguei', label: 'Liguei correndo para alguém 📱' },
      ])}
    </div>
  );

  if (step === 3) return (
    <div className="space-y-4 animate-fade-in">
      <ThoughtSVG />
      <h2 className="font-display text-2xl font-semibold text-center">Qual foi seu maior medo inicial?</h2>
      {renderPills('medo', [
        { value: 'boa_mae', label: 'Ser uma boa mãe 💛' },
        { value: 'saude_bebe', label: 'A saúde do bebê 👶' },
        { value: 'parto', label: 'O parto 😬' },
        { value: 'conciliar', label: 'Conciliar tudo 🌀' },
      ])}
    </div>
  );

  if (step === 4) return (
    <div className="space-y-4 animate-fade-in">
      <BookSVG />
      <h2 className="font-display text-2xl font-semibold text-center">Como você está se preparando?</h2>
      <p className="text-xs text-muted-foreground text-center">Selecione até 3</p>
      {renderPills('preparacao', [
        { value: 'lendo', label: 'Lendo muito 📚' },
        { value: 'curso', label: 'Fazendo curso 🎓' },
        { value: 'conversando', label: 'Conversando com outras mães 💬' },
        { value: 'instinto', label: 'Confiando no instinto 🌿' },
        { value: 'medico', label: 'Seguindo meu médico 👩‍⚕️' },
        { value: 'flow', label: 'Indo no flow ✨' },
      ], true)}
    </div>
  );

  if (step === 5) return (
    <div className="space-y-4 animate-fade-in">
      <SunSVG />
      <h2 className="font-display text-2xl font-semibold text-center">Qual palavra define sua gestação até agora?</h2>
      <div className="flex flex-wrap gap-2 justify-center">
        {['Intensa', 'Mágica', 'Desafiadora', 'Transformadora', 'Leve', 'Misteriosa'].map(p => (
          <button key={p} onClick={() => selectSingle('palavra', p)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              answers.palavra === p ? 'bg-primary text-primary-foreground' : 'bg-card border border-[var(--card-border-color)] text-muted-foreground'
            }`}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );

  if (step === 6) return (
    <div className="space-y-4 animate-fade-in">
      <BabySVG />
      <h2 className="font-display text-2xl font-semibold text-center">O que você mais espera desse novo capítulo?</h2>
      {renderPills('expectativa', [
        { value: 'conhecer', label: 'Conhecer meu filho 👶' },
        { value: 'descobrir_mae', label: 'Me descobrir como mãe 🌸' },
        { value: 'familia', label: 'Completar minha família 👨‍👩‍👧' },
        { value: 'amor', label: 'Viver esse amor único 💛' },
      ])}
    </div>
  );

  return null;
}

export default function PassaporteMamae() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  const isPaid = profile?.plano === 'premium' || profile?.plano === 'pago';
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [frase, setFrase] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const dum = profile?.dum ? parseLocalDate(profile.dum) : undefined;
  const info = dum ? calculatePregnancyInfo(dum) : null;
  const currentWeek = info ? Math.min(info.weeks, 40) : 0;

  useEffect(() => {
    if (!isPaid) setShowUpgrade(true);
  }, [isPaid]);

  const progress = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);

  const canAdvance = () => {
    if (step === 1) return !!answers.descoberta;
    if (step === 2) return !!answers.sentimento;
    if (step === 3) return !!answers.medo;
    if (step === 4) return (answers.preparacao?.length || 0) > 0;
    if (step === 5) return !!answers.palavra;
    if (step === 6) return !!answers.expectativa;
    return true;
  };

  const generateCard = useCallback(async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('passaporte-frase', {
        body: { respostas: answers },
      });
      if (error) throw error;
      const fraseText = data?.frase || 'Sua jornada é única e cheia de amor.';
      setFrase(fraseText);

      // Save to DB
      await (supabase as any).from('passaporte').insert({
        user_id: user.id,
        respostas: answers as any,
        frase_gerada: fraseText,
      });

      setGenerated(true);
    } catch (e: any) {
      toast.error(e.message || 'Erro ao gerar');
    } finally {
      setGenerating(false);
    }
  }, [user, answers]);

  const next = () => {
    if (step === 6) { generateCard(); setStep(7); return; }
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };

  const shareCard = async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null, useCORS: true });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'passaporte-mamae.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Passaporte da Mamãe' });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'passaporte-mamae.png'; a.click();
          URL.revokeObjectURL(url);
          toast.success('Imagem salva!');
        }
      });
    } catch {
      toast.error('Erro ao compartilhar');
    }
  };

  const saveImage = async () => {
    if (!cardRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null, useCORS: true });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = 'passaporte-mamae.png'; a.click();
    toast.success('Imagem salva!');
  };

  const resetQuiz = () => {
    setStep(1); setAnswers({}); setFrase(''); setGenerated(false);
  };

  if (showUpgrade) return <UpgradeModal open onClose={() => navigate(-1)} />;

  // Result card view
  if (step === TOTAL_STEPS) {
    const answerTags = [
      answers.descoberta, answers.sentimento, answers.medo, answers.palavra, answers.expectativa,
      ...(answers.preparacao || []),
    ].filter(Boolean);

    return (
      <div className="dashboard-bg min-h-screen pb-28">
        <div className="app-container px-5 pt-6">
          <div className="flex items-center gap-3 mb-6 animate-fade-up">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-[var(--card-border-color)] flex items-center justify-center">
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-display text-xl font-semibold">Passaporte da Mamãe</h1>
          </div>

          {generating ? (
            <div className="text-center py-20 animate-fade-up">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Criando sua frase especial...</p>
            </div>
          ) : (
            <>
              {/* THE CARD */}
              <div ref={cardRef} className="mx-auto rounded-3xl overflow-hidden mb-6 animate-fade-up"
                style={{ width: 340, minHeight: 420, background: 'linear-gradient(135deg, hsl(345 70% 33%), hsl(280 60% 45%), hsl(345 60% 50%))' }}>
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[420px]">
                  <p className="text-[10px] uppercase tracking-[3px] text-white/60 font-semibold mb-3">✦ PASSAPORTE DA MAMÃE ✦</p>
                  <p className="font-display text-[28px] font-bold text-white mb-1">Mater</p>
                  <div className="w-12 h-px bg-white/30 my-3" />
                  <p className="font-display text-[22px] font-semibold text-white mb-1">{profile?.nome || 'Mamãe'}</p>
                  <p className="font-display text-[16px] text-pink-200">
                    {profile?.nome_bebe || 'Surpresa 🎁'}
                  </p>
                  <p className="text-white/70 text-xs mt-2 mb-4">Semana {currentWeek}</p>
                  <p className="font-display text-[15px] italic text-white leading-relaxed px-2 mb-4">
                    "{frase}"
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 px-2">
                    {answerTags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-white/15 text-white/80 text-[10px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-white/40 text-[10px] mt-6">materapp.com.br</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-4 animate-fade-up">
                <button onClick={shareCard}
                  className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
                  <Share2 size={16} /> Compartilhar
                </button>
                <button onClick={saveImage}
                  className="flex-1 py-3 rounded-2xl bg-card border border-[var(--card-border-color)] text-foreground font-semibold text-sm flex items-center justify-center gap-2">
                  <Download size={16} /> Salvar
                </button>
              </div>
              <button onClick={resetQuiz}
                className="w-full py-3 rounded-2xl bg-muted text-muted-foreground font-semibold text-sm flex items-center justify-center gap-2">
                <RotateCcw size={16} /> Refazer quiz
              </button>
            </>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  // Quiz view
  return (
    <div className="dashboard-bg min-h-screen pb-28">
      <div className="app-container px-5 pt-6">
        <div className="flex items-center gap-3 mb-4 animate-fade-up">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
            className="w-9 h-9 rounded-full bg-card border border-[var(--card-border-color)] flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium">{step}/6</span>
        </div>

        <div className="py-4">
          <QuizStep step={step} answers={answers} setAnswers={setAnswers} />
        </div>

        <button onClick={next} disabled={!canAdvance()}
          className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2 mt-6">
          {step === 6 ? 'Gerar meu Passaporte ✨' : <>Próxima <ArrowRight size={16} /></>}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
