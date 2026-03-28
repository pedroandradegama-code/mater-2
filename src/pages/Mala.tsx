import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Share2 } from 'lucide-react';
import { calculatePregnancyInfo, parseLocalDate } from '@/lib/pregnancy-data';
import { Button } from '@/components/ui/button';

interface ChecklistCategory {
  name: string;
  items: { id: string; label: string }[];
}

const bebeItems: ChecklistCategory[] = [
  {
    name: 'Roupas',
    items: [
      { id: 'bb-roupas-1', label: '4 macacões com botões na frente (RN ou P)' },
      { id: 'bb-roupas-2', label: '6 bodies básicos RN' },
      { id: 'bb-roupas-3', label: '4 calças RN' },
      { id: 'bb-roupas-4', label: '4 pares de meias' },
      { id: 'bb-roupas-5', label: '2 touquinhas' },
      { id: 'bb-roupas-6', label: '1 par de luvas RN' },
      { id: 'bb-roupas-7', label: '1 saída de maternidade (roupa da alta)' },
      { id: 'bb-roupas-8', label: '1 manta ou cobertor (adequado à estação)' },
    ],
  },
  {
    name: 'Higiene e cuidados',
    items: [
      { id: 'bb-hig-1', label: 'Fraldas RN (1 pacote pequeno)' },
      { id: 'bb-hig-2', label: 'Lenços umedecidos sem álcool e sem perfume' },
      { id: 'bb-hig-3', label: 'Algodão hidrófilo' },
      { id: 'bb-hig-4', label: 'Gaze estéril' },
      { id: 'bb-hig-5', label: 'Álcool 70% em gel (para umbigo)' },
      { id: 'bb-hig-6', label: 'Termômetro digital' },
    ],
  },
  {
    name: 'Documentos',
    items: [
      { id: 'bb-doc-1', label: 'Certidão de nascimento (providenciar cartório)' },
      { id: 'bb-doc-2', label: 'Cartão do plano de saúde (se houver)' },
    ],
  },
];

const mamaeItems: ChecklistCategory[] = [
  {
    name: 'Roupas e conforto',
    items: [
      { id: 'mm-roupas-1', label: '2 pijamas/camisolas com abertura frontal' },
      { id: 'mm-roupas-2', label: '1 roupão para circulação' },
      { id: 'mm-roupas-3', label: '1 roupa para o dia da alta (confortável)' },
      { id: 'mm-roupas-4', label: '3 sutiãs de amamentação' },
      { id: 'mm-roupas-5', label: '3 fraldas para rosquinha de seio' },
      { id: 'mm-roupas-6', label: '3 protetores de seio' },
      { id: 'mm-roupas-7', label: 'Roupa íntima confortável (calcinha alta)' },
      { id: 'mm-roupas-8', label: '1 par de chinelos antiderrapantes' },
      { id: 'mm-roupas-9', label: 'Meias' },
    ],
  },
  {
    name: 'Higiene pessoal',
    items: [
      { id: 'mm-hig-1', label: 'Shampoo e condicionador' },
      { id: 'mm-hig-2', label: 'Sabonete' },
      { id: 'mm-hig-3', label: 'Desodorante' },
      { id: 'mm-hig-4', label: 'Creme hidratante' },
      { id: 'mm-hig-5', label: 'Pente ou escova' },
      { id: 'mm-hig-6', label: 'Escova e pasta de dentes' },
      { id: 'mm-hig-7', label: 'Absorvente pós-parto noturno (2 pacotes)' },
      { id: 'mm-hig-8', label: 'Cinta pós-parto (opcional)' },
    ],
  },
  {
    name: 'Conforto e extras',
    items: [
      { id: 'mm-ext-1', label: 'Almofada de amamentação' },
      { id: 'mm-ext-2', label: 'Carregador de celular' },
      { id: 'mm-ext-3', label: 'Fone de ouvido' },
      { id: 'mm-ext-4', label: 'Lanche rápido para o trabalho de parto' },
      { id: 'mm-ext-5', label: 'Playlist ou meditações salvas offline' },
    ],
  },
  {
    name: 'Documentos',
    items: [
      { id: 'mm-doc-1', label: 'RG e CPF' },
      { id: 'mm-doc-2', label: 'Carteira de gestante com todos os exames' },
      { id: 'mm-doc-3', label: 'Cartão do plano de saúde' },
      { id: 'mm-doc-4', label: 'Plano de parto (se tiver)' },
    ],
  },
];

const acompanhanteItems: ChecklistCategory[] = [
  {
    name: 'Itens do acompanhante',
    items: [
      { id: 'ac-1', label: '2 trocas de roupa completa' },
      { id: 'ac-2', label: 'Casaco (hospitais são frios)' },
      { id: 'ac-3', label: 'Itens básicos de higiene' },
      { id: 'ac-4', label: 'Carregador de celular' },
      { id: 'ac-5', label: 'Documentos pessoais (RG)' },
      { id: 'ac-6', label: 'Snacks e lanches' },
      { id: 'ac-7', label: 'Travesseiro (opcional, para o sofá do quarto)' },
    ],
  },
];

const allCategories = { bebe: bebeItems, mamae: mamaeItems, acompanhante: acompanhanteItems };
const allItems = [...bebeItems, ...mamaeItems, ...acompanhanteItems].flatMap(c => c.items);
const totalItems = allItems.length;

export default function Mala() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const currentWeek = profile?.dum ? calculatePregnancyInfo(parseLocalDate(profile.dum)).weeks : 0;

  const { data: checkedItems = [] } = useQuery({
    queryKey: ['checklist-mala', user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('checklist_mala')
        .select('item_id, checked')
        .eq('user_id', user!.id);
      return (data || []).filter((d: any) => d.checked).map((d: any) => d.item_id as string);
    },
    enabled: !!user,
  });

  const toggleItem = useMutation({
    mutationFn: async (itemId: string) => {
      const isChecked = checkedItems.includes(itemId);
      if (isChecked) {
        await (supabase as any).from('checklist_mala').delete().eq('user_id', user!.id).eq('item_id', itemId);
      } else {
        await (supabase as any).from('checklist_mala').upsert({ user_id: user!.id, item_id: itemId, checked: true }, { onConflict: 'user_id,item_id' });
      }
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['checklist-mala', user?.id] });
      const prev = queryClient.getQueryData<string[]>(['checklist-mala', user?.id]) || [];
      const next = prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId];
      queryClient.setQueryData(['checklist-mala', user?.id], next);
      return { prev };
    },
    onError: (_err, _itemId, context) => {
      queryClient.setQueryData(['checklist-mala', user?.id], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-mala', user?.id] });
    },
  });

  const checkedCount = checkedItems.length;
  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const missingItems = allItems.filter(item => !checkedItems.includes(item.id));

  const shareWhatsApp = () => {
    const text = `🧳 Mala da Maternidade — Itens faltantes:\n\n${missingItems.map(i => `☐ ${i.label}`).join('\n')}\n\nCriado com Mater 🌸`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="gradient-mesh-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">
        <h1 className="font-display text-3xl font-semibold mb-2">Mala da Maternidade</h1>
        <p className="text-xs text-muted-foreground mb-4">Deixe tudo pronto a partir da 33ª semana 🧳</p>

        {currentWeek >= 32 && (
          <div className="glass-card p-4 mb-4 border-primary/30 border">
            <p className="text-sm font-medium">⏰ Já está na hora de montar sua mala!</p>
            <p className="text-xs text-muted-foreground mt-1">Você está na semana {currentWeek}. Organize tudo com calma.</p>
          </div>
        )}

        {/* Progress */}
        <div className="glass-card p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{checkedCount} de {totalItems} itens prontos</span>
            <span className="text-xs text-muted-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <Tabs defaultValue="bebe">
          <TabsList className="w-full mb-4 rounded-xl">
            <TabsTrigger value="bebe" className="flex-1 rounded-lg text-xs">👶 Bebê</TabsTrigger>
            <TabsTrigger value="mamae" className="flex-1 rounded-lg text-xs">👩 Mamãe</TabsTrigger>
            <TabsTrigger value="acompanhante" className="flex-1 rounded-lg text-xs">🧑 Acomp.</TabsTrigger>
          </TabsList>

          {(Object.entries(allCategories) as [string, ChecklistCategory[]][]).map(([key, categories]) => (
            <TabsContent key={key} value={key}>
              <div className="space-y-3">
                {categories.map(cat => {
                  const catChecked = cat.items.filter(i => checkedItems.includes(i.id)).length;
                  return (
                    <CategoryChecklist
                      key={cat.name}
                      category={cat}
                      checkedItems={checkedItems}
                      catChecked={catChecked}
                      onToggle={(id) => toggleItem.mutate(id)}
                    />
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Button onClick={shareWhatsApp} variant="outline" className="w-full mt-4 rounded-xl">
          <Share2 size={16} className="mr-2" /> Compartilhar lista por WhatsApp
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}

function CategoryChecklist({ category, checkedItems, catChecked, onToggle }: {
  category: ChecklistCategory;
  checkedItems: string[];
  catChecked: number;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="glass-card overflow-hidden">
      <CollapsibleTrigger className="flex items-center w-full p-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{category.name}</span>
          <span className="text-xs text-muted-foreground">({catChecked}/{category.items.length})</span>
        </div>
        <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform sm:ml-auto ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 space-y-2">
        {category.items.map(item => {
          const checked = checkedItems.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className="flex items-center gap-3 w-full text-left py-1.5"
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                checked ? 'bg-primary border-primary' : 'border-border'
              }`}>
                {checked && <span className="text-primary-foreground text-xs">✓</span>}
              </div>
              <span className={`text-sm transition-all ${checked ? 'line-through text-muted-foreground' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
