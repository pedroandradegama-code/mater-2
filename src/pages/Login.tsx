import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import logoSrc from '@/assets/LogoMater01.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    // Verifica se é profissional para redirecionar corretamente
    if (data.user) {
      const { data: prof } = await (supabase as any)
        .from('profissionais')
        .select('id, status')
        .eq('user_id', data.user.id)
        .eq('status', 'ativo')
        .maybeSingle();
      if (prof) {
        navigate('/profissional');
        setLoading(false);
        return;
      }
    }
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="gradient-mesh-bg min-h-screen flex items-center justify-center p-6">
      <div className="glass-card-elevated w-full max-w-sm p-8 animate-fade-in">
        <img src={logoSrc} alt="Mater" className="h-20 mx-auto mb-1" />
        <p className="text-muted-foreground text-center text-sm mb-8">Sua gestação, seu momento ✨</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="rounded-xl"
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="rounded-xl"
          />
          <Button type="submit" disabled={loading} className="w-full gradient-hero text-primary-foreground rounded-xl">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem conta?{' '}
          <Link to="/cadastro" className="text-primary font-medium hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
