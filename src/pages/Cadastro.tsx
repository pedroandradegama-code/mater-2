import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const codigoRef = searchParams.get("ref");
    if (codigoRef) localStorage.setItem("mater_ref", codigoRef);
    const codigoConvite = searchParams.get("convite");
    if (codigoConvite) localStorage.setItem("mater_convite", codigoConvite);
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);

    const codigoConvite = localStorage.getItem("mater_convite");
    const ref = localStorage.getItem("mater_ref");

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nome,
          utm_ref: ref ?? null,
          convite: codigoConvite ?? null,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (!signUpData?.user) {
      toast.error('Erro ao criar conta.');
      setLoading(false);
      return;
    }

    localStorage.removeItem("mater_ref");

    // Se tem convite, tenta ativar como profissional via edge function
    if (codigoConvite) {
      localStorage.removeItem("mater_convite");

      // Garante sessão ativa antes de chamar a edge function
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Email confirmation ativado — precisa confirmar antes
        toast.success('Conta criada! Verifique seu email para ativar seu perfil profissional.');
        navigate('/login');
        setLoading(false);
        return;
      }

      const { data: ativarData, error: ativarError } = await supabase.functions.invoke(
        'ativar-profissional',
        { body: { codigo_convite: codigoConvite, nome } }
      );

      if (ativarError || !ativarData?.ok) {
        console.error('Erro ativação:', ativarError, ativarData);
        toast.error(ativarData?.error || 'Erro ao ativar perfil profissional. Fale com o suporte.');
        // Usuário foi criado mesmo assim — mandamos para onboarding normal
        navigate('/onboarding');
        setLoading(false);
        return;
      }

      toast.success('Perfil profissional ativado! 🎉');
      // Força refresh do estado de profissional
      window.location.href = '/profissional';
      return;
    }

    toast.success('Conta criada!');
    navigate('/onboarding');
    setLoading(false);
  };

  return (
    <div className="gradient-mesh-bg min-h-screen flex items-center justify-center p-6">
      <div className="glass-card-elevated w-full max-w-sm p-8 animate-fade-in">
        <h1 className="font-display text-4xl font-semibold text-center mb-2">Criar Conta</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">Comece sua jornada ✨</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} required className="rounded-xl" />
          <Input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required className="rounded-xl" />
          <Input type="password" placeholder="Senha (mín. 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)} required className="rounded-xl" />
          <Button type="submit" disabled={loading} className="w-full gradient-hero text-primary-foreground rounded-xl">
            {loading ? 'Criando...' : 'Criar conta'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
