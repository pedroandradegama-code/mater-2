import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Share2, Download, Trash2, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIPOS_EVENTO = [
  { id: 'cha_revelacao', label: 'Chá Revelação',   emoji: '🎀' },
  { id: 'cha_fraldas',   label: 'Chá de Fraldas',  emoji: '🍼' },
  { id: 'aniversario',   label: 'Aniversário',      emoji: '🎂' },
  { id: 'outro',         label: 'Outro Evento',     emoji: '🎉' },
];

const TEMPLATES = [
  {
    id: 'floral',
    name: 'Floral',
    desc: 'Rosa · Aquarela',
    bg: 'from-rose-100 to-pink-50',
    border: 'border-rose-200',
    accent: 'bg-rose-100 text-rose-700',
    ring: 'ring-rose-400',
    emoji: '🌸',
  },
  {
    id: 'natureza',
    name: 'Natureza',
    desc: 'Verde · Orgânico',
    bg: 'from-emerald-100 to-green-50',
    border: 'border-emerald-200',
    accent: 'bg-emerald-100 text-emerald-700',
    ring: 'ring-emerald-400',
    emoji: '🌿',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    desc: 'Lilás · Geométrico',
    bg: 'from-violet-100 to-purple-50',
    border: 'border-violet-200',
    accent: 'bg-violet-100 text-violet-700',
    ring: 'ring-violet-400',
    emoji: '✨',
  },
];

const LOADING_MSGS = [
  'Compondo seu convite com carinho...',
  'Aplicando os detalhes do evento...',
  'Quase pronto — finalizando a arte...',
];

interface EventoRecord {
  id: string;
  tipo_evento: string;
  template_id: string;
  titulo_evento: string;
  nome_familia: string;
  data_hora: string;
  local: string;
  mensagem: string | null;
  rsvp: string | null;
  nome_bebe: string | null;
  status: 'pending' | 'generating' | 'done' | 'error';
  image_url: string | null;
  created_at: string;
}

export default function Eventos() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'create'>('list');

  const { data: eventos = [], isLoading } = useQuery<EventoRecord[]>({
    queryKey: ['eventos', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as EventoRecord[];
    },
    enabled: !!user,
    refetchInterval: (query) => {
      const data = query.state.data as EventoRecord[] | undefined;
      const hasGenerating = data?.some(e => e.status === 'pending' || e.status === 'generating');
      return hasGenerating ? 4000 : false;
    },
  });

  if (view === 'create') {
    return (
      <CreateView
        profile={profile}
        onBack={() => setView('list')}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['eventos'] });
          setView('list');
        }}
      />
    );
  }

  return (
    <div className="dashboard-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-card border border-[var(--card-border-color)] flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-semibold text-foreground">Eventos</h1>
            <p className="text-xs text-muted-foreground">Convites gerados com IA</p>
          </div>
          <button
            onClick={() => setView('create')}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center"
          >
            <Plus size={18} className="text-primary-foreground" />
          </button>
        </div>

        {!isLoading && eventos.length === 0 && (
          <div className="bg-card rounded-[20px] border border-[var(--card-border-color)] p-8 text-center">
            <p className="text-4xl mb-3">🎀</p>
            <p className="font-display text-lg font-semibold text-foreground mb-2">
              Nenhum evento criado
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              Crie convites lindos para o seu chá revelação, chá de fraldas e muito mais.
            </p>
            <Button
              onClick={() => setView('create')}
              className="rounded-xl bg-primary text-primary-foreground gap-2"
            >
              <Sparkles size={16} />
              Criar primeiro convite
            </Button>
          </div>
        )}

        {eventos.map(evento => (
          <EventoCard
            key={evento.id}
            evento={evento}
            onDelete={() => queryClient.invalidateQueries({ queryKey: ['eventos'] })}
          />
        ))}
      </div>
      <BottomNav />
    </div>
  );
}

function EventoCard({ evento, onDelete }: { evento: EventoRecord; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const template = TEMPLATES.find(t => t.id === evento.template_id) || TEMPLATES[0];
  const tipo = TIPOS_EVENTO.find(t => t.id === evento.tipo_evento);

  const deleteEvento = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('eventos').delete().eq('id', evento.id);
      if (error) throw error;
    },
    onSuccess: () => { onDelete(); toast.success('Evento removido.'); },
  });

  const handleShare = async () => {
    if (!evento.image_url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: evento.titulo_evento, text: `${evento.titulo_evento} — ${evento.data_hora}`, url: evento.image_url });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(evento.image_url);
      toast.success('Link copiado!');
    }
  };

  const handleWhatsApp = () => {
    if (!evento.image_url) return;
    const text = encodeURIComponent(
      `*${evento.titulo_evento}*\n📅 ${evento.data_hora}\n📍 ${evento.local}${evento.mensagem ? `\n\n"${evento.mensagem}"` : ''}\n\nVeja o convite: ${evento.image_url}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="bg-card rounded-[20px] border border-[var(--card-border-color)] overflow-hidden mb-4">
      {evento.status === 'done' && evento.image_url ? (
        <div className="relative">
          <img src={evento.image_url} alt={evento.titulo_evento} className="w-full aspect-square object-cover" loading="lazy" />
          <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 bg-gradient-to-t from-black/40 to-transparent">
            <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-1.5 bg-white/90 rounded-xl py-2 text-xs font-semibold text-emerald-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
            <button onClick={handleShare} className="w-9 h-9 flex items-center justify-center bg-white/90 rounded-xl"><Share2 size={14} className="text-foreground" /></button>
            <a href={evento.image_url} download={`convite-${evento.tipo_evento}.png`} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center bg-white/90 rounded-xl"><Download size={14} className="text-foreground" /></a>
          </div>
        </div>
      ) : evento.status === 'generating' || evento.status === 'pending' ? (
        <div className={`w-full aspect-square bg-gradient-to-br ${template.bg} flex flex-col items-center justify-center gap-3`}>
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground text-center px-8">{LOADING_MSGS[0]}</p>
        </div>
      ) : (
        <div className={`w-full aspect-square bg-gradient-to-br ${template.bg} flex flex-col items-center justify-center gap-2`}>
          <p className="text-2xl">⚠️</p>
          <p className="text-sm text-muted-foreground">Erro ao gerar convite</p>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-base">{tipo?.emoji}</span>
              <p className="font-display text-base font-semibold text-foreground truncate">{evento.titulo_evento}</p>
            </div>
            <p className="text-xs text-muted-foreground">{evento.nome_familia} · {evento.data_hora}</p>
            <p className="text-xs text-muted-foreground truncate">{evento.local}</p>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${template.accent}`}>{template.name}</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--card-border-color)]">
          <p className="text-[11px] text-muted-foreground">
            {format(new Date(evento.created_at), "dd MMM yyyy", { locale: ptBR })}
          </p>
          <button
            onClick={() => {
              if (confirmDelete) { deleteEvento.mutate(); }
              else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); }
            }}
            className={`p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 ${confirmDelete ? 'bg-red-100 text-red-600' : 'text-muted-foreground hover:text-red-400 hover:bg-red-50'}`}
          >
            <Trash2 size={13} />
            {confirmDelete && <span>Confirmar</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateView({ profile, onBack, onSuccess }: { profile: any; onBack: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tipoEvento, setTipoEvento] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [form, setForm] = useState({
    titulo_evento: '',
    nome_familia:  profile?.nome || '',
    data_hora:     '',
    local:         '',
    mensagem:      '',
    rsvp:          '',
    nome_bebe:     profile?.nome_bebe || '',
  });

  const canGoStep2 = tipoEvento && templateId;
  const canGoStep3 = form.nome_familia && form.data_hora && form.local;
  const tipo = TIPOS_EVENTO.find(t => t.id === tipoEvento);
  const template = TEMPLATES.find(t => t.id === templateId);

  const handleTipoChange = (id: string) => {
    setTipoEvento(id);
    const label = TIPOS_EVENTO.find(t => t.id === id)?.label || '';
    setForm(f => ({ ...f, titulo_evento: f.titulo_evento || label }));
  };

  const gerar = useMutation({
    mutationFn: async () => {
      const { data: evt, error: insertErr } = await supabase
        .from('eventos')
        .insert({
          user_id: user!.id,
          tipo_evento: tipoEvento,
          template_id: templateId,
          titulo_evento: form.titulo_evento || tipo?.label || '',
          nome_familia: form.nome_familia,
          data_hora: form.data_hora,
          local: form.local,
          mensagem: form.mensagem || null,
          rsvp: form.rsvp || null,
          nome_bebe: form.nome_bebe || null,
          status: 'pending',
        } as any)
        .select()
        .single();
      if (insertErr || !evt) throw new Error('Erro ao criar evento');
      const { error: fnErr } = await supabase.functions.invoke('templated-render', { body: { evento_id: evt.id } });
      if (fnErr) console.warn('Edge function warning:', fnErr);
      return evt;
    },
    onSuccess: () => { toast.success('Convite sendo gerado!'); onSuccess(); },
    onError: (err: any) => toast.error(err.message || 'Erro ao gerar convite.'),
  });

  return (
    <div className="dashboard-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={step === 1 ? onBack : () => setStep(s => (s - 1) as 1 | 2 | 3)}
            className="w-9 h-9 rounded-full bg-card border border-[var(--card-border-color)] flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-semibold text-foreground">Novo Convite</h1>
            <p className="text-xs text-muted-foreground">Passo {step} de 3</p>
          </div>
        </div>

        <div className="flex gap-1.5 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-primary/15'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Tipo de evento</p>
              <div className="grid grid-cols-2 gap-2.5">
                {TIPOS_EVENTO.map(t => (
                  <button key={t.id} onClick={() => handleTipoChange(t.id)}
                    className={`flex items-center gap-3 bg-card rounded-2xl border px-3.5 py-3 h-16 text-left transition-all card-press ${tipoEvento === t.id ? 'border-primary ring-1 ring-primary' : 'border-[var(--card-border-color)]'}`}>
                    <span className="text-2xl">{t.emoji}</span>
                    <span className="text-sm font-medium text-foreground">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Estilo do convite</p>
              <div className="grid grid-cols-3 gap-2.5">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplateId(t.id)}
                    className={`flex flex-col items-center bg-card rounded-2xl border px-2 py-4 gap-2 transition-all card-press ${templateId === t.id ? 'border-primary ring-1 ring-primary' : 'border-[var(--card-border-color)]'}`}>
                    <div className={`w-full h-14 rounded-xl bg-gradient-to-br ${t.bg} flex items-center justify-center text-2xl`}>{t.emoji}</div>
                    <p className="text-xs font-semibold text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => setStep(2)} disabled={!canGoStep2} className="w-full rounded-2xl h-12 bg-primary text-primary-foreground gap-2">
              Continuar <ChevronRight size={16} />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-card rounded-[20px] border border-[var(--card-border-color)] p-4 space-y-3">
              {[
                { label: 'Título do convite', key: 'titulo_evento', placeholder: tipo?.label || 'Ex: Chá Revelação da Mariana' },
                { label: 'Nome da família / casal', key: 'nome_familia', placeholder: 'Ex: Ana & João Oliveira' },
                { label: 'Data e horário', key: 'data_hora', placeholder: 'Ex: Sábado, 12 de Abril · às 15h' },
                { label: 'Local', key: 'local', placeholder: 'Ex: Espaço Jardim das Flores, São Paulo' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs text-muted-foreground mb-1.5 block">{field.label}</label>
                  <Input placeholder={field.placeholder} value={(form as any)[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} className="rounded-xl text-sm" />
                </div>
              ))}
            </div>
            <Button onClick={() => setStep(3)} disabled={!canGoStep3} className="w-full rounded-2xl h-12 bg-primary text-primary-foreground gap-2">
              Continuar <ChevronRight size={16} />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-card rounded-[20px] border border-[var(--card-border-color)] p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Detalhes opcionais</p>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Mensagem pessoal</label>
                <Textarea placeholder="Ex: Venha celebrar conosco a chegada do nosso pequeno milagre!" value={form.mensagem}
                  onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))} className="rounded-xl resize-none text-sm" rows={3} />
              </div>
              {[
                { label: 'RSVP (confirmação)', key: 'rsvp', placeholder: 'Ex: Confirme: (11) 99999-0000' },
                { label: 'Nome do bebê (opcional)', key: 'nome_bebe', placeholder: 'Ex: Bebê Silva' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs text-muted-foreground mb-1.5 block">{field.label}</label>
                  <Input placeholder={field.placeholder} value={(form as any)[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} className="rounded-xl text-sm" />
                </div>
              ))}
            </div>

            <div className={`bg-gradient-to-br ${template?.bg} rounded-[20px] border ${template?.border} p-4`}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Resumo</p>
              <div className="space-y-1.5">
                {[
                  { icon: tipo?.emoji || '🎉', value: form.titulo_evento },
                  { icon: '👨‍👩‍👧', value: form.nome_familia },
                  { icon: '📅', value: form.data_hora },
                  { icon: '📍', value: form.local },
                  { icon: '💬', value: form.mensagem },
                  { icon: '📱', value: form.rsvp },
                  { icon: '👶', value: form.nome_bebe },
                ].filter(r => r.value).map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0 mt-0.5">{r.icon}</span>
                    <p className="text-xs text-foreground/80 line-clamp-2">{r.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-lg">{template?.emoji}</span>
                <span className="text-xs text-muted-foreground">Template {template?.name}</span>
              </div>
            </div>

            <Button onClick={() => gerar.mutate()} disabled={gerar.isPending} className="w-full rounded-2xl h-12 bg-primary text-primary-foreground gap-2">
              {gerar.isPending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Gerando...</>
              ) : (
                <><Sparkles size={16} />Gerar convite</>
              )}
            </Button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
