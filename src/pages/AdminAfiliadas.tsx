import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Eye, Users, DollarSign, TrendingUp, Crown } from 'lucide-react';

const ADMIN_EMAIL = 'pedroandradegama@gmail.com';

interface Afiliada {
  id: string;
  nome: string;
  email: string;
  whatsapp: string | null;
  codigo_afiliada: string | null;
  link_kiwify: string | null;
  status: string;
  profissao: string | null;
  indicada_por: string | null;
  created_at: string;
  total_vendas: number;
  comissao_paga: number;
  comissao_pendente: number;
}

interface Venda {
  id: string;
  email_compradora: string;
  valor_venda: number;
  comissao: number;
  status_pagamento: string;
  data_venda: string;
  kiwify_order_id: string | null;
}

async function callAdmin(action: string, method = 'GET', body?: any, params?: Record<string, string>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Não autenticado');

  const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-afiliadas`);
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

export default function AdminAfiliadas() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [afiliadas, setAfiliadas] = useState<Afiliada[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showVendas, setShowVendas] = useState(false);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [selectedAfiliada, setSelectedAfiliada] = useState<Afiliada | null>(null);
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '', profissao: 'enfermeira', indicada_por: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      navigate('/dashboard');
    }
  }, [user, loading]);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) loadAfiliadas();
  }, [user]);

  const loadAfiliadas = async () => {
    try {
      const data = await callAdmin('list');
      setAfiliadas(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreate = async () => {
    if (!form.nome || !form.email) return toast.error('Nome e e-mail são obrigatórios');
    setSaving(true);
    try {
      await callAdmin('create', 'POST', form);
      toast.success('Afiliada cadastrada!');
      setShowNew(false);
      setForm({ nome: '', email: '', whatsapp: '', profissao: 'enfermeira', indicada_por: '' });
      loadAfiliadas();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleViewVendas = async (af: Afiliada) => {
    setSelectedAfiliada(af);
    setShowVendas(true);
    try {
      const data = await callAdmin('vendas', 'GET', undefined, { afiliada_id: af.id });
      setVendas(data);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleUpdateLink = async (af: Afiliada, link: string) => {
    try {
      await callAdmin('update', 'PATCH', { id: af.id, link_kiwify: link });
      toast.success('Link atualizado!');
      loadAfiliadas();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleToggleStatus = async (af: Afiliada) => {
    const newStatus = af.status === 'ativa' ? 'pausada' : 'ativa';
    try {
      await callAdmin('update', 'PATCH', { id: af.id, status: newStatus });
      toast.success(`Status alterado para ${newStatus}`);
      loadAfiliadas();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const ativas = afiliadas.filter(a => a.status === 'ativa').length;
  const totalVendasMes = afiliadas.reduce((acc, a) => acc + Number(a.total_vendas), 0);
  const totalComissaoPaga = afiliadas.reduce((acc, a) => acc + Number(a.comissao_paga), 0);
  const topAfiliada = afiliadas.length > 0
    ? afiliadas.reduce((top, a) => Number(a.total_vendas) > Number(top.total_vendas) ? a : top, afiliadas[0])
    : null;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/dashboard')} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-semibold">Gestão de Afiliadas</h1>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 bg-card border-border/40">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Ativas</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{ativas}</p>
          </Card>
          <Card className="p-3 bg-card border-border/40">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Vendas</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalVendasMes}</p>
          </Card>
          <Card className="p-3 bg-card border-border/40">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Comissões Pagas</span>
            </div>
            <p className="text-2xl font-bold text-foreground">R$ {totalComissaoPaga.toFixed(2)}</p>
          </Card>
          <Card className="p-3 bg-card border-border/40">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Top Afiliada</span>
            </div>
            <p className="text-sm font-bold text-foreground truncate">{topAfiliada?.nome || '—'}</p>
          </Card>
        </div>

        {/* New Affiliate Button */}
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2">
              <Plus className="w-4 h-4" /> Nova Afiliada
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Cadastrar Afiliada</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nome *</Label>
                <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Maria Silva" />
              </div>
              <div>
                <Label>E-mail *</Label>
                <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="maria@email.com" type="email" />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="(11) 99999-9999" />
              </div>
              <div>
                <Label>Profissão</Label>
                <Input value={form.profissao} onChange={e => setForm({ ...form, profissao: e.target.value })} placeholder="enfermeira" />
              </div>
              <div>
                <Label>Indicada por</Label>
                <Input value={form.indicada_por} onChange={e => setForm({ ...form, indicada_por: e.target.value })} placeholder="sogra, amiga..." />
              </div>
              <Button onClick={handleCreate} disabled={saving} className="w-full">
                {saving ? 'Salvando...' : 'Cadastrar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Affiliates Table */}
        <div className="space-y-2">
          {afiliadas.map(af => (
            <Card key={af.id} className="p-4 bg-card border-border/40">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{af.nome}</h3>
                  <p className="text-xs text-muted-foreground">{af.email}</p>
                  {af.whatsapp && <p className="text-xs text-muted-foreground">{af.whatsapp}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  af.status === 'ativa' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                }`}>
                  {af.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                <span>Código: <strong>{af.codigo_afiliada || '—'}</strong></span>
                <span>Vendas: <strong>{af.total_vendas}</strong></span>
              </div>
              <div className="flex items-center gap-4 text-xs mb-3">
                <span className="text-green-600">Pago: R$ {Number(af.comissao_paga).toFixed(2)}</span>
                <span className="text-amber-600">Pendente: R$ {Number(af.comissao_pendente).toFixed(2)}</span>
              </div>
              {/* Link Kiwify inline edit */}
              {!af.link_kiwify && (
                <div className="mb-2">
                  <Input
                    placeholder="Cole o link Kiwify aqui"
                    className="text-xs h-8"
                    onBlur={(e) => {
                      if (e.target.value) handleUpdateLink(af, e.target.value);
                    }}
                  />
                </div>
              )}
              {af.link_kiwify && (
                <p className="text-xs text-primary truncate mb-2">{af.link_kiwify}</p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleViewVendas(af)}>
                  <Eye className="w-3 h-3" /> Ver vendas
                </Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleToggleStatus(af)}>
                  {af.status === 'ativa' ? 'Pausar' : 'Ativar'}
                </Button>
              </div>
            </Card>
          ))}
          {afiliadas.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhuma afiliada cadastrada ainda.</p>
          )}
        </div>
      </div>

      {/* Vendas Dialog */}
      <Dialog open={showVendas} onOpenChange={setShowVendas}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Vendas — {selectedAfiliada?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {vendas.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma venda registrada.</p>}
            {vendas.map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">{v.email_compradora}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(v.data_venda).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">R$ {Number(v.comissao).toFixed(2)}</p>
                  <span className={`text-xs ${v.status_pagamento === 'pago' ? 'text-green-600' : 'text-amber-600'}`}>
                    {v.status_pagamento}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
