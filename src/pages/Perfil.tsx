import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import BottomNav from '@/components/BottomNav';
import UpgradeModal from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getHueForSex } from '@/lib/pregnancy-data';

export default function Perfil() {
  const { signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [nome, setNome] = useState(profile?.nome || '');
  const [nomeBebe, setNomeBebe] = useState(profile?.nome_bebe || '');
  const [dum, setDum] = useState<Date | undefined>(profile?.dum ? new Date(profile.dum) : undefined);
  const [sexo, setSexo] = useState(profile?.sexo_bebe || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        nome,
        nome_bebe: nomeBebe || null,
        dum: dum ? format(dum, 'yyyy-MM-dd') : null,
        sexo_bebe: sexo || null,
      });
      toast.success('Perfil atualizado!');
    } catch {
      toast.error('Erro ao salvar');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="gradient-mesh-bg min-h-screen pb-20">
      <div className="app-container px-5 pt-6">
        <h1 className="font-display text-3xl font-semibold mb-6">Perfil</h1>

        <div className="glass-card p-5 space-y-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground">Nome</label>
            <Input value={nome} onChange={e => setNome(e.target.value)} className="rounded-xl mt-1" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Data da última menstruação</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full rounded-xl justify-start mt-1", !dum && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dum ? format(dum, "dd/MM/yyyy") : 'Selecione'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar mode="single" selected={dum} onSelect={setDum} locale={ptBR} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Sexo do bebê</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { value: 'menina', label: 'Menina 🎀' },
                { value: 'menino', label: 'Menino 💙' },
                { value: 'surpresa', label: 'Surpresa 🎁' },
              ].map(opt => (
                <button key={opt.value} onClick={() => { setSexo(opt.value); document.documentElement.style.setProperty('--hue', String(getHueForSex(opt.value))); }}
                  className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${sexo === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Nome do bebê</label>
            <Input value={nomeBebe} onChange={e => setNomeBebe(e.target.value)} placeholder="Ainda estamos escolhendo" className="rounded-xl mt-1" />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full gradient-hero text-primary-foreground rounded-xl">
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>

        {/* Plan info */}
        <div className="glass-card p-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Plano {profile?.plano === 'pago' ? 'Completo ✨' : 'Gratuito'}</p>
              <p className="text-xs text-muted-foreground">{profile?.plano === 'pago' ? 'Acesso total' : 'Recursos limitados'}</p>
            </div>
            {profile?.plano === 'free' && (
              <Button onClick={() => setShowUpgrade(true)} size="sm" className="gradient-hero text-primary-foreground rounded-xl text-xs">
                Upgrade
              </Button>
            )}
          </div>
        </div>

        <Button variant="outline" onClick={handleLogout} className="w-full rounded-xl text-destructive border-destructive/30">
          <LogOut size={16} className="mr-2" /> Sair da conta
        </Button>
      </div>
      <BottomNav />
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
