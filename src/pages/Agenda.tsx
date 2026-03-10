import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { DatePickerButton } from '@/components/WheelDatePicker';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

export default function Agenda() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formDate, setFormDate] = useState<Date | undefined>();
  const [hora, setHora] = useState('09');
  const [minuto, setMinuto] = useState('00');
  const [form, setForm] = useState({ tipo: 'pre-natal', medico: '', local: '', observacoes: '' });

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
      if (!formDate) throw new Error('Data obrigatória');
      const dateStr = format(formDate, 'yyyy-MM-dd');
      const dateTime = new Date(`${dateStr}T${hora}:${minuto}:00`).toISOString();
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
      setFormDate(undefined);
      setHora('09');
      setMinuto('00');
      setForm({ tipo: 'pre-natal', medico: '', local: '', observacoes: '' });
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
    <div className="gradient-mesh-bg min-h-screen pb-24">
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
                <DatePickerButton value={formDate} onChange={setFormDate} label="Data da consulta" minYear={2024} maxYear={2030} />
                
                {/* Time picker with selects */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Hora</label>
                    <Select value={hora} onValueChange={setHora}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {HOURS.map(h => <SelectItem key={h} value={h}>{h}h</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Minuto</label>
                    <Select value={minuto} onValueChange={setMinuto}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MINUTES.map(m => <SelectItem key={m} value={m}>{m}min</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                <Button onClick={() => addConsulta.mutate()} disabled={!formDate || addConsulta.isPending} className="w-full gradient-hero text-primary-foreground rounded-xl">
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