import { useState, useMemo } from 'react';
import BottomNav from '@/components/BottomNav';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search } from 'lucide-react';

interface FAQ {
  q: string;
  a: string;
}

const faqData: Record<string, FAQ[]> = {
  'Nutrição': [
    { q: 'Posso tomar café na gravidez?', a: 'Sim, mas limite a 200mg de cafeína por dia (cerca de 1 xícara). Excesso pode afetar o desenvolvimento do bebê.' },
    { q: 'Quais alimentos devo evitar?', a: 'Evite peixes crus (sushi), carnes mal passadas, queijos não pasteurizados, ovos crus e embutidos.' },
    { q: 'Preciso tomar ácido fólico?', a: 'Sim! O ácido fólico é essencial nos primeiros meses para prevenir defeitos no tubo neural. Dose recomendada: 400mcg/dia.' },
    { q: 'Quanto de água devo beber?', a: 'Recomenda-se cerca de 2-3 litros por dia. Use nossa calculadora de hidratação para uma estimativa personalizada.' },
    { q: 'Posso comer chocolate?', a: 'Sim, com moderação! O chocolate amargo é a melhor opção. Evite exageros por conta do açúcar e cafeína.' },
  ],
  'Sintomas': [
    { q: 'Enjoo é normal no início?', a: 'Sim, náuseas são comuns no 1º trimestre (semanas 6-14). Tente comer porções menores e mais frequentes.' },
    { q: 'Dor nas costas é comum?', a: 'Sim, especialmente no 3º trimestre. Exercícios leves, boa postura e travesseiro entre as pernas ao dormir ajudam.' },
    { q: 'Inchaço nos pés é normal?', a: 'Edema leve é normal, especialmente no final da gravidez. Eleve os pés e evite ficar muito tempo em pé.' },
    { q: 'Quando devo me preocupar com sangramento?', a: 'Qualquer sangramento deve ser comunicado ao médico. No 1º trimestre pode ser implantação, mas é importante avaliar.' },
    { q: 'Insônia na gravidez é comum?', a: 'Sim, causada por alterações hormonais, desconforto e ansiedade. Tente relaxar antes de dormir e manter uma rotina.' },
  ],
  'Urgências': [
    { q: 'Quando devo ir ao hospital?', a: 'Em caso de sangramento intenso, perda de líquido, contrações regulares antes de 37 semanas, febre alta ou falta de movimentação fetal.' },
    { q: 'O que é pré-eclâmpsia?', a: 'Pressão alta na gravidez com proteína na urina. Sintomas: inchaço repentino, dor de cabeça intensa, alterações visuais. Procure urgência.' },
    { q: 'O que fazer se a bolsa estourar?', a: 'Anote a hora, observe a cor do líquido (deve ser claro) e vá ao hospital. Se verde/amarelo, é urgente.' },
    { q: 'Contrações de Braxton Hicks são perigosas?', a: 'Não, são contrações de treinamento. Diferem das reais por serem irregulares e não progressivas.' },
    { q: 'Queda na gravidez, o que fazer?', a: 'Procure atendimento médico para avaliação, mesmo sem dor. O líquido amniótico protege, mas é importante verificar.' },
  ],
  'Vacinas': [
    { q: 'Quais vacinas são recomendadas?', a: 'Influenza (qualquer trimestre), dTpa (27-36 semanas) e Hepatite B (se não vacinada anteriormente).' },
    { q: 'Vacina contra COVID na gravidez?', a: 'Sim, é recomendada. Consulte seu médico sobre o melhor momento e tipo de vacina.' },
    { q: 'A vacina da gripe é segura?', a: 'Sim, a vacina inativada é segura e recomendada em qualquer trimestre da gestação.' },
    { q: 'Por que tomar dTpa na gravidez?', a: 'Para passar anticorpos ao bebê contra coqueluche, que é perigosa para recém-nascidos.' },
    { q: 'Posso tomar outras vacinas?', a: 'Vacinas de vírus vivos (como febre amarela) são contraindicadas. Sempre consulte seu obstetra.' },
  ],
  'Exames': [
    { q: 'Quais exames são feitos no pré-natal?', a: 'Hemograma, glicemia, tipagem sanguínea, sorologias, urina, ultrassons e outros conforme indicação médica.' },
    { q: 'Quando fazer o ultrassom morfológico?', a: 'Entre 18 e 24 semanas. Avalia a anatomia do bebê em detalhes.' },
    { q: 'O que é o teste de glicose?', a: 'Teste de tolerância à glicose feito entre 24-28 semanas para verificar diabetes gestacional.' },
    { q: 'Quantos ultrassons são necessários?', a: 'No mínimo 3: 1º trimestre (datação), morfológico (20 sem) e 3º trimestre. Seu médico pode solicitar mais.' },
    { q: 'O que é o exame de estreptococo B?', a: 'Realizado entre 35-37 semanas para verificar a bactéria no canal de parto. Se positivo, antibiótico no parto.' },
  ],
  'Medicamentos': [
    { q: 'Posso tomar paracetamol?', a: 'Em geral é considerado seguro em doses adequadas, mas sempre consulte seu médico ou farmacêutico.' },
    { q: 'Ibuprofeno é seguro na gravidez?', a: 'Não é recomendado, especialmente no 3º trimestre. Pode afetar o feto. Consulte seu médico ou farmacêutico.' },
    { q: 'Posso usar pomadas e cremes?', a: 'Depende da composição. Alguns princípios ativos são contraindicados. Consulte seu médico ou farmacêutico.' },
    { q: 'Chás são seguros na gravidez?', a: 'Nem todos. Camomila e erva-cidreira em moderação são geralmente seguros. Evite canela, boldo e arruda. Consulte seu médico ou farmacêutico.' },
    { q: 'Posso tomar vitaminas por conta?', a: 'Não tome suplementos sem orientação. O excesso de algumas vitaminas pode ser prejudicial. Consulte seu médico ou farmacêutico.' },
  ],
};

const allCategories = Object.keys(faqData);

export default function FAQ() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = faqData;
    
    // First filter by category if selected
    if (activeCategory) {
      result = { [activeCategory]: faqData[activeCategory] };
    }
    
    // Then filter by search
    if (search) {
      const term = search.toLowerCase();
      const searchResult: Record<string, FAQ[]> = {};
      Object.entries(result).forEach(([cat, items]) => {
        const matches = items.filter(i => i.q.toLowerCase().includes(term) || i.a.toLowerCase().includes(term));
        if (matches.length) searchResult[cat] = matches;
      });
      return searchResult;
    }
    
    return result;
  }, [search, activeCategory]);

  const categories = Object.keys(filtered);

  return (
    <div className="gradient-mesh-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">
        <h1 className="font-display text-3xl font-semibold mb-4">Perguntas Frequentes</h1>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por palavra-chave..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
              !activeCategory ? 'bg-primary text-primary-foreground' : 'glass-card'
            }`}
          >
            Todos
          </button>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'bg-primary text-primary-foreground' : 'glass-card'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {categories.map(cat => (
          <div key={cat} className="mb-4">
            <h2 className="font-display text-lg font-semibold mb-2">{cat}</h2>
            <Accordion type="single" collapsible>
              {filtered[cat].map((item, i) => (
                <AccordionItem key={i} value={`${cat}-${i}`} className="glass-card mb-2 border-none px-4">
                  <AccordionTrigger className="text-sm font-medium text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
