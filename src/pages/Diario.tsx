import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import UpgradeModal from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Camera, X, Grid3X3, List, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculatePregnancyInfo, parseLocalDate } from '@/lib/pregnancy-data';

const moods = [
  { emoji: '😊', label: 'Feliz' },
  { emoji: '😴', label: 'Cansada' },
  { emoji: '🤢', label: 'Enjoada' },
  { emoji: '💕', label: 'Ansiosa' },
  { emoji: '✨', label: 'Radiante' },
  { emoji: '😢', label: 'Emotiva' },
];

function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Compression failed')), 'image/jpeg', quality);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function Diario() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [diarioOpen, setDiarioOpen] = useState(false);
  const [cartaOpen, setCartaOpen] = useState(false);
  const [humor, setHumor] = useState('');
  const [texto, setTexto] = useState('');
  const [cartaTexto, setCartaTexto] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFree = profile?.plano !== 'pago';
  const currentWeek = profile?.dum ? calculatePregnancyInfo(parseLocalDate(profile.dum)).weeks : 0;

  const { data: entries = [] } = useQuery({
    queryKey: ['diario', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('diario').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: cartas = [] } = useQuery({
    queryKey: ['cartas', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('cartas').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3 - selectedPhotos.length);
    setSelectedPhotos(prev => [...prev, ...files].slice(0, 3));
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreviews(prev => [...prev, reader.result as string].slice(0, 3));
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (entryId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of selectedPhotos) {
      const compressed = await compressImage(file);
      const path = `${user!.id}/${entryId}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('diario-fotos').upload(path, compressed, { contentType: 'image/jpeg' });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('diario-fotos').getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const addEntry = useMutation({
    mutationFn: async () => {
      setUploading(true);
      const { data: inserted, error } = await supabase.from('diario').insert({
        user_id: user!.id,
        semana: currentWeek,
        humor,
        texto_livre: texto,
      }).select().single();
      if (error) throw error;

      if (selectedPhotos.length > 0 && inserted) {
        const photoUrls = await uploadPhotos(inserted.id);
        await supabase.from('diario').update({ fotos: photoUrls } as any).eq('id', inserted.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diario'] });
      setDiarioOpen(false);
      setHumor('');
      setTexto('');
      setSelectedPhotos([]);
      setPhotoPreviews([]);
      setUploading(false);
      toast.success('Entrada salva! 💕');
    },
    onError: () => {
      setUploading(false);
    },
  });

  const addCarta = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('cartas').insert({
        user_id: user!.id,
        semana: currentWeek,
        texto: cartaTexto,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas'] });
      setCartaOpen(false);
      setCartaTexto('');
      toast.success('Carta salva! 💌');
    },
  });

  const sharePhoto = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Meu diário de gestação', url });
      } catch { /* user cancelled */ }
    }
  };

  const allPhotos = entries.flatMap((e: any) =>
    ((e.fotos as string[]) || []).map(url => ({ url, semana: e.semana, entryId: e.id }))
  );

  if (isFree) {
    return (
      <div className="gradient-mesh-bg min-h-screen pb-24">
        <div className="app-container px-5 pt-6">
          <h1 className="font-display text-3xl font-semibold mb-4">Diário</h1>
          <div className="glass-card p-8 text-center">
            <p className="text-4xl mb-3">🌸</p>
            <p className="font-display text-xl font-semibold mb-2">Recurso Premium</p>
            <p className="text-sm text-muted-foreground mb-4">O Diário e as Cartas para o bebê fazem parte do Mater Completo.</p>
            <Button onClick={() => setShowUpgrade(true)} className="gradient-hero text-primary-foreground rounded-xl">
              Desbloquear — R$ 19
            </Button>
          </div>
        </div>
        <BottomNav />
        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>
    );
  }

  return (
    <div className="gradient-mesh-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">
        <h1 className="font-display text-3xl font-semibold mb-4">Diário</h1>

        <Tabs defaultValue="diario">
          <TabsList className="w-full mb-4 rounded-xl">
            <TabsTrigger value="diario" className="flex-1 rounded-lg">📖 Diário</TabsTrigger>
            <TabsTrigger value="cartas" className="flex-1 rounded-lg">💌 Cartas</TabsTrigger>
          </TabsList>

          <TabsContent value="diario">
            <div className="flex gap-2 mb-4">
              <Dialog open={diarioOpen} onOpenChange={(open) => { setDiarioOpen(open); if (!open) { setSelectedPhotos([]); setPhotoPreviews([]); } }}>
                <DialogTrigger asChild>
                  <Button className="flex-1 gradient-hero text-primary-foreground rounded-xl"><Plus size={16} className="mr-2" /> Nova entrada</Button>
                </DialogTrigger>
                <DialogContent className="glass-card-elevated max-w-sm">
                  <DialogHeader><DialogTitle className="font-display text-xl">Como você está?</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {moods.map(m => (
                        <button key={m.label} onClick={() => setHumor(m.label)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${humor === m.label ? 'bg-primary text-primary-foreground' : 'glass-card'}`}>
                          {m.emoji} {m.label}
                        </button>
                      ))}
                    </div>
                    <Textarea placeholder="Como foi seu dia?" value={texto} onChange={e => setTexto(e.target.value)} className="rounded-xl min-h-[120px]" />

                    {/* Photo upload */}
                    <div>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" />
                      {photoPreviews.length > 0 && (
                        <div className="flex gap-2 mb-2">
                          {photoPreviews.map((src, i) => (
                            <div key={i} className="relative w-20 h-20">
                              <img src={src} alt="" className="w-full h-full object-cover rounded-xl" />
                              <button onClick={() => removePhoto(i)} className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center">
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {selectedPhotos.length < 3 && (
                        <button onClick={() => fileInputRef.current?.click()} className="text-sm text-primary flex items-center gap-1.5 hover:underline">
                          <Camera size={16} /> Adicionar foto ({selectedPhotos.length}/3)
                        </button>
                      )}
                    </div>

                    <Button onClick={() => addEntry.mutate()} disabled={addEntry.isPending || uploading} className="w-full gradient-hero text-primary-foreground rounded-xl">
                      {uploading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Enviando...
                        </span>
                      ) : 'Salvar'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'gallery' : 'list')}
                className="glass-card p-2.5 rounded-xl"
              >
                {viewMode === 'list' ? <Grid3X3 size={20} /> : <List size={20} />}
              </button>
            </div>

            {viewMode === 'gallery' ? (
              <div className="grid grid-cols-3 gap-1.5">
                {allPhotos.map((p, i) => (
                  <button key={i} onClick={() => setFullscreenPhoto(p.url)} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      Sem {p.semana}
                    </span>
                  </button>
                ))}
                {allPhotos.length === 0 && (
                  <p className="col-span-3 text-center text-muted-foreground text-sm py-8">Nenhuma foto ainda</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((e: any) => (
                  <div key={e.id} className="glass-card p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Semana {e.semana} • {format(new Date(e.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                      {e.humor && <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{e.humor}</span>}
                    </div>
                    <p className="text-sm">{e.texto_livre}</p>
                    {((e.fotos as string[]) || []).length > 0 && (
                      <div className="flex gap-2 mt-2 overflow-x-auto">
                        {(e.fotos as string[]).map((url: string, i: number) => (
                          <button key={i} onClick={() => setFullscreenPhoto(url)} className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cartas">
            <Dialog open={cartaOpen} onOpenChange={setCartaOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gradient-hero text-primary-foreground rounded-xl mb-4"><Plus size={16} className="mr-2" /> Nova carta</Button>
              </DialogTrigger>
              <DialogContent className="glass-card-elevated max-w-sm">
                <DialogHeader><DialogTitle className="font-display text-xl">Carta para o bebê 💌</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Textarea placeholder="Querido(a) bebê..." value={cartaTexto} onChange={e => setCartaTexto(e.target.value)} className="rounded-xl min-h-[150px]" />
                  <Button onClick={() => addCarta.mutate()} disabled={!cartaTexto || addCarta.isPending} className="w-full gradient-hero text-primary-foreground rounded-xl">Enviar 💌</Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="space-y-3">
              {cartas.map((c: any) => (
                <div key={c.id} className="glass-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">Semana {c.semana} • {format(new Date(c.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                  <p className="text-sm italic">{c.texto}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />

      {/* Fullscreen photo viewer */}
      {fullscreenPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setFullscreenPhoto(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setFullscreenPhoto(null)}>
            <X size={28} />
          </button>
          {navigator.share && (
            <button className="absolute top-4 left-4 text-white" onClick={(e) => { e.stopPropagation(); sharePhoto(fullscreenPhoto); }}>
              <Share2 size={24} />
            </button>
          )}
          <img src={fullscreenPhoto} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
}
