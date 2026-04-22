import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Copy, CheckCheck, Trash2, Clock } from 'lucide-react';

const ADMIN_EMAIL = 'pedroandradegama@gmail.com';
const APP_URL = 'https://materapp.com.br';

interface Profissional {
  id: string;
  user_id: string | null;
  nome: string | null;
  email: string;
  profissao: string;
  status: string;
  codigo_afiliada: string;
  codigo_convite: string | null;
  link_kiwify: string | null;
  created_at: string;
  total_cadastros: number;
  total_conversoes: number;
  comissao_total: number;
  comissao_paga: number;
  comissao_pendente: number;
}

interface Convite {
  id: string;
  codigo: string;
  email_destino: string | null;
  expires_at: string | null;
  usado: boolean;
  profissional_id: string | null;
  created_at: string;
}

async function callAdmin(action: string, method = 'GET', body?: any, params?: Record<string, string>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Não autenticado');

  const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-profissionais`);
  url.searchParams.set('action', action);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro');
  return data;
}

export default function AdminProfissionais() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showNewConvite, setShowNewConvite] = useState(false);
  const [conviteForm, setConviteForm] = useState({ nome: '', email_destino: '', dias_validade: 30 });
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [novoConviteGerado, setNovoConviteGerado] = useState<Convite | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      navigate('/dashboard');
    }
  }, [user, loading]);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) loadAll();
  }, [user]);

  const loadAll = async () => {
    try {
      const [profs, convs] = await Promise.all([
        callAdmin('list'),
        callAdmin('convites'),
      ]);
      setProfissionais(profs);
      setConvites(convs);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleGerarConvite = async () => {
    if (!conviteForm.nome.trim()) { toast.error('Nome obrigatório'); return; }
    setSaving(true);
    try {
      const novo = await callAdmin('gerar-convite', 'POST', conviteForm);
      toast.success('Convite gerado!');
      setNovoConviteGerado(novo);
      setConviteForm({ nome: '', email_destino: '', dias_validade: 30 });
      loadAll();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (prof: Profissional) => {
    const novoStatus = prof.status === 'ativo' ? 'inativo' : 'ativo';
    try {
      await callAdmin('update', 'PATCH', { id: prof.id, status: novoStatus });
      toast.success(`Status alterado para ${novoStatus}`);
      loadAll();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSaveLinkKiwify = async (prof: Profissional, link: string) => {
    try {
      await callAdmin('update', 'PATCH', { id: prof.id, link_kiwify: link });
      toast.success('Link salvo!');
      loadAll();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteConvite = async (id: string) => {
    if (!confirm('Excluir este convite?')) return;
    try {
      await callAdmin('convite', 'DELETE', undefined, { id });
      toast.success('Convite excluído');
      loadAll();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const copiar = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const linkConvite = (codigo: string) => `${APP_URL}/cadastro?convite=${codigo}`;
  const linkIndicacao = (codigo: string) => `${APP_URL}/cadastro?ref=${codigo}`;

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const ativas = profissionais.filter(p => p.status === 'ativo').length;
  const totalCadastros = profissionais.reduce((s, p) => s + Number(p.total_cadastros || 0), 0);
  const totalComissao = profissionais.reduce((s, p) => s + Number(p.comissao_total || 0), 0);
  const convitesPendentes = convites.filter(c => !c.usado).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-4 pt-6 pb-4 border-b">
        <div className="flex items-center gap-2 mb-1">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-fraunces">Gestão de Enfermeiras</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-9">Convites, ativações e performance</p>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Ativas</p>
            <p className="text-2xl font-fraunces">{ativas}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Convites pendentes</p>
            <p className="text-2xl font-fraunces">{convitesPendentes}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Cadastros indicados</p>
            <p className="text-2xl font-fraunces">{totalCadastros}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Comissão total</p>
            <p className="text-2xl font-fraunces">R$ {totalComissao.toFixed(2)}</p>
          </Card>
        </div>

        {/* Botão novo convite */}
        <Dialog open={showNewConvite} onOpenChange={(o) => { setShowNewConvite(o); if (!o) setNovoConviteGerado(null); }}>
          <DialogTrigger asChild>
            <Button className="w-full"><Plus className="w-4 h-4 mr-2" /> Gerar novo convite</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{novoConviteGerado ? 'Convite gerado!' : 'Novo convite'}</DialogTitle>
            </DialogHeader>

            {novoConviteGerado ? (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Código</p>
                  <p className="font-mono font-bold">{novoConviteGerado.codigo}</p>
                </div>
                <div className="space-y-2">
                  <Label>Link para enviar à enfermeira</Label>
                  <div className="flex gap-2">
                    <p className="text-xs flex-1 bg-muted p-2 rounded break-all">{linkConvite(novoConviteGerado.codigo)}</p>
                    <Button size="icon" variant="outline" onClick={() => copiar(linkConvite(novoConviteGerado.codigo), 'novo')}>
                      {copiedId === 'novo' ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button onClick={() => { setNovoConviteGerado(null); setShowNewConvite(false); }} className="w-full">Fechar</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Nome da enfermeira *</Label>
                  <Input value={conviteForm.nome} onChange={(e) => setConviteForm({ ...conviteForm, nome: e.target.value })} placeholder="Maria Silva" />
                  <p className="text-xs text-muted-foreground">Usado para gerar o código (ex: ENF-MARIA-123)</p>
                </div>
                <div className="space-y-1">
                  <Label>E-mail destino (opcional)</Label>
                  <Input type="email" value={conviteForm.email_destino} onChange={(e) => setConviteForm({ ...conviteForm, email_destino: e.target.value })} placeholder="maria@email.com" />
                </div>
                <div className="space-y-1">
                  <Label>Validade (dias)</Label>
                  <Input type="number" value={conviteForm.dias_validade} onChange={(e) => setConviteForm({ ...conviteForm, dias_validade: parseInt(e.target.value) || 30 })} min={1} max={365} />
                </div>
                <Button onClick={handleGerarConvite} disabled={saving} className="w-full">
                  {saving ? 'Gerando...' : 'Gerar convite'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <Tabs defaultValue="enfermeiras">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="enfermeiras">Enfermeiras ({profissionais.length})</TabsTrigger>
            <TabsTrigger value="convites">Convites ({convites.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="enfermeiras" className="space-y-3 mt-4">
            {profissionais.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma enfermeira ativada ainda.</p>
            )}
            {profissionais.map(prof => (
              <Card key={prof.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{prof.nome || prof.email}</p>
                    <p className="text-xs text-muted-foreground">{prof.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${prof.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {prof.status}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Código: <span className="font-mono font-semibold">{prof.codigo_afiliada}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted p-2 rounded">
                    <p className="text-xs text-muted-foreground">Cadastros</p>
                    <p className="font-fraunces text-lg">{prof.total_cadastros}</p>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <p className="text-xs text-muted-foreground">Conversões</p>
                    <p className="font-fraunces text-lg">{prof.total_conversoes}</p>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <p className="text-xs text-muted-foreground">Comissão</p>
                    <p className="font-fraunces text-lg">R$ {Number(prof.comissao_total).toFixed(0)}</p>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <p className="text-xs flex-1 bg-muted p-2 rounded break-all">{linkIndicacao(prof.codigo_afiliada)}</p>
                  <Button size="icon" variant="outline" onClick={() => copiar(linkIndicacao(prof.codigo_afiliada), `link-${prof.id}`)}>
                    {copiedId === `link-${prof.id}` ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                {!prof.link_kiwify && (
                  <Input
                    placeholder="Link Kiwify (cole e pressione Enter)"
                    onBlur={(e) => { if (e.target.value) handleSaveLinkKiwify(prof, e.target.value); }}
                  />
                )}

                <Button variant="outline" size="sm" onClick={() => handleToggleStatus(prof)}>
                  {prof.status === 'ativo' ? 'Desativar' : 'Ativar'}
                </Button>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="convites" className="space-y-3 mt-4">
            {convites.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum convite ainda.</p>
            )}
            {convites.map(conv => {
              const expirado = conv.expires_at && new Date(conv.expires_at) < new Date();
              const status = conv.usado ? 'usado' : expirado ? 'expirado' : 'ativo';
              const cor = status === 'usado' ? 'bg-blue-100 text-blue-700' : status === 'expirado' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
              return (
                <Card key={conv.id} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-mono font-semibold text-sm">{conv.codigo}</p>
                    <span className={`text-xs px-2 py-1 rounded ${cor}`}>{status}</span>
                  </div>
                  {conv.email_destino && (
                    <p className="text-xs text-muted-foreground">Para: {conv.email_destino}</p>
                  )}
                  {conv.expires_at && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Expira: {new Date(conv.expires_at).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  {!conv.usado && !expirado && (
                    <div className="flex gap-2 items-center">
                      <p className="text-xs flex-1 bg-muted p-2 rounded break-all">{linkConvite(conv.codigo)}</p>
                      <Button size="icon" variant="outline" onClick={() => copiar(linkConvite(conv.codigo), `c-${conv.id}`)}>
                        {copiedId === `c-${conv.id}` ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  )}
                  {!conv.usado && (
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteConvite(conv.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Excluir
                    </Button>
                  )}
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
