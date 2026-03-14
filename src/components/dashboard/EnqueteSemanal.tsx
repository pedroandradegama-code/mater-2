import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { EnqueteIcon } from './DashboardIcons';

interface Enquete {
  id: string;
  semana_min: number;
  semana_max: number;
  pergunta: string;
  opcoes: string[];
}

interface EnqueteResposta {
  id: string;
  enquete_id: string;
  user_id: string;
  opcao_escolhida: string;
}

export default function EnqueteSemanal({ semana }: { semana: number }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const { data: enquete } = useQuery({
    queryKey: ['enquete', semana],
    queryFn: async () => {
      const { data } = await supabase
        .from('enquetes')
        .select('*')
        .lte('semana_min', semana)
        .gte('semana_max', semana)
        .limit(1);
      if (!data?.[0]) return null;
      const raw = data[0];
      return {
        ...raw,
        opcoes: raw.opcoes as unknown as string[],
      } as Enquete;
    },
    enabled: semana >= 4 && semana <= 40,
  });

  const { data: allResponses } = useQuery({
    queryKey: ['enquete-respostas', enquete?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('enquetes_respostas')
        .select('*')
        .eq('enquete_id', enquete!.id);
      return (data || []) as EnqueteResposta[];
    },
    enabled: !!enquete,
  });

  const myResponse = allResponses?.find(r => r.user_id === user?.id);
  const hasVoted = !!myResponse;

  const voteMutation = useMutation({
    mutationFn: async (opcao: string) => {
      const { error } = await supabase
        .from('enquetes_respostas')
        .insert({ enquete_id: enquete!.id, user_id: user!.id, opcao_escolhida: opcao });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquete-respostas', enquete?.id] });
    },
  });

  const handleVote = (opcao: string) => {
    setSelectedOption(opcao);
    voteMutation.mutate(opcao);
  };

  if (!enquete) return null;

  const totalVotes = allResponses?.length || 0;
  const voteCounts: Record<string, number> = {};
  allResponses?.forEach(r => {
    voteCounts[r.opcao_escolhida] = (voteCounts[r.opcao_escolhida] || 0) + 1;
  });

  return (
    <div className="rounded-[20px] p-5 border animate-fade-up" style={{
      background: 'linear-gradient(135deg, hsl(255 90% 96%) 0%, hsl(340 100% 94%) 100%)',
      borderColor: 'rgba(123, 97, 255, 0.15)',
    }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
          <EnqueteIcon className="w-4 h-4 text-accent" />
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-accent">
          Enquete da Semana
        </span>
        {!hasVoted && (
          <span className="ml-auto text-[10px] font-semibold uppercase bg-accent text-white px-2 py-0.5 rounded-full">
            Novo
          </span>
        )}
      </div>

      {/* Question */}
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        {enquete.pergunta}
      </h3>

      {/* Options or Results */}
      {!hasVoted ? (
        <div className="flex flex-wrap gap-2">
          {enquete.opcoes.map(opcao => (
            <button
              key={opcao}
              onClick={() => handleVote(opcao)}
              disabled={voteMutation.isPending}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all card-press ${
                selectedOption === opcao
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-white border-[var(--card-border-color)] text-foreground hover:border-primary/30'
              }`}
            >
              {opcao}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {enquete.opcoes.map(opcao => {
            const count = voteCounts[opcao] || 0;
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isSelected = myResponse?.opcao_escolhida === opcao;
            return (
              <div key={opcao}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={isSelected ? 'font-semibold text-primary' : 'text-muted-foreground'}>
                    {opcao}
                  </span>
                  <span className={isSelected ? 'font-semibold text-primary' : 'text-muted-foreground'}>
                    {pct}%
                  </span>
                </div>
                <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full animate-bar-grow ${isSelected ? 'bg-primary' : 'bg-primary/30'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground mt-3">
            {totalVotes} {totalVotes === 1 ? 'mamãe respondeu' : 'mamães responderam'} esta semana 💛
          </p>
        </div>
      )}
    </div>
  );
}
