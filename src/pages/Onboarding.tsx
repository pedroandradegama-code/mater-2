import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { getHueForSex } from '@/lib/pregnancy-data';
import { DatePickerButton } from '@/components/WheelDatePicker';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState('');
  const [dum, setDum] = useState<Date>();
  const [sexo, setSexo] = useState('');
  const [nomeBebe, setNomeBebe] = useState('');
  const { updateProfile } = useProfile();
  const navigate = useNavigate();

  const handleSexSelect = (sex: string) => {
    setSexo(sex);
    document.documentElement.style.setProperty('--hue', String(getHueForSex(sex)));
  };

  const handleComplete = async () => {
    if (!nome || !dum || !sexo) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    try {
      await updateProfile.mutateAsync({
        nome,
        dum: format(dum, 'yyyy-MM-dd'),
        sexo_bebe: sexo,
        nome_bebe: nomeBebe || null,
        onboarding_completed: true,
      });
      navigate('/dashboard');
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
            <DatePickerButton value={dum} onChange={setDum} label="Selecione a data" title="Data da última menstruação" />
            <Button onClick={() => dum && setStep(3)} disabled={!dum} className="w-full gradient-hero text-primary-foreground rounded-xl">
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
