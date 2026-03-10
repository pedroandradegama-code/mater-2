import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { nome } },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Conta criada! Redirecionando...');
      navigate('/onboarding');
    }
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
