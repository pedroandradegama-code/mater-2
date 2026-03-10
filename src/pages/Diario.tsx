import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculatePregnancyInfo } from '@/lib/pregnancy-data';

const moods = [
  { emoji: '😊', label: 'Feliz' },
  { emoji: '😴', label: 'Cansada' },
  { emoji: '🤢', label: 'Enjoada' },
  { emoji: '💕', label: 'Ansiosa' },
  { emoji: '✨', label: 'Radiante' },
  { emoji: '😢', label: 'Emotiva' },
];

export default function Diario() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [diarioOpen, setDiarioOpen] = useState(false);
  const [cartaOpen, setCartaOpen] = useState(false);
  const [humor, setHumor] = useState('');
  const [texto, setTexto] = useState('');
  const [cartaTexto, setCartaTexto] = useState('');

  const currentWeek = profile?.dum ? calculatePregnancyInfo(new Date(profile.dum)).weeks : 0;

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

  const addEntry = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('diario').insert({
        user_id: user!.id,
        semana: currentWeek,
        humor,
        texto_livre: texto,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diario'] });
      setDiarioOpen(false);
      setHumor('');
      setTexto('');
      toast.success('Entrada salva! 💕');
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

  return (
    <div className="gradient-mesh-bg min-h-screen pb-20">
      <div className="app-container px-5 pt-6">
        <h1 className="font-display text-3xl font-semibold mb-4">Diário</h1>

        <Tabs defaultValue="diario">
          <TabsList className="w-full mb-4 rounded-xl">
            <TabsTrigger value="diario" className="flex-1 rounded-lg">📖 Diário</TabsTrigger>
            <TabsTrigger value="cartas" className="flex-1 rounded-lg">💌 Cartas</TabsTrigger>
          </TabsList>

          <TabsContent value="diario">
            <Dialog open={diarioOpen} onOpenChange={setDiarioOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gradient-hero text-primary-foreground rounded-xl mb-4"><Plus size={16} className="mr-2" /> Nova entrada</Button>
              </DialogTrigger>
              <DialogContent className="glass-card-elevated max-w-sm">
                <DialogHeader><DialogTitle className="font-display text-xl">Como você está?</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {moods.map(m => (
                      <button key={m.label} onClick={() => setHumor(m.label)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${humor === m.label ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                        {m.emoji} {m.label}
                      </button>
                    ))}
                  </div>
                  <Textarea placeholder="Como foi seu dia?" value={texto} onChange={e => setTexto(e.target.value)} className="rounded-xl min-h-[120px]" />
                  <Button onClick={() => addEntry.mutate()} disabled={addEntry.isPending} className="w-full gradient-hero text-primary-foreground rounded-xl">Salvar</Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="space-y-3">
              {entries.map((e: any) => (
                <div key={e.id} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Semana {e.semana} • {format(new Date(e.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                    {e.humor && <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{e.humor}</span>}
                  </div>
                  <p className="text-sm">{e.texto_livre}</p>
                </div>
              ))}
            </div>
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
    </div>
  );
}
