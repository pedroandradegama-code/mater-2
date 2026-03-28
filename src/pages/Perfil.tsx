import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import BottomNav from '@/components/BottomNav';
import UpgradeModal from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LogOut, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { applyThemeForSex, parseLocalDate } from '@/lib/pregnancy-data';
import { DatePickerButton } from '@/components/WheelDatePicker';
import { supabase } from '@/integrations/supabase/client';

const KIWIFY_URL = 'https://pay.kiwify.com.br/yrK0rg9';

export default function Perfil() {
  const { signOut, user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [nome, setNome] = useState(profile?.nome || '');
  const [nomeBebe, setNomeBebe] = useState(profile?.nome_bebe || '');
  const [dum, setDum] = useState<Date | undefined>(profile?.dum ? parseLocalDate(profile.dum) : undefined);
  const [usgDate, setUsgDate] = useState<Date | undefined>(profile?.usg_1t_date ? parseLocalDate(profile.usg_1t_date) : undefined);
  const [dateRef, setDateRef] = useState(profile?.date_reference || 'dum');
  const [sexo, setSexo] = useState(profile?.sexo_bebe || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = profile?.avatar_url
    ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl
    : null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Máximo 5MB'); return; }
    setUploadingAvatar(true);
    try {
      const path = `${user.id}/avatar_${Date.now()}.jpg`;
      // Compress
      const img = new Image();
      const blob = await new Promise<Blob>((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(400 / img.width, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(b => resolve(b || file), 'image/jpeg', 0.85);
        };
        img.src = URL.createObjectURL(file);
      });
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
      if (uploadError) throw uploadError;
      await updateProfile.mutateAsync({ avatar_url: path } as any);
      toast.success('Foto atualizada!');
    } catch {
      toast.error('Erro ao enviar foto');
    }
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        nome,
        nome_bebe: nomeBebe || null,
        dum: dum ? format(dum, 'yyyy-MM-dd') : null,
        sexo_bebe: sexo || null,
        usg_1t_date: usgDate ? format(usgDate, 'yyyy-MM-dd') : null,
        date_reference: dateRef,
      } as any);
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

  const isPago = profile?.plano === 'pago';
  const initials = profile?.nome ? profile.nome.charAt(0).toUpperCase() : '?';

  return (
    <div className="gradient-mesh-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">
        <h1 className="font-display text-3xl font-semibold mb-6">Perfil</h1>

        {/* Avatar */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-semibold">{initials}</div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={20} className="text-white" />
              </div>
            </button>
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5 space-y-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground">Nome</label>
            <Input value={nome} onChange={e => setNome(e.target.value)} className="rounded-xl mt-1" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Data da última menstruação (DUM)</label>
            <div className="mt-1">
              <DatePickerButton value={dum} onChange={setDum} label="Selecione a data" title="Data da última menstruação" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Data pelo Ultrassom do 1º Trimestre</label>
            <div className="mt-1">
              <DatePickerButton value={usgDate} onChange={setUsgDate} label="Selecione a data (opcional)" title="Data pelo USG 1T" />
            </div>
          </div>

          {dum && usgDate && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Qual data usar para a idade gestacional?</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setDateRef('dum')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${dateRef === 'dum' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                  DUM
                </button>
                <button onClick={() => setDateRef('usg')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${dateRef === 'usg' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                  USG 1º Tri
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground">Sexo do bebê</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { value: 'menina', label: 'Menina 🎀' },
                { value: 'menino', label: 'Menino 💙' },
                { value: 'surpresa', label: 'Surpresa 🎁' },
              ].map(opt => (
                <button key={opt.value} onClick={() => { setSexo(opt.value); applyThemeForSex(opt.value); }}
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
              {isPago ? (
                <>
                  <Badge className="bg-primary/15 text-primary border-primary/30 mb-1">✦ Mater Completo</Badge>
                  <p className="text-xs text-muted-foreground">Acesso completo ativo</p>
                </>
              ) : (
                <Badge variant="secondary" className="mb-1">Plano Gratuito</Badge>
              )}
            </div>
            {!isPago && (
              <div className="text-right">
                <Button
                  onClick={() => window.open(KIWIFY_URL, '_blank')}
                  size="sm"
                  className="gradient-hero text-primary-foreground rounded-xl text-xs mb-1"
                >
                  Upgrade — R$ 19
                </Button>
                <p className="text-[10px] text-muted-foreground">Explore mais Recursos</p>
              </div>
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
