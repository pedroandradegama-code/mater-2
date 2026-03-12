import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Search, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const estiloOptions = [
  'Clássico e atemporal',
  'Moderno e diferente',
  'Internacional',
  'Curto (até 2 sílabas)',
  'Composto',
  'Em alta no Brasil',
];

interface NameSuggestion {
  nome: string;
  origem: string;
  significado: string;
  por_que_combina: string;
  variacoes: string[];
  famosos_com_esse_nome: string[];
}

interface NameSearchResult {
  nome: string;
  origem: string;
  significado: string;
  personalidade: string;
  variacoes: string[];
  curiosidades: string;
  sonoridade: string;
}

export default function NomeBebe() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Suggest form state
  const [sexo, setSexo] = useState('Menina');
  const [estilos, setEstilos] = useState<string[]>([]);
  const [nomeMae, setNomeMae] = useState('');
  const [nomePai, setNomePai] = useState('');
  const [homenagem, setHomenagem] = useState('');
  const [letraInicial, setLetraInicial] = useState('');
  const [significados, setSignificados] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  // Search state
  const [nomeConsulta, setNomeConsulta] = useState('');
  const [searchResult, setSearchResult] = useState<NameSearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const { data: favoritos = [] } = useQuery({
    queryKey: ['nome-favoritos', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('nome_favoritos').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const addFavorito = useMutation({
    mutationFn: async (name: { nome: string; origem: string; significado: string }) => {
      const { error } = await supabase.from('nome_favoritos').insert({ user_id: user!.id, ...name });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nome-favoritos'] });
      toast.success('Nome favoritado! ❤️');
    },
  });

  const removeFavorito = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('nome_favoritos').delete().eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nome-favoritos'] });
    },
  });

  const toggleEstilo = (e: string) => {
    setEstilos(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };

  const handleSuggest = async () => {
    setSuggestLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-names', {
        body: { sexo, estilos, nomeMae, nomePai, homenagem, letraInicial, significados, sobrenome, mode: 'suggest' },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setSuggestions(data.result || []);
    } catch (err) {
      toast.error('Erro ao gerar sugestões');
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!nomeConsulta.trim()) return;
    setSearchLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-names', {
        body: { nomeConsulta, sobrenome, mode: 'search' },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setSearchResult(data.result || null);
    } catch {
      toast.error('Erro ao buscar nome');
    } finally {
      setSearchLoading(false);
    }
  };

  const isFavorited = (nome: string) => favoritos.some((f: any) => f.nome === nome);

  const shareWhatsApp = () => {
    const names = favoritos.map((f: any) => `💭 ${f.nome} — ${f.significado}`).join('\n');
    const text = `Estamos pensando em nomes para o bebê:\n\n${names}\n\nCriado com Mater 🌸`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="gradient-mesh-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">
        <h1 className="font-display text-3xl font-semibold mb-4">Nome do Bebê</h1>

        <Tabs defaultValue="sugerir">
          <TabsList className="w-full mb-4 rounded-xl">
            <TabsTrigger value="sugerir" className="flex-1 rounded-lg text-xs">✨ Sugerir</TabsTrigger>
            <TabsTrigger value="buscar" className="flex-1 rounded-lg text-xs">🔍 Buscar</TabsTrigger>
            <TabsTrigger value="favoritos" className="flex-1 rounded-lg text-xs">❤️ Favoritos</TabsTrigger>
          </TabsList>

          <TabsContent value="sugerir">
            <div className="space-y-4">
              {/* Sexo */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Sexo do bebê</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Menino', 'Menina', 'Surpresa', 'Neutro'].map(s => (
                    <button key={s} onClick={() => setSexo(s)}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${sexo === s ? 'bg-primary text-primary-foreground' : 'glass-card'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estilos */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Estilo de nome (selecione vários)</label>
                <div className="flex flex-wrap gap-2">
                  {estiloOptions.map(e => (
                    <button key={e} onClick={() => toggleEstilo(e)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all ${estilos.includes(e) ? 'bg-primary text-primary-foreground' : 'glass-card'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nome da mãe</label>
                  <Input value={nomeMae} onChange={e => setNomeMae(e.target.value)} className="rounded-xl" placeholder="Maria" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nome do pai</label>
                  <Input value={nomePai} onChange={e => setNomePai(e.target.value)} className="rounded-xl" placeholder="João" />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Homenagear alguém? (opcional)</label>
                <Input value={homenagem} onChange={e => setHomenagem(e.target.value)} className="rounded-xl" placeholder="Avó Maria" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Letra inicial (opcional)</label>
                  <Input value={letraInicial} onChange={e => setLetraInicial(e.target.value.slice(0, 1).toUpperCase())} className="rounded-xl" placeholder="A" maxLength={1} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Sobrenome</label>
                  <Input value={sobrenome} onChange={e => setSobrenome(e.target.value)} className="rounded-xl" placeholder="Silva" />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Significados que importam</label>
                <Input value={significados} onChange={e => setSignificados(e.target.value)} className="rounded-xl" placeholder="força, luz, natureza..." />
              </div>

              <Button onClick={handleSuggest} disabled={suggestLoading} className="w-full gradient-hero text-primary-foreground rounded-xl">
                {suggestLoading ? <><Loader2 size={16} className="mr-2 animate-spin" /> Gerando...</> : '✨ Sugerir Nomes'}
              </Button>

              {suggestions.length > 0 && (
                <div className="space-y-3 mt-4">
                  {suggestions.map((s, i) => (
                    <div key={i} className="glass-card p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-display text-lg font-semibold">{s.nome}</p>
                          <p className="text-xs text-muted-foreground">{s.origem}</p>
                        </div>
                        <button
                          onClick={() => isFavorited(s.nome)
                            ? removeFavorito.mutate(favoritos.find((f: any) => f.nome === s.nome)?.id)
                            : addFavorito.mutate({ nome: s.nome, origem: s.origem, significado: s.significado })
                          }
                        >
                          <Heart size={20} className={isFavorited(s.nome) ? 'fill-destructive text-destructive' : 'text-muted-foreground'} />
                        </button>
                      </div>
                      <p className="text-sm mb-1"><strong>Significado:</strong> {s.significado}</p>
                      <p className="text-sm mb-1"><strong>Por que combina:</strong> {s.por_que_combina}</p>
                      {s.variacoes?.length > 0 && <p className="text-xs text-muted-foreground">Variações: {s.variacoes.join(', ')}</p>}
                      {s.famosos_com_esse_nome?.length > 0 && <p className="text-xs text-muted-foreground mt-1">Famosos: {s.famosos_com_esse_nome.join(', ')}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="buscar">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input value={nomeConsulta} onChange={e => setNomeConsulta(e.target.value)} placeholder="Digite um nome..." className="rounded-xl flex-1" />
                <Button onClick={handleSearch} disabled={searchLoading} className="gradient-hero text-primary-foreground rounded-xl">
                  {searchLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </Button>
              </div>

              {searchResult && (
                <div className="glass-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-semibold">{searchResult.nome}</h3>
                    <button onClick={() =>
                      isFavorited(searchResult.nome)
                        ? removeFavorito.mutate(favoritos.find((f: any) => f.nome === searchResult.nome)?.id)
                        : addFavorito.mutate({ nome: searchResult.nome, origem: searchResult.origem, significado: searchResult.significado })
                    }>
                      <Heart size={20} className={isFavorited(searchResult.nome) ? 'fill-destructive text-destructive' : 'text-muted-foreground'} />
                    </button>
                  </div>
                  <p className="text-sm"><strong>Origem:</strong> {searchResult.origem}</p>
                  <p className="text-sm"><strong>Significado:</strong> {searchResult.significado}</p>
                  <p className="text-sm"><strong>Personalidade:</strong> {searchResult.personalidade}</p>
                  {searchResult.variacoes?.length > 0 && <p className="text-sm"><strong>Variações:</strong> {searchResult.variacoes.join(', ')}</p>}
                  <p className="text-sm"><strong>Curiosidades:</strong> {searchResult.curiosidades}</p>
                  <p className="text-sm"><strong>Sonoridade:</strong> {searchResult.sonoridade}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favoritos">
            <div className="space-y-3">
              {favoritos.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">Nenhum nome favoritado ainda</p>
              )}
              {favoritos.map((f: any) => (
                <div key={f.id} className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{f.nome}</p>
                    <p className="text-xs text-muted-foreground">{f.origem} — {f.significado}</p>
                  </div>
                  <button onClick={() => removeFavorito.mutate(f.id)}>
                    <Heart size={20} className="fill-destructive text-destructive" />
                  </button>
                </div>
              ))}
              {favoritos.length > 0 && (
                <Button onClick={shareWhatsApp} variant="outline" className="w-full rounded-xl mt-2">
                  <Share2 size={16} className="mr-2" /> Compartilhar via WhatsApp
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
}
