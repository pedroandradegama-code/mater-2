import { useState, useEffect, useRef } from 'react';
import { useProfile } from '@/hooks/useProfile';
import BottomNav from '@/components/BottomNav';
import { calculatePregnancyInfo, chineseTable, getZodiacSign } from '@/lib/pregnancy-data';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DatePickerButton } from '@/components/WheelDatePicker';

const calculators = [
  { id: 'idade', title: 'Idade Gestacional', emoji: '📅' },
  { id: 'meses', title: 'Semanas → Meses', emoji: '🗓️' },
  { id: 'fertil', title: 'Período Fértil', emoji: '🌸' },
  { id: 'imc', title: 'IMC Gestacional', emoji: '⚖️' },
  { id: 'hidratacao', title: 'Hidratação', emoji: '💧' },
  { id: 'chinesa', title: 'Tabela Chinesa', emoji: '🇨🇳' },
  { id: 'signos', title: 'Signos', emoji: '⭐' },
  { id: 'ultrassom', title: 'Melhor 3D/4D', emoji: '📸' },
  { id: 'contracoes', title: 'Contrações', emoji: '⏱️' },
  { id: 'contagem', title: 'Contagem Regressiva', emoji: '⏳' },
];

export default function Calculadoras() {
  const [selected, setSelected] = useState<string | null>(null);
  const [gemelar, setGemelar] = useState(false);
  const { profile } = useProfile();

  if (selected) {
    return (
      <div className="gradient-mesh-bg min-h-screen pb-20">
        <div className="app-container px-5 pt-6">
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <ArrowLeft size={16} /> Voltar
          </button>
          <CalculatorView id={selected} profile={profile} gemelar={gemelar} />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="gradient-mesh-bg min-h-screen pb-20">
      <div className="app-container px-5 pt-6">
        <h1 className="font-display text-3xl font-semibold mb-4">Calculadoras</h1>
        <div className="flex items-center gap-3 mb-4 glass-card p-3">
          <Switch id="gemelar" checked={gemelar} onCheckedChange={setGemelar} />
          <Label htmlFor="gemelar" className="text-sm">Gestação gemelar?</Label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {calculators.map(calc => (
            <button
              key={calc.id}
              onClick={() => setSelected(calc.id)}
              className="glass-card p-4 text-left hover:scale-[1.02] transition-transform"
            >
              <div className="text-2xl mb-2">{calc.emoji}</div>
              <div className="text-sm font-medium">{calc.title}</div>
            </button>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function CalculatorView({ id, profile, gemelar }: { id: string; profile: any; gemelar: boolean }) {
  const dum = profile?.dum ? new Date(profile.dum) : undefined;
  switch (id) {
    case 'idade': return <IdadeGestacional dum={dum} gemelar={gemelar} />;
    case 'meses': return <SemanasMeses />;
    case 'fertil': return <PeriodoFertil dum={dum} />;
    case 'imc': return <IMCGestacional dum={dum} gemelar={gemelar} />;
    case 'hidratacao': return <Hidratacao />;
    case 'chinesa': return <TabelaChinesa dum={dum} />;
    case 'signos': return <Signos dum={dum} />;
    case 'ultrassom': return <Ultrassom dum={dum} />;
    case 'contracoes': return <Contracoes />;
    case 'contagem': return <ContagemRegressiva dum={dum} gemelar={gemelar} />;
    default: return null;
  }
}

function IdadeGestacional({ dum: defaultDum, gemelar }: { dum?: Date; gemelar: boolean }) {
  const [dum, setDum] = useState<Date | undefined>(defaultDum);

  if (!dum) return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Data da última menstruação</p>
      <DatePickerButton value={dum} onChange={setDum} label="Selecione a data" />
    </div>
  );

  const info = calculatePregnancyInfo(dum);
  const dppAdjusted = gemelar ? addDays(info.dpp, -14) : info.dpp;
  const daysRemainingAdjusted = gemelar ? Math.max(0, info.daysRemaining - 14) : info.daysRemaining;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-display text-2xl font-semibold">Idade Gestacional</h2>
      <div className="glass-card p-5 space-y-3">
        <ResultRow label="Idade" value={`${info.weeks} semanas e ${info.days} dias`} />
        <ResultRow label="Trimestre" value={`${info.trimester}º trimestre`} />
        <ResultRow label="DPP" value={format(dppAdjusted, "dd/MM/yyyy")} />
        <ResultRow label="Progresso" value={`${Math.round(info.progress)}%`} />
        <ResultRow label="Dias restantes" value={`${daysRemainingAdjusted} dias`} />
        {gemelar && <p className="text-xs text-muted-foreground">* DPP ajustada para gestação gemelar (-2 semanas)</p>}
      </div>
    </div>
  );
}

function SemanasMeses() {
  const [weeks, setWeeks] = useState([20]);
  const month = Math.ceil(weeks[0] / 4.33);
  const trimester = weeks[0] < 13 ? 1 : weeks[0] < 27 ? 2 : 3;
  const descriptions = ['Início da formação', 'Órgãos se desenvolvendo', 'Crescimento e maturação', 'Fase de amadurecimento', 'Desenvolvimento avançado', 'Preparação para o nascimento', 'Desenvolvimento sensorial', 'Ganho de peso acelerado', 'Posição de nascimento', 'Pronto para nascer!'];

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-display text-2xl font-semibold">Semanas → Meses</h2>
      <div className="glass-card p-5 space-y-4">
        <p className="text-center text-3xl font-display font-bold">{weeks[0]} semanas</p>
        <Slider value={weeks} onValueChange={setWeeks} min={1} max={40} step={1} />
        <ResultRow label="Mês gestacional" value={`${month}º mês`} />
        <ResultRow label="Trimestre" value={`${trimester}º trimestre`} />
        <ResultRow label="Fase" value={descriptions[Math.min(Math.floor((weeks[0] - 1) / 4), 9)]} />
      </div>
    </div>
  );
}

function PeriodoFertil({ dum }: { dum?: Date }) {
  const [dumDate, setDumDate] = useState<Date | undefined>(dum);
  const [ciclo, setCiclo] = useState(28);

  if (!dumDate) return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Data da última menstruação</p>
      <DatePickerButton value={dumDate} onChange={setDumDate} label="Selecione a data" />
    </div>
  );

  const ovulation = addDays(dumDate, ciclo - 14);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);
  const daysUntil = Math.max(0, Math.ceil((ovulation.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-display text-2xl font-semibold">Período Fértil</h2>
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">Duração do ciclo:</span>
          <Input type="number" value={ciclo} onChange={e => setCiclo(Number(e.target.value))} className="w-20 rounded-xl text-center" />
          <span className="text-sm">dias</span>
        </div>
        <ResultRow label="Próxima ovulação" value={format(ovulation, "dd/MM/yyyy")} />
        <ResultRow label="Janela fértil" value={`${format(fertileStart, "dd/MM")} a ${format(fertileEnd, "dd/MM")}`} />
        <ResultRow label="Dias até ovulação" value={`${daysUntil} dias`} />
      </div>
    </div>
  );
}

function IMCGestacional({ dum, gemelar }: { dum?: Date; gemelar: boolean }) {
  const [pesoAntes, setPesoAntes] = useState('');
  const [altura, setAltura] = useState('');
  const [pesoAtual, setPesoAtual] = useState('');
  const weeks = dum ? calculatePregnancyInfo(dum).weeks : 0;

  const imcPre = pesoAntes && altura ? Number(pesoAntes) / Math.pow(Number(altura) / 100, 2) : 0;
  const ganhoAtual = pesoAtual && pesoAntes ? Number(pesoAtual) - Number(pesoAntes) : 0;

  let classificacao = '';
  let ganhoRecomendado = '';
  if (imcPre < 18.5) { classificacao = 'Abaixo do peso'; ganhoRecomendado = gemelar ? '22.7-28.1 kg' : '12.5-18 kg'; }
  else if (imcPre < 25) { classificacao = 'Peso normal'; ganhoRecomendado = gemelar ? '16.8-24.5 kg' : '11.5-16 kg'; }
  else if (imcPre < 30) { classificacao = 'Sobrepeso'; ganhoRecomendado = gemelar ? '14.1-22.7 kg' : '7-11.5 kg'; }
  else { classificacao = 'Obesidade'; ganhoRecomendado = gemelar ? '11.3-19.1 kg' : '5-9 kg'; }

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-display text-2xl font-semibold">IMC Gestacional</h2>
      <div className="glass-card p-5 space-y-3">
        <Input placeholder="Peso pré-gestacional (kg)" type="number" value={pesoAntes} onChange={e => setPesoAntes(e.target.value)} className="rounded-xl" />
        <Input placeholder="Altura (cm)" type="number" value={altura} onChange={e => setAltura(e.target.value)} className="rounded-xl" />
        <Input placeholder="Peso atual (kg)" type="number" value={pesoAtual} onChange={e => setPesoAtual(e.target.value)} className="rounded-xl" />
        {imcPre > 0 && (
          <div className="space-y-2 pt-2">
            <ResultRow label="IMC pré-gestacional" value={imcPre.toFixed(1)} />
            <ResultRow label="Classificação" value={classificacao} />
            <ResultRow label="Ganho atual" value={`${ganhoAtual.toFixed(1)} kg`} />
            <ResultRow label="Ganho recomendado" value={ganhoRecomendado} />
          </div>
        )}
      </div>
    </div>
  );
}

function Hidratacao() {
  const [peso, setPeso] = useState('');
  const litros = peso ? (Number(peso) * 35 / 1000) : 0;
  const copos = Math.ceil(litros * 1000 / 250);

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-display text-2xl font-semibold">Hidratação</h2>
      <div className="glass-card p-5 space-y-3">
        <Input placeholder="Peso atual (kg)" type="number" value={peso} onChange={e => setPeso(e.target.value)} className="rounded-xl" />
        {litros > 0 && (
          <>
            <ResultRow label="Meta diária" value={`${litros.toFixed(1)} litros`} />
            <ResultRow label="Copos de 250ml" value={`${copos} copos 🥤`} />
          </>
        )}
      </div>
    </div>
  );
}

function TabelaChinesa({ dum }: { dum?: Date }) {
  const [birthDate, setBirthDate] = useState<Date>();
  const [conceptionDate, setConceptionDate] = useState<Date | undefined>(dum ? addDays(dum, 14) : undefined);
  const [step, setStep] = useState<'birth' | 'conception' | 'result'>(dum ? 'birth' : 'birth');

  if (!birthDate) return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-display text-2xl font-semibold">Tabela Chinesa</h2>
      <p className="text-sm text-muted-foreground">Data de nascimento da mãe</p>
      <DatePickerButton value={birthDate} onChange={(d) => { setBirthDate(d); }} label="Data de nascimento" title="Nascimento da mãe" minYear={1950} maxYear={2010} />
    </div>
  );

  if (!conceptionDate) return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-display text-2xl font-semibold">Tabela Chinesa</h2>
      <p className="text-sm text-muted-foreground">Data da concepção (ou DUM + 14 dias)</p>
      <DatePickerButton value={conceptionDate} onChange={setConceptionDate} label="Data da concepção" title="Data da concepção" minYear={2020} maxYear={2030} />
    </div>
  );

  // Lunar age: current year - birth year + 1
  const lunarAge = conceptionDate.getFullYear() - birthDate.getFullYear() + 1;
  const lunarMonth = conceptionDate.getMonth() + 1;
  const result = chineseTable[lunarAge]?.[lunarMonth];

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-display text-2xl font-semibold">Tabela Chinesa</h2>
      <div className="glass-card p-6 text-center space-y-4">
        <p className="text-sm text-muted-foreground">Idade lunar: {lunarAge} anos | Mês lunar: {lunarMonth}</p>
        {result ? (
          <div>
            <div className="text-6xl mb-3">
              {result === 'menina' ? '👧🎀' : '👦💙'}
            </div>
            <p className="font-display text-2xl font-bold capitalize text-primary">{result === 'menina' ? 'MENINA 🎀' : 'MENINO 💙'}</p>
          </div>
        ) : (
          <p className="text-muted-foreground">Idade fora do intervalo da tabela (18-45 anos)</p>
        )}
        <p className="text-xs text-muted-foreground italic">Método tradicional sem base científica — apenas por diversão! 😄</p>
        <Button variant="outline" onClick={() => { setBirthDate(undefined); setConceptionDate(dum ? addDays(dum, 14) : undefined); }} className="rounded-xl text-sm">
          Recalcular
        </Button>
      </div>
    </div>
  );
}

function Signos({ dum }: { dum?: Date }) {
  const [dadBirth, setDadBirth] = useState<Date>();
  const dpp = dum ? addDays(dum, 280) : undefined;

  const babySign = dpp ? getZodiacSign(dpp) : null;
  const dadSign = dadBirth ? getZodiacSign(dadBirth) : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-display text-2xl font-semibold">Signos</h2>
      <div className="glass-card p-5 space-y-4">
        {babySign && (
          <div className="text-center">
            <p className="text-3xl">{babySign.emoji}</p>
            <p className="font-display text-xl font-semibold">{babySign.name}</p>
            <p className="text-sm text-muted-foreground">{babySign.desc}</p>
            <p className="text-xs text-muted-foreground mt-1">Baseado na DPP: {dpp && format(dpp, "dd/MM/yyyy")}</p>
          </div>
        )}
        <div className="border-t border-border pt-3">
          <p className="text-sm text-muted-foreground mb-2 text-center">Signo do pai (opcional)</p>
          <DatePickerButton value={dadBirth} onChange={setDadBirth} label="Data de nascimento do pai" title="Nascimento do pai" minYear={1950} maxYear={2010} />
          {dadSign && (
            <div className="text-center mt-3">
              <p className="text-2xl">{dadSign.emoji}</p>
              <p className="font-semibold">{dadSign.name}</p>
              <p className="text-xs text-muted-foreground">{dadSign.desc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Ultrassom({ dum }: { dum?: Date }) {
  const weeks = dum ? calculatePregnancyInfo(dum).weeks : 0;

  let color = 'bg-destructive';
  let label = 'Cedo demais';
  let desc = 'Aguarde pelo menos a 24ª semana para um resultado melhor.';
  if (weeks >= 24 && weeks <= 28) { color = 'bg-green-500'; label = 'Ótimo momento!'; desc = 'Melhor período para o ultrassom 3D/4D. Rosto e feições bem definidos.'; }
  else if (weeks >= 29 && weeks <= 32) { color = 'bg-yellow-500'; label = 'Bom momento'; desc = 'Ainda é possível ter boas imagens, mas o espaço começa a diminuir.'; }
  else if (weeks >= 33 && weeks <= 36) { color = 'bg-orange-500'; label = 'Razoável'; desc = 'As imagens podem ser limitadas pelo espaço reduzido.'; }
  else if (weeks > 36) { color = 'bg-destructive'; label = 'Difícil'; desc = 'Pouco espaço para boas imagens. Consulte seu médico.'; }

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-display text-2xl font-semibold">Melhor Momento 3D/4D</h2>
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${color}`} />
          <span className="font-semibold">{label}</span>
        </div>
        <p className="text-sm text-muted-foreground">{desc}</p>
        <p className="text-xs text-muted-foreground">Semana atual: {weeks}</p>
      </div>
    </div>
  );
}

function Contracoes() {
  const [contractions, setContractions] = useState<{ time: Date; duration?: number; interval?: number }[]>([]);
  const [isActive, setIsActive] = useState(false);
  const startRef = useRef<Date | null>(null);

  const handlePress = () => {
    if (!isActive) {
      startRef.current = new Date();
      setIsActive(true);
    } else {
      const now = new Date();
      const duration = startRef.current ? Math.round((now.getTime() - startRef.current.getTime()) / 1000) : 0;
      const lastContraction = contractions[0];
      const interval = lastContraction ? Math.round((now.getTime() - lastContraction.time.getTime()) / 1000 / 60) : undefined;
      setContractions(prev => [{ time: now, duration, interval }, ...prev].slice(0, 5));
      setIsActive(false);
      startRef.current = null;
    }
  };

  const frequentContractions = contractions.filter(c => c.interval && c.interval < 5).length >= 3;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-display text-2xl font-semibold">Contador de Contrações</h2>
      <div className="flex flex-col items-center">
        <button
          onClick={handlePress}
          className={`w-32 h-32 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg transition-all ${isActive ? 'bg-destructive scale-110 animate-pulse' : 'gradient-hero hover:scale-105'}`}
        >
          {isActive ? 'Soltar' : 'Registrar'}
        </button>
      </div>
      {contractions.length > 0 && (
        <div className="glass-card p-4 space-y-2">
          {contractions.map((c, i) => (
            <div key={i} className="flex justify-between text-sm py-1 border-b border-border/50 last:border-0">
              <span>{format(c.time, 'HH:mm:ss')}</span>
              <span>{c.duration}s</span>
              <span>{c.interval ? `${c.interval}min` : '-'}</span>
            </div>
          ))}
        </div>
      )}
      {frequentContractions && (
        <div className="glass-card p-4 bg-destructive/10 border-destructive/30">
          <p className="text-sm font-semibold text-destructive">⚠️ Contrações frequentes! Considere ir à maternidade.</p>
        </div>
      )}
    </div>
  );
}

function ContagemRegressiva({ dum, gemelar }: { dum?: Date; gemelar: boolean }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!dum) return <p className="text-muted-foreground text-center">DUM não informada</p>;

  const dpp = addDays(dum, gemelar ? 266 : 280);
  const diff = dpp.getTime() - now.getTime();
  if (diff <= 0) return <p className="text-center text-2xl">🎉 O grande dia chegou!</p>;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-display text-2xl font-semibold text-center">Contagem Regressiva</h2>
      <div className="glass-card p-6">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { value: days, label: 'dias' },
            { value: hours, label: 'horas' },
            { value: minutes, label: 'min' },
            { value: seconds, label: 'seg' },
          ].map(item => (
            <div key={item.label}>
              <div className="text-3xl font-display font-bold text-primary">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
