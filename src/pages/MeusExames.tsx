import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calculatePregnancyInfo, parseLocalDate } from '@/lib/pregnancy-data';
import BottomNav from '@/components/BottomNav';
import UpgradeModal from '@/components/UpgradeModal';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Download, Trash2, FileText, Droplets, Image, FlaskConical, ShieldAlert, FolderOpen, Search, X, Upload, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { compressImageForUpload, isHeicLikeFile, sanitizeUploadFileName } from '@/lib/file-upload';

const CATEGORIAS = ['Todos', 'Sangue', 'Imagem', 'Urina', 'Infecciosos', 'Outros'] as const;
type Categoria = typeof CATEGORIAS[number];

const catIcons: Record<string, any> = {
  Sangue: Droplets,
  Imagem: Image,
  Urina: FlaskConical,
  Infecciosos: ShieldAlert,
  Outros: FileText,
};

export default function MeusExames() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPaid = profile?.plano === 'premium' || profile?.plano === 'pago';
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [filter, setFilter] = useState<Categoria>('Todos');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [lgpdDismissed, setLgpdDismissed] = useState(() => localStorage.getItem('lgpd_exames') === '1');

  // Form state
  const [nomeExame, setNomeExame] = useState('');
  const [categoria, setCategoria] = useState('Sangue');
  const [dataColeta, setDataColeta] = useState('');
  const [semana, setSemana] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const dum = profile?.dum ? parseLocalDate(profile.dum) : undefined;
  const info = dum ? calculatePregnancyInfo(dum) : null;

  useEffect(() => {
    if (!isPaid) setShowUpgrade(true);
  }, [isPaid]);

  useEffect(() => {
    if (info && !semana) setSemana(String(Math.min(info.weeks, 40)));
  }, [info]);

  const { data: exames = [], isLoading } = useQuery({
    queryKey: ['exames', user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('exames').select('*').eq('user_id', user!.id).order('data_coleta', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && isPaid,
  });

  const filtered = filter === 'Todos' ? exames : exames.filter((e: any) => e.categoria?.toLowerCase() === filter.toLowerCase());

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Arquivo muito grande (máx 10MB)'); return; }
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isAllowedImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|heic|heif)$/i.test(file.name);
    if (!isPdf && !isAllowedImage) {
      toast.error('Formato não suportado. Use PDF, JPG, PNG ou HEIC'); return;
    }
    setSelectedFile(file);
    if (isAllowedImage && !isHeicLikeFile(file)) setPreviewUrl(URL.createObjectURL(file));
    else setPreviewUrl(null);
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedFile || !nomeExame.trim()) throw new Error('Preencha os campos');
      setUploading(true);
      setUploadProgress(20);

      const { file: preparedFile, contentType } = await compressImageForUpload(selectedFile, 1200, 0.85);
      setUploadProgress(50);

      const timestamp = Date.now();
      const path = `${user.id}/${timestamp}_${sanitizeUploadFileName(selectedFile.name)}`;

      const { error: uploadError } = await supabase.storage
        .from('exames-gestantes')
        .upload(path, preparedFile, { contentType });
      if (uploadError) throw uploadError;
      setUploadProgress(80);

      const { error } = await (supabase as any).from('exames').insert({
        user_id: user.id,
        nome_exame: nomeExame.trim(),
        categoria: categoria.toLowerCase(),
        semana_gestacional: semana ? parseInt(semana) : null,
        data_coleta: dataColeta || null,
        arquivo_url: path,
        arquivo_nome: selectedFile.name,
        arquivo_tipo: contentType,
        observacoes: observacoes.trim() || null,
      });
      if (error) throw error;
      setUploadProgress(100);
    },
    onSuccess: () => {
      toast.success('Exame salvo com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['exames'] });
      resetForm();
    },
    onError: (e: any) => { toast.error(e.message || 'Erro ao salvar'); setUploading(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const exame = exames.find((e: any) => e.id === id);
      if (exame?.arquivo_url) {
        await supabase.storage.from('exames-gestantes').remove([exame.arquivo_url]);
      }
      const { error } = await (supabase as any).from('exames').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Exame removido');
      queryClient.invalidateQueries({ queryKey: ['exames'] });
      setDeleteId(null);
    },
  });

  const downloadFile = async (exame: any) => {
    const { data, error } = await supabase.storage.from('exames-gestantes').download(exame.arquivo_url);
    if (error || !data) { toast.error('Erro ao baixar'); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url; a.download = exame.arquivo_nome || 'exame'; a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setShowModal(false); setNomeExame(''); setCategoria('Sangue'); setDataColeta('');
    setSemana(info ? String(Math.min(info.weeks, 40)) : ''); setObservacoes('');
    setSelectedFile(null); setPreviewUrl(null); setUploading(false); setUploadProgress(0);
  };

  const CatIcon = (cat: string) => catIcons[cat.charAt(0).toUpperCase() + cat.slice(1)] || FileText;

  if (showUpgrade) return <UpgradeModal open onClose={() => navigate(-1)} />;

  return (
    <div className="dashboard-bg min-h-screen pb-28">
      <div className="app-container px-5 pt-6">
        {/* LGPD Banner */}
        {!lgpdDismissed && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4 animate-fade-up">
            <p className="text-sm text-foreground leading-relaxed">
              🔒 Seus exames são armazenados com segurança e nunca são acessados pela equipe do Mater. Apenas você tem acesso a estes arquivos.
            </p>
            <button onClick={() => { setLgpdDismissed(true); localStorage.setItem('lgpd_exames', '1'); }}
              className="mt-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              Entendi
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-5 animate-fade-up">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-[var(--card-border-color)] flex items-center justify-center">
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-display text-[26px] font-semibold text-foreground">Meus Exames</h1>
          </div>
          <button onClick={() => setShowModal(true)}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
            <Plus size={20} />
          </button>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide animate-fade-up">
          {CATEGORIAS.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filter === cat ? 'bg-primary text-primary-foreground' : 'bg-card border border-[var(--card-border-color)] text-muted-foreground'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Exame list */}
        {isLoading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 animate-fade-up">
            <svg className="w-20 h-20 mx-auto mb-4 text-muted-foreground/30" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="15" y="10" width="50" height="60" rx="6" />
              <path d="M25 25h30M25 35h20M25 45h25" />
              <circle cx="55" cy="55" r="12" fill="hsl(var(--background))" />
              <circle cx="55" cy="55" r="8" /><path d="M60 60l6 6" strokeWidth="2" />
            </svg>
            <p className="text-muted-foreground text-sm">Nenhum exame ainda. Adicione seu primeiro exame 📋</p>
          </div>
        ) : (
          <div className="space-y-2.5 animate-fade-up">
            {filtered.map((exame: any) => {
              const Icon = CatIcon(exame.categoria || 'outros');
              return (
                <div key={exame.id} className="bg-card rounded-2xl border border-[var(--card-border-color)] p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[15px] font-semibold text-foreground truncate">{exame.nome_exame}</p>
                    <p className="text-xs text-muted-foreground">
                      {exame.semana_gestacional && `Sem ${exame.semana_gestacional}`}
                      {exame.data_coleta && ` · ${format(new Date(exame.data_coleta), 'dd/MM/yy')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => downloadFile(exame)}
                      className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Download size={14} className="text-primary" />
                    </button>
                    <button onClick={() => setDeleteId(exame.id)}
                      className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Trash2 size={14} className="text-destructive" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={resetForm} />
          <div className="relative bg-background rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold">Novo Exame</h2>
              <button onClick={resetForm} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X size={16} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nome do exame</label>
                <input value={nomeExame} onChange={e => setNomeExame(e.target.value)}
                  placeholder="Ex: Hemograma completo"
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-[var(--card-border-color)] text-sm" />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Categoria</label>
                <select value={categoria} onChange={e => setCategoria(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-[var(--card-border-color)] text-sm">
                  {CATEGORIAS.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Data da coleta</label>
                  <input type="date" value={dataColeta} onChange={e => setDataColeta(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-card border border-[var(--card-border-color)] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Semana gestacional</label>
                  <input type="number" min={1} max={42} value={semana} onChange={e => setSemana(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-card border border-[var(--card-border-color)] text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Observações</label>
                <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)}
                  placeholder="Opcional" rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-[var(--card-border-color)] text-sm resize-none" />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Arquivo (PDF, JPG, PNG, HEIC — máx 10MB)</label>
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.heic" onChange={handleFileSelect} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center gap-2 hover:bg-primary/10 transition-all">
                  <Upload size={24} className="text-primary" />
                  <span className="text-xs text-muted-foreground">{selectedFile ? selectedFile.name : 'Clique para selecionar'}</span>
                </button>
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="mt-3 rounded-xl max-h-40 mx-auto object-contain" />
                )}
              </div>

              {uploading && (
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}

              <button
                onClick={() => uploadMutation.mutate()}
                disabled={!nomeExame.trim() || !selectedFile || uploading}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {uploading ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : 'Salvar exame'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir exame?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O arquivo será removido permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
