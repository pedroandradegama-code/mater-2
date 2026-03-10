import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
  };

  return (
    <div className="gradient-mesh-bg min-h-screen flex items-center justify-center p-6">
      <div className="glass-card-elevated w-full max-w-sm p-8 animate-fade-in">
        <h1 className="font-display text-4xl font-semibold text-center mb-2">Mater</h1>
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

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button variant="outline" onClick={handleGoogle} className="w-full rounded-xl">
          Entrar com Google
        </Button>

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
