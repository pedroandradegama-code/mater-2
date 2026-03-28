import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { calculatePregnancyInfo, parseLocalDate } from '@/lib/pregnancy-data';
import { toast } from 'sonner';

type InputMode = 'idle' | 'open' | 'image' | 'audio' | 'text' | 'thinking' | 'confirm';

interface AIResponse {
  intent: string;
  route?: string;
  message: string;
  extracted?: Record<string, any>;
  confirmLabel?: string;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callCentralIA(userContent: any, currentWeek: number): Promise<AIResponse> {
  const { data, error } = await supabase.functions.invoke('central-ia', {
    body: { userContent, currentWeek },
  });
  if (error) throw error;
  return data;
}

export default function CentralIA() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { getEffectiveDate } = useProfile();
  const { user } = useAuth();
  const [mode, setMode] = useState<InputMode>('idle');
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const effectiveDate = getEffectiveDate();
  const currentWeek = effectiveDate
    ? calculatePregnancyInfo(parseLocalDate(effectiveDate)).weeks
    : 0;

  useEffect(() => {
    if (mode === 'idle' || mode === 'open') return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') reset(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode]);

  function reset() {
    setMode('idle');
    setAiResponse(null);
    setTextInput('');
    setPreviewUrl(null);
    setIsRecording(false);
    setRecordingSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }

  function toggleOpen() {
    setMode(prev => prev === 'idle' ? 'open' : 'idle');
  }

  // ── IMAGE ─────────────────────────────────────────────────────
  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setMode('thinking');

    try {
      const base64 = await fileToBase64(file);
      const isImage = file.type.startsWith('image/');
      const content = isImage
        ? [
            { type: 'image_base64', media_type: file.type, data: base64 },
            { type: 'text', text: 'Analise esta imagem e identifique o que a usuária provavelmente quer fazer.' },
          ]
        : [{ type: 'text', text: `A usuária enviou um PDF chamado "${file.name}". Provavelmente é um exame.` }];

      const result = await callCentralIA(content, currentWeek);
      setAiResponse(result);
      setMode('confirm');
    } catch {
      toast.error('Não consegui analisar a imagem. Tente novamente.');
      reset();
    }
  }

  // ── AUDIO ─────────────────────────────────────────────────────
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setMode('thinking');
        try {
          // Since we can't transcribe audio directly, prompt the user to type instead
          const result = await callCentralIA(
            'A usuária tentou usar áudio. Sugira que ela digite o que precisa ou escolha uma das opções mais comuns: registrar peso, adicionar exame, escrever no diário, buscar nomes para o bebê.',
            currentWeek
          );
          setAiResponse(result);
          setMode('confirm');
        } catch {
          toast.error('Não consegui processar o áudio. Tente digitar.');
          setMode('text');
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch {
      toast.error('Permissão de microfone negada.');
      setMode('open');
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    mediaRecorderRef.current?.stop();
  }

  // ── TEXT ──────────────────────────────────────────────────────
  async function handleTextSubmit() {
    if (!textInput.trim()) return;
    setMode('thinking');
    try {
      const result = await callCentralIA(textInput, currentWeek);
      setAiResponse(result);
      setMode('confirm');
    } catch {
      toast.error('Erro ao processar. Tente novamente.');
      reset();
    }
  }

  // ── CONFIRM ACTION ────────────────────────────────────────────
  async function handleConfirm() {
    if (!aiResponse) return;
    const { intent, route, extracted } = aiResponse;

    if (intent === 'registro_peso' && extracted?.peso_kg && user) {
      const semana = currentWeek;
      await (supabase as any).from('peso_gestacional').insert({
        user_id: user.id,
        peso: extracted.peso_kg,
        semana,
        data: new Date().toISOString().split('T')[0],
      });
      toast.success(`Peso ${extracted.peso_kg}kg registrado na semana ${semana}!`);
    }

    if (route) navigate(route, { state: { fromIA: true, extracted } });
    reset();
  }

  const isOpen = mode === 'open';

  return (
    <>
      {/* OVERLAY */}
      {mode !== 'idle' && mode !== 'open' && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={reset} />
      )}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={reset} />
      )}

      {/* MODAL */}
      {(mode === 'thinking' || mode === 'confirm' || mode === 'text' || mode === 'audio') && (
        <div className="fixed inset-x-4 bottom-32 z-50 bg-card rounded-3xl shadow-2xl border border-border p-6 animate-fade-up max-w-[398px] mx-auto">

          {mode === 'thinking' && (
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl animate-pulse">✨</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Interpretando...</p>
            </div>
          )}

          {mode === 'audio' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold text-foreground text-center">
                {isRecording ? `🔴 Gravando... ${recordingSeconds}s` : 'Toque para gravar'}
              </p>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl transition-all ${
                  isRecording
                    ? 'bg-destructive text-destructive-foreground scale-110 shadow-lg'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {isRecording ? '⏹' : '🎙️'}
              </button>
              <button onClick={reset} className="text-xs text-muted-foreground text-center">Cancelar</button>
            </div>
          )}

          {mode === 'text' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-foreground">O que você precisa? ✍️</p>
              <textarea
                autoFocus
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSubmit(); } }}
                placeholder='Ex: "Quero registrar meu peso", "Me sugira nomes de menina", "Quais exames da semana 32?"'
                className="w-full rounded-2xl border border-border bg-background p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="flex gap-2">
                <button onClick={reset} className="flex-1 py-2.5 rounded-2xl border border-border text-sm text-muted-foreground">
                  Cancelar
                </button>
                <button
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim()}
                  className="flex-1 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40"
                >
                  Enviar ✨
                </button>
              </div>
            </div>
          )}

          {mode === 'confirm' && aiResponse && (
            <div className="flex flex-col gap-4">
              {previewUrl && (
                <img src={previewUrl} alt="" className="w-full h-32 object-cover rounded-2xl" />
              )}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-base">✨</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{aiResponse.message}</p>
              </div>
              {aiResponse.extracted?.peso_kg && (
                <div className="bg-primary/5 rounded-2xl px-4 py-2.5 text-center">
                  <span className="text-2xl font-bold text-primary">{aiResponse.extracted.peso_kg} kg</span>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={reset} className="flex-1 py-2.5 rounded-2xl border border-border text-sm text-muted-foreground">
                  Não agora
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold"
                >
                  {aiResponse.confirmLabel || 'Sim, continuar'} →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FLOATING BUTTONS */}
      {isOpen && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: '0ms' }}>
            <span className="text-xs font-medium text-primary-foreground bg-foreground/60 backdrop-blur-sm px-3 py-1 rounded-full">
              Texto
            </span>
            <button
              onClick={() => setMode('text')}
              className="w-14 h-14 rounded-full bg-card shadow-xl flex items-center justify-center text-2xl active:scale-95 transition-transform border border-border"
            >
              ✍️
            </button>
          </div>

          <div className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
            <span className="text-xs font-medium text-primary-foreground bg-foreground/60 backdrop-blur-sm px-3 py-1 rounded-full">
              Áudio
            </span>
            <button
              onClick={() => { setMode('audio'); startRecording(); }}
              className="w-14 h-14 rounded-full bg-card shadow-xl flex items-center justify-center text-2xl active:scale-95 transition-transform border border-border"
            >
              🎙️
            </button>
          </div>

          <div className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <span className="text-xs font-medium text-primary-foreground bg-foreground/60 backdrop-blur-sm px-3 py-1 rounded-full">
              Imagem
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 rounded-full bg-card shadow-xl flex items-center justify-center text-2xl active:scale-95 transition-transform border border-border"
            >
              📷
            </button>
          </div>
        </div>
      )}

      {/* HIDDEN FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        className="hidden"
        onChange={handleImageSelected}
        onClick={e => { (e.target as HTMLInputElement).value = ''; }}
      />

      {/* CENTRAL BUTTON */}
      <button
        onClick={toggleOpen}
        className="flex flex-col items-center gap-1 -mt-5 transition-all"
      >
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all text-primary-foreground ${
            isOpen ? 'bg-foreground rotate-45 scale-105' : 'bg-primary'
          }`}
          style={{ boxShadow: `0 4px 18px hsl(var(--primary) / 0.45)`, transition: 'transform 0.3s ease, background 0.2s' }}
        >
          {isOpen ? (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity={0.3} />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
            </svg>
          )}
        </div>
        <span className={`text-[10px] font-medium mt-0.5 ${isOpen ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
          {isOpen ? 'Fechar' : 'Assistente'}
        </span>
      </button>
    </>
  );
}
