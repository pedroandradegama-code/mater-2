import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import UpgradeModal from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Agenda() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ data: '', hora: '', tipo: 'pre-natal', medico: '', local: '', observacoes: '' });

  if (profile?.plano === 'free') {
    return (
      <div className="gradient-mesh-bg min-h-screen pb-20">
        <div className="app-container px-5 pt-6">
          <h1 className="font-display text-3xl font-semibold mb-4">Agenda</h1>
          <div className="glass-card p-8 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-display text-xl mb-2">Recurso Premium</p>
            <p className="text-sm text-muted-foreground mb-4">Gerencie suas consultas e exames com a agenda completa.</p>
            <Button onClick={() => setShowUpgrade(true)} className="gradient-hero text-primary-foreground rounded-xl">
              Desbloquear Mater Completo
            </Button>
          </div>
        </div>
        <BottomNav />
        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>
    );
  }

  const { data: consultas = [] } = useQuery({
    queryKey: ['consultas', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('consultas').select('*').eq('user_id', user!.id).order('data', { ascending: true });
      return data || [];
    },
    enabled: !!user,
  });

  const addConsulta = useMutation({
    mutationFn: async () => {
      const dateTime = new Date(`${form.data}T${form.hora || '00:00'}`).toISOString();
      const { error } = await supabase.from('consultas').insert({
        user_id: user!.id,
        data: dateTime,
        tipo: form.tipo,
        medico: form.medico || null,
        local: form.local || null,
        observacoes: form.observacoes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      setDialogOpen(false);
      setForm({ data: '', hora: '', tipo: 'pre-natal', medico: '', local: '', observacoes: '' });
      toast.success('Consulta adicionada!');
    },
  });

  const googleCalendarUrl = (c: any) => {
    const start = new Date(c.data);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(c.tipo)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(c.local || '')}&details=${encodeURIComponent(c.observacoes || '')}`;
  };

  return (
    <div className="gradient-mesh-bg min-h-screen pb-20">
      <div className="app-container px-5 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-3xl font-semibold">Agenda</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="gradient-hero text-primary-foreground rounded-full"><Plus size={20} /></Button>
            </DialogTrigger>
            <DialogContent className="glass-card-elevated max-w-sm">
              <DialogHeader><DialogTitle className="font-display text-xl">Nova Consulta</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} className="rounded-xl" />
                <Input type="time" value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} className="rounded-xl" />
                <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-natal">Pré-natal</SelectItem>
                    <SelectItem value="ultrassom">Ultrassom</SelectItem>
                    <SelectItem value="exame">Exame</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Médico" value={form.medico} onChange={e => setForm(f => ({ ...f, medico: e.target.value }))} className="rounded-xl" />
                <Input placeholder="Local" value={form.local} onChange={e => setForm(f => ({ ...f, local: e.target.value }))} className="rounded-xl" />
                <Textarea placeholder="Observações" value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} className="rounded-xl" />
                <Button onClick={() => addConsulta.mutate()} disabled={!form.data || addConsulta.isPending} className="w-full gradient-hero text-primary-foreground rounded-xl">
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {consultas.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">Nenhuma consulta cadastrada</p>
          )}
          {consultas.map((c: any) => (
            <div key={c.id} className="glass-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm capitalize">{c.tipo}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(c.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  {c.medico && <p className="text-xs text-muted-foreground">Dr(a). {c.medico}</p>}
                  {c.local && <p className="text-xs text-muted-foreground">📍 {c.local}</p>}
                </div>
                <a href={googleCalendarUrl(c)} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                  + Google Agenda
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
