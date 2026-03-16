import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { applyThemeForSex } from '@/lib/pregnancy-data';
import { DatePickerButton } from '@/components/WheelDatePicker';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState('');
  const [dum, setDum] = useState<Date>();
  const [naoSeiDum, setNaoSeiDum] = useState(false);
  const [sexo, setSexo] = useState('');
  const [nomeBebe, setNomeBebe] = useState('');
  const { updateProfile } = useProfile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSexSelect = (sex: string) => {
    setSexo(sex);
    applyThemeForSex(sex);
  };

  const handleComplete = async () => {
    if (!nome || !sexo) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    if (!naoSeiDum && !dum) {
      toast.error('Preencha a data da última menstruação ou marque "Não sei"');
      return;
    }
    try {
      const updates = {
        nome,
        dum: dum ? format(dum, 'yyyy-MM-dd') : null,
        sexo_bebe: sexo,
        nome_bebe: nomeBebe || null,
        onboarding_completed: true,
      };
      await updateProfile.mutateAsync(updates);
      // Optimistically update profile cache to prevent redirect loop
      queryClient.setQueryData(['profile', user?.id], (old: any) => ({
        ...old,
        ...updates,
      }));
      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('Erro ao salvar perfil');
    }
  };

  return (
    <div className="gradient-mesh-bg min-h-screen flex items-center justify-center p-6">
      <div className="glass-card-elevated w-full max-w-sm p-8 animate-fade-in">
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${s <= step ? 'w-8 bg-primary' : 'w-4 bg-border'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display text-3xl text-center">Qual o seu nome?</h2>
            <Input placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} className="rounded-xl text-center text-lg" />
            <Button onClick={() => nome && setStep(2)} disabled={!nome} className="w-full gradient-hero text-primary-foreground rounded-xl">
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display text-3xl text-center">Data da última menstruação</h2>
            {!naoSeiDum && (
              <DatePickerButton value={dum} onChange={setDum} label="Selecione a data" title="Data da última menstruação" />
            )}
            <button
              onClick={() => { setNaoSeiDum(!naoSeiDum); if (!naoSeiDum) setDum(undefined); }}
              className={`w-full py-3 px-4 rounded-xl text-sm transition-all border ${
                naoSeiDum
                  ? 'bg-primary/10 border-primary text-primary font-medium'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {naoSeiDum ? '✓ ' : ''}Não sei minha DUM
            </button>
            {naoSeiDum && (
              <p className="text-xs text-muted-foreground text-center">
                Sem problemas! Você pode adicionar depois no seu perfil.
              </p>
            )}
            <Button
              onClick={() => (dum || naoSeiDum) && setStep(3)}
              disabled={!dum && !naoSeiDum}
              className="w-full gradient-hero text-primary-foreground rounded-xl"
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display text-3xl text-center">Sexo do bebê?</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'menina', label: 'Menina', emoji: '🎀' },
                { value: 'menino', label: 'Menino', emoji: '💙' },
                { value: 'surpresa', label: 'Surpresa', emoji: '🎁' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSexSelect(opt.value)}
                  className={`glass-card p-4 text-center transition-all hover:scale-105 ${
                    sexo === opt.value ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                >
                  <div className="text-3xl mb-2">{opt.emoji}</div>
                  <div className="text-sm font-medium">{opt.label}</div>
                </button>
              ))}
            </div>
            <Button onClick={() => sexo && setStep(4)} disabled={!sexo} className="w-full gradient-hero text-primary-foreground rounded-xl">
              Continuar
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display text-3xl text-center">Nome do bebê</h2>
            <Input
              placeholder="Ainda estamos escolhendo"
              value={nomeBebe}
              onChange={e => setNomeBebe(e.target.value)}
              className="rounded-xl text-center text-lg"
            />
            <Button onClick={handleComplete} disabled={updateProfile.isPending} className="w-full gradient-hero text-primary-foreground rounded-xl">
              {updateProfile.isPending ? 'Salvando...' : 'Começar! 🎉'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
