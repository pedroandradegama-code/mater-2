import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Download, Share2, Edit3, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { calculatePregnancyInfo, parseLocalDate } from '@/lib/pregnancy-data';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import UpgradeModal from '@/components/UpgradeModal';
import {
  WelcomeSVG, PathsSVG, PeopleSVG, RoomSVG, RelaxSVG,
  HandsBabySVG, MotherBabySVG, EmergencySVG
} from '@/components/plano-parto/BirthPlanSVGs';

const TOTAL_STEPS = 9;

interface Answers {
  tipoParto?: string;
  acompanhantes?: string[];
  acompanhanteExtra?: string;
  ambiente?: string[];
  alivioDor?: string;
  metodosAlivio?: string[];
  nascimento?: string[];
  posParto?: string[];
  pedidoBebe?: string;
  emergencia?: string[];
  observacoesEmergencia?: string;
}

const optionCard = (selected: boolean) =>
  `p-4 rounded-2xl border-2 transition-all text-left ${
    selected
      ? 'border-primary bg-primary/5 shadow-sm'
      : 'border-border bg-background/60 hover:border-primary/30'
  }`;

const checkMark = (selected: boolean) =>
  `w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
    selected ? 'bg-primary text-primary-foreground' : 'border border-muted-foreground/30'
  }`;

function StepContent({ step, answers, setAnswers }: { step: number; answers: Answers; setAnswers: (a: Answers) => void }) {
  const toggle = (key: keyof Answers, value: string) => {
    const arr = (answers[key] as string[] | undefined) || [];
    setAnswers({ ...answers, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] });
  };

  const selectSingle = (key: keyof Answers, value: string) => {
    setAnswers({ ...answers, [key]: value });
  };

  const isSelected = (key: keyof Answers, value: string) => {
    const v = answers[key];
    if (Array.isArray(v)) return v.includes(value);
    return v === value;
  };

  if (step === 1) {
    return (
      <div className="text-center space-y-4 animate-fade-in">
        <WelcomeSVG />
        <h2 className="font-display text-3xl font-semibold">Seu Plano de Parto</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Vamos criar juntas um documento personalizado para compartilhar
          com seu médico e equipe. Leva menos de 5 minutos. 💛
        </p>
      </div>
    );
  }

  if (step === 2) {
    const options = [
      { value: 'normal', label: '🌿 Parto normal / vaginal' },
      { value: 'cesarea', label: '🏥 Cesárea eletiva' },
      { value: 'decidir_medico', label: '🤝 Quero decidir junto com meu médico' },
      { value: 'nao_sei', label: '💭 Ainda não sei' },
    ];
    return (
      <div className="space-y-4 animate-fade-in">
        <PathsSVG />
        <h2 className="font-display text-2xl font-semibold text-center">Qual tipo de parto você deseja?</h2>
        <div className="space-y-3">
          {options.map(o => (
            <button key={o.value} className={`w-full ${optionCard(isSelected('tipoParto', o.value))}`}
              onClick={() => selectSingle('tipoParto', o.value)}>
              <div className="flex items-center gap-3">
                <div className={checkMark(isSelected('tipoParto', o.value))}>
                  {isSelected('tipoParto', o.value) && <Check size={12} />}
                </div>
                <span className="text-sm font-medium">{o.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 3) {
    const options = [
      { value: 'parceiro', label: '👫 Parceiro(a)' },
      { value: 'mae', label: '👩 Minha mãe' },
      { value: 'doula', label: '🌸 Doula' },
      { value: 'fotografa', label: '📸 Fotógrafa de parto' },
      { value: 'equipe_medica', label: '👩‍⚕️ Apenas a equipe médica' },
    ];
    return (
      <div className="space-y-4 animate-fade-in">
        <PeopleSVG />
        <h2 className="font-display text-2xl font-semibold text-center">Quem você quer ao seu lado durante o parto?</h2>
        <div className="space-y-3">
          {options.map(o => (
            <button key={o.value} className={`w-full ${optionCard(isSelected('acompanhantes', o.value))}`}
              onClick={() => toggle('acompanhantes', o.value)}>
              <div className="flex items-center gap-3">
                <div className={checkMark(isSelected('acompanhantes', o.value))}>
                  {isSelected('acompanhantes', o.value) && <Check size={12} />}
                </div>
                <span className="text-sm font-medium">{o.label}</span>
              </div>
            </button>
          ))}
        </div>
        <Input placeholder="+ Adicionar outra pessoa" value={answers.acompanhanteExtra || ''}
          onChange={e => setAnswers({ ...answers, acompanhanteExtra: e.target.value })}
          className="rounded-xl" />
      </div>
    );
  }

  if (step === 4) {
    const options = [
      { value: 'luz_baixa', label: '🔆 Luz baixa ou indireta' },
      { value: 'musica', label: '🎵 Música (sua playlist)' },
      { value: 'silencio', label: '🤫 Silêncio e tranquilidade' },
      { value: 'chuveiro', label: '🚿 Acesso ao chuveiro ou banheira' },
      { value: 'movimentar', label: '🏃‍♀️ Liberdade para se movimentar' },
      { value: 'sem_celular', label: '📵 Sem celulares de visitas na sala' },
    ];
    return (
      <div className="space-y-4 animate-fade-in">
        <RoomSVG />
        <h2 className="font-display text-2xl font-semibold text-center">Como você quer que seja o ambiente?</h2>
        <div className="space-y-3">
          {options.map(o => (
            <button key={o.value} className={`w-full ${optionCard(isSelected('ambiente', o.value))}`}
              onClick={() => toggle('ambiente', o.value)}>
              <div className="flex items-center gap-3">
                <div className={checkMark(isSelected('ambiente', o.value))}>
                  {isSelected('ambiente', o.value) && <Check size={12} />}
                </div>
                <span className="text-sm font-medium">{o.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 5) {
    const mainOptions = [
      { value: 'anestesia', label: '💉 Quero anestesia (peridural)' },
      { value: 'natural', label: '🌿 Prefiro métodos não farmacológicos' },
      { value: 'tentar_natural', label: '🔄 Quero tentar natural e decidir na hora' },
      { value: 'conversar', label: '💬 Quero conversar com o anestesista antes' },
    ];
    const metodos = [
      { value: 'bola', label: 'Bola de pilates' },
      { value: 'banho', label: 'Banho quente / banheira' },
      { value: 'massagem', label: 'Massagem' },
      { value: 'tens', label: 'TENS (estimulação elétrica)' },
      { value: 'aromaterapia', label: 'Aromaterapia' },
      { value: 'deambulacao', label: 'Deambulação livre (caminhar)' },
    ];
    return (
      <div className="space-y-4 animate-fade-in">
        <RelaxSVG />
        <h2 className="font-display text-2xl font-semibold text-center">Sobre o alívio da dor, o que você prefere?</h2>
        <div className="space-y-3">
          {mainOptions.map(o => (
            <button key={o.value} className={`w-full ${optionCard(isSelected('alivioDor', o.value))}`}
              onClick={() => selectSingle('alivioDor', o.value)}>
              <div className="flex items-center gap-3">
                <div className={checkMark(isSelected('alivioDor', o.value))}>
                  {isSelected('alivioDor', o.value) && <Check size={12} />}
                </div>
                <span className="text-sm font-medium">{o.label}</span>
              </div>
            </button>
          ))}
        </div>
        <p className="text-sm font-semibold text-muted-foreground pt-2">Métodos que gostaria de usar:</p>
        <div className="space-y-2">
          {metodos.map(o => (
            <button key={o.value} className={`w-full ${optionCard(isSelected('metodosAlivio', o.value))}`}
              onClick={() => toggle('metodosAlivio', o.value)}>
              <div className="flex items-center gap-3">
                <div className={checkMark(isSelected('metodosAlivio', o.value))}>
                  {isSelected('metodosAlivio', o.value) && <Check size={12} />}
                </div>
                <span className="text-sm">{o.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 6) {
    const options = [
      { value: 'cordao_tardio', label: '✂️ Corte tardio do cordão umbilical' },
      { value: 'parceiro_corta', label: '👨 Meu parceiro corta o cordão' },
      { value: 'pele_pele', label: '🫂 Contato pele a pele imediato' },
      { value: 'ver_nascimento', label: '🪞 Quero ver o nascimento (espelho ou câmera)' },
      { value: 'amamentacao_sala', label: '🤱 Amamentação ainda na sala de parto' },
      { value: 'adiar_banho', label: '🛁 Adiar o banho do bebê (mínimo 6h)' },
    ];
    return (
      <div className="space-y-4 animate-fade-in">
        <HandsBabySVG />
        <h2 className="font-display text-2xl font-semibold text-center">Sobre o momento em que seu bebê nascer:</h2>
        <div className="space-y-3">
          {options.map(o => (
            <button key={o.value} className={`w-full ${optionCard(isSelected('nascimento', o.value))}`}
              onClick={() => toggle('nascimento', o.value)}>
              <div className="flex items-center gap-3">
                <div className={checkMark(isSelected('nascimento', o.value))}>
                  {isSelected('nascimento', o.value) && <Check size={12} />}
                </div>
                <span className="text-sm font-medium">{o.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 7) {
    const options = [
      { value: 'amamentar_exclusivo', label: '🍼 Quero amamentar exclusivamente' },
      { value: 'vitamina_k', label: '💉 Aceito vitamina K injetável para o bebê' },
      { value: 'colirio', label: '👁️ Aceito colírio ocular profilático' },
      { value: 'sem_chupeta', label: '🚫 Não quero chupeta ou mamadeira nas primeiras horas' },
      { value: 'registrar_banho', label: '📸 Quero registrar o primeiro banho' },
    ];
    return (
      <div className="space-y-4 animate-fade-in">
        <MotherBabySVG />
        <h2 className="font-display text-2xl font-semibold text-center">Nos primeiros momentos com seu bebê:</h2>
        <div className="space-y-3">
          {options.map(o => (
            <button key={o.value} className={`w-full ${optionCard(isSelected('posParto', o.value))}`}
              onClick={() => toggle('posParto', o.value)}>
              <div className="flex items-center gap-3">
                <div className={checkMark(isSelected('posParto', o.value))}>
                  {isSelected('posParto', o.value) && <Check size={12} />}
                </div>
                <span className="text-sm font-medium">{o.label}</span>
              </div>
            </button>
          ))}
        </div>
        <Textarea placeholder="Algum pedido especial sobre o bebê?" value={answers.pedidoBebe || ''}
          onChange={e => setAnswers({ ...answers, pedidoBebe: e.target.value })}
          className="rounded-xl min-h-[60px]" />
      </div>
    );
  }

  if (step === 8) {
    const options = [
      { value: 'acompanhante_cesarea', label: '👫 Quero meu acompanhante mesmo na cesárea' },
      { value: 'informada', label: '📋 Quero ser informada de tudo' },
      { value: 'pele_pele_cesarea', label: '🫂 Contato pele a pele assim que possível' },
      { value: 'foto_cesarea', label: '📸 Quero registro do nascimento mesmo em cesárea' },
    ];
    return (
      <div className="space-y-4 animate-fade-in">
        <EmergencySVG />
        <h2 className="font-display text-2xl font-semibold text-center">Em caso de cesárea de emergência:</h2>
        <div className="space-y-3">
          {options.map(o => (
            <button key={o.value} className={`w-full ${optionCard(isSelected('emergencia', o.value))}`}
              onClick={() => toggle('emergencia', o.value)}>
              <div className="flex items-center gap-3">
                <div className={checkMark(isSelected('emergencia', o.value))}>
                  {isSelected('emergencia', o.value) && <Check size={12} />}
                </div>
                <span className="text-sm font-medium">{o.label}</span>
              </div>
            </button>
          ))}
        </div>
        <Textarea placeholder="Outros pedidos ou observações importantes:" value={answers.observacoesEmergencia || ''}
          onChange={e => setAnswers({ ...answers, observacoesEmergencia: e.target.value })}
          className="rounded-xl min-h-[60px]" />
      </div>
    );
  }

  return null;
}

// Labels for summary
const labelMap: Record<string, string> = {
  normal: '🌿 Parto normal / vaginal',
  cesarea: '🏥 Cesárea eletiva',
  decidir_medico: '🤝 Decidir com o médico',
  nao_sei: '💭 Ainda não sei',
  parceiro: '👫 Parceiro(a)',
  mae: '👩 Minha mãe',
  doula: '🌸 Doula',
  fotografa: '📸 Fotógrafa de parto',
  equipe_medica: '👩‍⚕️ Apenas equipe médica',
  luz_baixa: '🔆 Luz baixa ou indireta',
  musica: '🎵 Música',
  silencio: '🤫 Silêncio',
  chuveiro: '🚿 Chuveiro ou banheira',
  movimentar: '🏃‍♀️ Liberdade para se movimentar',
  sem_celular: '📵 Sem celulares de visitas',
  anestesia: '💉 Anestesia (peridural)',
  natural: '🌿 Métodos não farmacológicos',
  tentar_natural: '🔄 Tentar natural e decidir na hora',
  conversar: '💬 Conversar com anestesista',
  bola: 'Bola de pilates',
  banho: 'Banho quente / banheira',
  massagem: 'Massagem',
  tens: 'TENS',
  aromaterapia: 'Aromaterapia',
  deambulacao: 'Deambulação livre',
  cordao_tardio: '✂️ Corte tardio do cordão',
  parceiro_corta: '👨 Parceiro corta o cordão',
  pele_pele: '🫂 Contato pele a pele imediato',
  ver_nascimento: '🪞 Ver o nascimento',
  amamentacao_sala: '🤱 Amamentação na sala de parto',
  adiar_banho: '🛁 Adiar banho (mínimo 6h)',
  amamentar_exclusivo: '🍼 Amamentar exclusivamente',
  vitamina_k: '💉 Vitamina K injetável',
  colirio: '👁️ Colírio ocular profilático',
  sem_chupeta: '🚫 Sem chupeta/mamadeira',
  registrar_banho: '📸 Registrar primeiro banho',
  acompanhante_cesarea: '👫 Acompanhante na cesárea',
  informada: '📋 Ser informada de tudo',
  pele_pele_cesarea: '🫂 Pele a pele na cesárea',
  foto_cesarea: '📸 Registro na cesárea',
};

const getLabel = (v: string) => labelMap[v] || v;

const sections = [
  { title: 'Tipo de Parto', key: 'tipoParto', icon: '🌿' },
  { title: 'Acompanhantes', key: 'acompanhantes', icon: '👥' },
  { title: 'Ambiente', key: 'ambiente', icon: '🕯️' },
  { title: 'Alívio da Dor', key: 'alivioDor', icon: '💆' },
  { title: 'Métodos de Alívio', key: 'metodosAlivio', icon: '🧘' },
  { title: 'Momento do Nascimento', key: 'nascimento', icon: '👶' },
  { title: 'Pós-Parto', key: 'posParto', icon: '🤱' },
  { title: 'Situações Especiais', key: 'emergencia', icon: '🏥' },
];

export default function PlanoParto() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [existingPlan, setExistingPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isPago = profile?.plano === 'pago';

  useEffect(() => {
    if (!isPago) {
      setShowUpgrade(true);
      setLoading(false);
      return;
    }
    if (!user) return;
    supabase
      .from('plano_parto')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          setExistingPlan(data[0]);
          setAnswers((data[0].respostas as Answers) || {});
        }
        setLoading(false);
      });
  }, [user, isPago]);

  const progress = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const saveAnswers = useCallback(async () => {
    if (!user) return;
    setGenerating(true);
    try {
      if (existingPlan) {
        await supabase.from('plano_parto').update({ respostas: answers as any }).eq('id', existingPlan.id);
      } else {
        const { data } = await supabase.from('plano_parto').insert({ user_id: user.id, respostas: answers as any }).select().single();
        if (data) setExistingPlan(data);
      }
      setGenerated(true);
      toast.success('Plano de parto salvo!');
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setGenerating(false);
    }
  }, [user, answers, existingPlan]);

  const generatePDF = useCallback(() => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(232, 116, 138); // #E8748A
    doc.text('Plano de Parto', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text(`${profile?.nome || 'Gestante'}`, pageWidth / 2, y, { align: 'center' });
    y += 8;

    if (profile?.dum) {
      const info = calculatePregnancyInfo(parseLocalDate(profile.dum));
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`DPP: ${format(info.dpp, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} · Bebê: ${profile.nome_bebe || 'Surpresa'}`, pageWidth / 2, y, { align: 'center' });
      y += 12;
    }

    doc.setDrawColor(232, 116, 138);
    doc.setLineWidth(0.3);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // Sections
    for (const sec of sections) {
      if (y > 260) { doc.addPage(); y = 20; }
      
      doc.setFontSize(13);
      doc.setTextColor(180, 143, 212); // accent
      doc.text(`${sec.icon} ${sec.title}`, 20, y);
      y += 7;

      const val = answers[sec.key as keyof Answers];
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);

      if (Array.isArray(val)) {
        val.forEach(v => {
          if (y > 275) { doc.addPage(); y = 20; }
          doc.text(`• ${getLabel(v)}`, 25, y);
          y += 5;
        });
      } else if (val) {
        doc.text(`• ${getLabel(val)}`, 25, y);
        y += 5;
      } else {
        doc.text('— Não informado', 25, y);
        y += 5;
      }

      // Extra fields
      if (sec.key === 'acompanhantes' && answers.acompanhanteExtra) {
        doc.text(`• ${answers.acompanhanteExtra}`, 25, y);
        y += 5;
      }
      if (sec.key === 'posParto' && answers.pedidoBebe) {
        doc.text(`Pedido especial: ${answers.pedidoBebe}`, 25, y);
        y += 5;
      }
      if (sec.key === 'emergencia' && answers.observacoesEmergencia) {
        doc.text(`Observações: ${answers.observacoesEmergencia}`, 25, y);
        y += 5;
      }

      y += 5;
    }

    // Footer
    if (y > 265) { doc.addPage(); y = 20; }
    y = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Este documento expressa as preferências da gestante e deve ser discutido previamente com a equipe de saúde. Gerado pelo Mater.', pageWidth / 2, y, { align: 'center', maxWidth: pageWidth - 40 });

    doc.save('plano-de-parto.pdf');
    toast.success('PDF gerado!');
  }, [answers, profile]);

  const sharePlan = useCallback(async () => {
    let text = `*Plano de Parto — ${profile?.nome || 'Gestante'}*\n\n`;
    for (const sec of sections) {
      const val = answers[sec.key as keyof Answers];
      text += `${sec.icon} *${sec.title}*\n`;
      if (Array.isArray(val)) {
        val.forEach(v => { text += `  • ${getLabel(v)}\n`; });
      } else if (val) {
        text += `  • ${getLabel(val)}\n`;
      }
      text += '\n';
    }
    text += '_Gerado pelo Mater 💛_';

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Plano de Parto', text });
      } catch { /* cancelled */ }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }, [answers, profile]);

  const toggleCollapse = (key: string) => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  if (loading) return (
    <div className="gradient-mesh-bg min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  );

  if (!isPago) return (
    <>
      <div className="gradient-mesh-bg min-h-screen flex items-center justify-center px-5">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Recurso exclusivo do plano pago</p>
          <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl">Voltar</Button>
        </div>
      </div>
      <UpgradeModal open={showUpgrade} onClose={() => { setShowUpgrade(false); navigate(-1); }} />
    </>
  );

  // If plan exists and not in edit mode
  if (existingPlan && !generated && step === 1) {
    return (
      <div className="gradient-mesh-bg min-h-screen pb-24">
        <div className="app-container px-5 pt-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <ArrowLeft size={16} /> Voltar
          </button>
          <h1 className="font-display text-3xl font-semibold mb-2">Seu Plano de Parto</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Criado em {format(new Date(existingPlan.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>

          {/* Summary cards */}
          <div className="space-y-3 mb-6">
            {sections.map(sec => {
              const val = answers[sec.key as keyof Answers];
              const isCollapsed = collapsed[sec.key] !== false;
              return (
                <div key={sec.key} className="glass-card overflow-hidden">
                  <button className="w-full p-4 flex items-center justify-between" onClick={() => toggleCollapse(sec.key)}>
                    <span className="font-semibold text-sm">{sec.icon} {sec.title}</span>
                    <span className="text-xs text-muted-foreground">{isCollapsed ? '▼' : '▲'}</span>
                  </button>
                  {!isCollapsed && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground">
                      {Array.isArray(val) ? val.map(v => <p key={v}>• {getLabel(v)}</p>) :
                        val ? <p>• {getLabel(val)}</p> : <p>— Não informado</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <Button className="w-full gradient-hero text-primary-foreground rounded-full" onClick={generatePDF}>
              <Download size={16} /> Baixar PDF
            </Button>
            <Button variant="outline" className="w-full rounded-full" onClick={sharePlan}>
              <Share2 size={16} /> Compartilhar
            </Button>
            <Button variant="ghost" className="w-full rounded-full" onClick={() => { setStep(2); }}>
              <Edit3 size={16} /> Editar respostas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Generated state (just saved)
  if (generated && step === TOTAL_STEPS) {
    return (
      <div className="gradient-mesh-bg min-h-screen pb-24">
        <div className="app-container px-5 pt-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">✨</div>
            <h1 className="font-display text-3xl font-semibold mb-2">Plano de Parto Criado!</h1>
            <p className="text-sm text-muted-foreground">Revise suas escolhas e compartilhe com seu médico.</p>
          </div>

          <div className="space-y-3 mb-6">
            {sections.map(sec => {
              const val = answers[sec.key as keyof Answers];
              const isCollapsed = collapsed[sec.key] !== false;
              return (
                <div key={sec.key} className="glass-card overflow-hidden">
                  <button className="w-full p-4 flex items-center justify-between" onClick={() => toggleCollapse(sec.key)}>
                    <span className="font-semibold text-sm">{sec.icon} {sec.title}</span>
                    <span className="text-xs text-muted-foreground">{isCollapsed ? '▼' : '▲'}</span>
                  </button>
                  {!isCollapsed && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground">
                      {Array.isArray(val) ? val.map(v => <p key={v}>• {getLabel(v)}</p>) :
                        val ? <p>• {getLabel(val)}</p> : <p>— Não informado</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <Button className="w-full gradient-hero text-primary-foreground rounded-full" onClick={generatePDF}>
              <Download size={16} /> Baixar PDF
            </Button>
            <Button variant="outline" className="w-full rounded-full" onClick={sharePlan}>
              <Share2 size={16} /> Compartilhar
            </Button>
            <Button variant="ghost" className="w-full rounded-full" onClick={() => { setGenerated(false); setStep(2); }}>
              <Edit3 size={16} /> Editar respostas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Wizard flow
  return (
    <div className="gradient-mesh-bg min-h-screen flex flex-col">
      <div className="app-container px-5 pt-4 flex-1 flex flex-col">
        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <button onClick={() => step === 1 ? navigate(-1) : prev()} className="text-sm text-muted-foreground flex items-center gap-1">
              <ArrowLeft size={16} /> {step === 1 ? 'Sair' : 'Voltar'}
            </button>
            <span className="text-xs text-muted-foreground">Etapa {step} de {TOTAL_STEPS}</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center py-4 overflow-y-auto">
          <StepContent step={step} answers={answers} setAnswers={setAnswers} />
        </div>

        {/* Bottom button */}
        <div className="pb-6 pt-2">
          {step === TOTAL_STEPS ? (
            <Button className="w-full gradient-hero text-primary-foreground rounded-full h-12 text-base font-semibold"
              onClick={saveAnswers} disabled={generating}>
              {generating ? 'Salvando...' : '✨ Gerar meu Plano de Parto'}
            </Button>
          ) : (
            <Button className="w-full gradient-hero text-primary-foreground rounded-full h-12 text-base font-semibold"
              onClick={next}>
              {step === 1 ? 'Começar' : 'Continuar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
