import { useState, useEffect, useRef } from 'react';
import { useProfile } from '@/hooks/useProfile';
import BottomNav from '@/components/BottomNav';
import { calculatePregnancyInfo, chineseTable, getZodiacSign, parseLocalDate } from '@/lib/pregnancy-data';
import { zodiacDetails, getTrioPhrase } from '@/lib/zodiac-data';
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

// Custom SVG icon components for a more authorial feel
function IconCalendarPregnancy({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="36" height="32" rx="6" stroke="currentColor" strokeWidth="2.5" fill="hsl(var(--primary) / 0.1)" />
      <path d="M6 20h36" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="6" r="2" fill="currentColor" />
      <circle cx="32" cy="6" r="2" fill="currentColor" />
      <path d="M16 4v8M32 4v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="31" r="6" fill="hsl(var(--primary) / 0.2)" stroke="currentColor" strokeWidth="2" />
      <path d="M24 28v6M21 31h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconMonthWheel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" fill="hsl(var(--primary) / 0.08)" />
      <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
      <path d="M24 6v4M24 38v4M6 24h4M38 24h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="3" fill="hsl(var(--primary) / 0.4)" />
    </svg>
  );
}

function IconFertility({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 8c-6 0-12 6-12 14s6 18 12 18 12-10 12-18S30 8 24 8z" fill="hsl(var(--primary) / 0.12)" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="4" fill="hsl(var(--primary) / 0.3)" stroke="currentColor" strokeWidth="2" />
      <path d="M24 4v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 10l2 2M30 10l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconScale({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="30" width="28" height="12" rx="6" stroke="currentColor" strokeWidth="2.5" fill="hsl(var(--primary) / 0.1)" />
      <circle cx="24" cy="20" r="10" stroke="currentColor" strokeWidth="2.5" fill="hsl(var(--primary) / 0.08)" />
      <path d="M19 20h10M24 15v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconDroplet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 6C24 6 10 22 10 30a14 14 0 0028 0C38 22 24 6 24 6z" fill="hsl(var(--primary) / 0.15)" stroke="currentColor" strokeWidth="2.5" />
      <path d="M20 28c0-4 4-10 4-10" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function IconYinYang({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24 6A18 18 0 0024 42a9 9 0 010-18 9 9 0 000-18z" fill="hsl(var(--primary) / 0.2)" />
      <circle cx="24" cy="15" r="3" fill="currentColor" />
      <circle cx="24" cy="33" r="3" fill="hsl(var(--primary) / 0.3)" />
    </svg>
  );
}

function IconStars({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9z" fill="hsl(var(--primary) / 0.2)" stroke="currentColor" strokeWidth="2" />
      <path d="M38 20l1.5 4.5h4.5l-3.5 2.5 1.5 4.5-4-3-4 3 1.5-4.5-3.5-2.5h4.5z" fill="hsl(var(--primary) / 0.15)" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="36" r="4" fill="hsl(var(--primary) / 0.1)" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconUltrasound({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="36" height="28" rx="6" stroke="currentColor" strokeWidth="2.5" fill="hsl(var(--primary) / 0.08)" />
      <ellipse cx="24" cy="22" rx="10" ry="8" fill="hsl(var(--primary) / 0.15)" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20c2-3 6-3 8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="14" y="38" width="20" height="4" rx="2" fill="hsl(var(--primary) / 0.1)" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconPulse({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" fill="hsl(var(--primary) / 0.06)" />
      <path d="M8 24h8l4-10 4 20 4-14 4 8h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHourglass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 6h20v10L24 24l10 8v10H14V32l10-8-10-8V6z" fill="hsl(var(--primary) / 0.1)" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="12" y="4" width="24" height="4" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="12" y="40" width="24" height="4" rx="2" fill="currentColor" opacity="0.2" />
      <path d="M20 38h8" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const calculators = [
  { id: 'idade', title: 'Idade Gestacional', desc: 'Semanas, dias e DPP', icon: IconCalendarPregnancy, featured: true },
  { id: 'meses', title: 'Semanas → Meses', desc: 'Converta semanas em meses', icon: IconMonthWheel },
  { id: 'fertil', title: 'Período Fértil', desc: 'Janela fértil e ovulação', icon: IconFertility },
  { id: 'imc', title: 'IMC Gestacional', desc: 'Peso e ganho recomendado', icon: IconScale },
  { id: 'hidratacao', title: 'Hidratação', desc: 'Meta diária de água', icon: IconDroplet },
  { id: 'chinesa', title: 'Tabela Chinesa', desc: 'Menino ou menina?', icon: IconYinYang },
  { id: 'signos', title: 'Signos', desc: 'Signo do bebê pela DPP', icon: IconStars },
  { id: 'ultrassom', title: 'Melhor 3D/4D', desc: 'Momento ideal do ultrassom', icon: IconUltrasound },
  { id: 'contracoes', title: 'Contrações', desc: 'Registre duração e intervalo', icon: IconPulse },
  { id: 'contagem', title: 'Contagem Regressiva', desc: 'Quanto falta pro grande dia', icon: IconHourglass },
];

export default function Calculadoras() {
  const [selected, setSelected] = useState<string | null>(null);
  const [gemelar, setGemelar] = useState(false);
  const { profile } = useProfile();

  if (selected) {
    return (
      <div className="gradient-mesh-bg min-h-screen pb-24">
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
    <div className="gradient-mesh-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">
        <h1 className="font-display text-3xl font-semibold mb-4">Calculadoras</h1>
        <div className="flex items-center gap-3 mb-4 glass-card p-3">
          <Switch id="gemelar" checked={gemelar} onCheckedChange={setGemelar} />
          <Label htmlFor="gemelar" className="text-sm">Gestação gemelar?</Label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {calculators.map(calc => {
            const IconComp = calc.icon;
            return (
              <button
                key={calc.id}
                onClick={() => setSelected(calc.id)}
                className={`glass-card p-4 text-left hover:scale-[1.02] transition-transform ${
                  calc.featured ? 'col-span-2' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <IconComp className="w-10 h-10 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{calc.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{calc.desc}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function CalculatorView({ id, profile, gemelar }: { id: string; profile: any; gemelar: boolean }) {
  const dum = profile?.dum ? parseLocalDate(profile.dum) : undefined;
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
        <p className="text-xs text-muted-foreground -mt-1 text-right">(Data Provável do Parto)</p>
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

function SignCard({ title, sign, compatWith }: { title: string; sign: ReturnType<typeof getZodiacSign>; compatWith?: string }) {
  const detail = zodiacDetails[sign.name];
  if (!detail) return null;
  const compat = compatWith ? detail.compatibility[compatWith] : null;
  return (
    <div className="glass-card p-4 space-y-2">
      <p className="text-xs text-muted-foreground">{title}</p>
      <div className="flex items-center gap-2">
        <span className="text-3xl">{detail.emoji}</span>
        <div>
          <p className="font-display text-lg font-semibold">{detail.name}</p>
          <p className="text-xs text-muted-foreground">{detail.dates}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span>{detail.elementIcon} {detail.element}</span>
        <span className="text-muted-foreground">•</span>
        <span>🪐 {detail.planet}</span>
      </div>
      <ul className="space-y-1">
        {detail.traits.map((t, i) => (
          <li key={i} className="text-xs flex items-start gap-1.5">
            <span className="text-primary mt-0.5">✦</span> {t}
          </li>
        ))}
      </ul>
      {compat && (
        <div className="border-t border-border pt-2 mt-2">
          <p className="text-xs font-medium">
            {compat.icon} Compatibilidade {compat.level === 'otima' ? 'ótima' : compat.level === 'boa' ? 'boa' : 'desafiadora'}
          </p>
          <p className="text-xs text-muted-foreground">{compat.phrase}</p>
        </div>
      )}
    </div>
  );
}

function Signos({ dum }: { dum?: Date }) {
  const [momBirth, setMomBirth] = useState<Date>();
  const [dadBirth, setDadBirth] = useState<Date>();
  const dpp = dum ? addDays(dum, 280) : undefined;

  const babySign = dpp ? getZodiacSign(dpp) : null;
  const momSign = momBirth ? getZodiacSign(momBirth) : null;
  const dadSign = dadBirth ? getZodiacSign(dadBirth) : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-display text-2xl font-semibold">Signos</h2>

      {babySign && (
        <SignCard title="👶 Signo do bebê" sign={babySign} />
      )}
      {babySign && (
        <p className="text-xs text-muted-foreground text-center">Baseado na DPP: {dpp && format(dpp, "dd/MM/yyyy")}</p>
      )}

      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Signo da mamãe (opcional)</p>
          <DatePickerButton value={momBirth} onChange={setMomBirth} label="Data de nascimento da mãe" title="Nascimento da mãe" minYear={1950} maxYear={2010} />
          {momSign && babySign && (
            <div className="mt-3">
              <SignCard title="👩 Signo da mamãe" sign={momSign} compatWith={babySign.name} />
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Signo do pai (opcional)</p>
          <DatePickerButton value={dadBirth} onChange={setDadBirth} label="Data de nascimento do pai" title="Nascimento do pai" minYear={1950} maxYear={2010} />
          {dadSign && babySign && (
            <div className="mt-3">
              <SignCard title="🧑 Signo do pai" sign={dadSign} compatWith={babySign.name} />
            </div>
          )}
        </div>
      </div>

      {/* Trio astrológico */}
      {babySign && (momSign || dadSign) && (
        <div className="glass-card p-5 text-center space-y-3">
          <h3 className="font-display text-lg font-semibold">Seu trio astrológico</h3>
          <div className="flex items-center justify-center gap-4 text-3xl">
            <span>{zodiacDetails[babySign.name]?.emoji}</span>
            {momSign && <span>{zodiacDetails[momSign.name]?.emoji}</span>}
            {dadSign && <span>{zodiacDetails[dadSign.name]?.emoji}</span>}
          </div>
          <p className="text-sm text-muted-foreground">
            {getTrioPhrase(babySign.name, momSign?.name || dadSign?.name || '', dadSign && momSign ? dadSign.name : undefined)}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center italic">Apenas por diversão 🔮</p>
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
        <div className="glass-card p-4 border-destructive/30">
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