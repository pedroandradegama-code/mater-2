import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useProfissional } from "@/hooks/useProfissional";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Calculadoras from "./pages/Calculadoras";
import Gestacao from "./pages/Gestacao";
import PlanoParto from "./pages/PlanoParto";
import Agenda from "./pages/Agenda";
import Diario from "./pages/Diario";
import FAQ from "./pages/FAQ";
import Perfil from "./pages/Perfil";
import Mala from "./pages/Mala";
import NomeBebe from "./pages/NomeBebe";
import MusicaBebe from "./pages/MusicaBebe";
import NotFound from "./pages/NotFound";
import AdminAfiliadas from "./pages/AdminAfiliadas";
import AdminProfissionais from "./pages/AdminProfissionais";
import CurvaPeso from "./pages/CurvaPeso";
import Eventos from "./pages/Eventos";
import Explorar from "./pages/Explorar";
import MeusExames from "./pages/MeusExames";
import JornadaSaude from "./pages/JornadaSaude";
import PassaporteMamae from "./pages/PassaporteMamae";
import Playlists from "./pages/Playlists";
import PWAInstallBanner from "./components/PWAInstallBanner";
import { ProfissionalProvider } from "@/hooks/useProfissional";
import ProfissionalDashboard from "./pages/ProfissionalDashboard";
import UploadCartao from "@/pages/UploadCartao";
import CartaoGestante from "@/pages/CartaoGestante";
import logoSrc from "@/assets/LogoMater01.png";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowProfissional = false }: { children: React.ReactNode; allowProfissional?: boolean }) {
  const { user, loading } = useAuth();
  const { profile, isLoading } = useProfile();
  const { isProfissional, loading: profLoading } = useProfissional();

  if (loading || isLoading || profLoading) {
    return (
      <div className="gradient-mesh-bg min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <img src={logoSrc} alt="Mater" className="h-12 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  // Profissional sempre vai para /profissional, exceto em rotas explicitamente permitidas (admin)
  if (isProfissional && !allowProfissional) return <Navigate to="/profissional" replace />;
  if (!isProfissional && profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}

function ProfissionalRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isProfissional, loading: profLoading } = useProfissional();

  if (loading || profLoading) {
    return (
      <div className="gradient-mesh-bg min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <img src={logoSrc} alt="Mater" className="h-12 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isProfissional) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProfissionalProvider>
      <TooltipProvider>
        <Sonner />
        <PWAInstallBanner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/cadastro" element={<AuthRoute><Cadastro /></AuthRoute>} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/calculadoras" element={<ProtectedRoute><Calculadoras /></ProtectedRoute>} />
            <Route path="/explorar" element={<ProtectedRoute><Explorar /></ProtectedRoute>} />
            <Route path="/gestacao" element={<ProtectedRoute><Gestacao /></ProtectedRoute>} />
            <Route path="/plano-parto" element={<ProtectedRoute><PlanoParto /></ProtectedRoute>} />
            <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
            <Route path="/diario" element={<ProtectedRoute><Diario /></ProtectedRoute>} />
            <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            <Route path="/mala" element={<ProtectedRoute><Mala /></ProtectedRoute>} />
            <Route path="/nomes" element={<ProtectedRoute><NomeBebe /></ProtectedRoute>} />
            <Route path="/musica-bebe" element={<ProtectedRoute><MusicaBebe /></ProtectedRoute>} />
            <Route path="/curva-peso" element={<ProtectedRoute><CurvaPeso /></ProtectedRoute>} />
            <Route path="/eventos" element={<ProtectedRoute><Eventos /></ProtectedRoute>} />
            <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
            <Route path="/meus-exames" element={<ProtectedRoute><MeusExames /></ProtectedRoute>} />
            <Route path="/jornada-saude" element={<ProtectedRoute><JornadaSaude /></ProtectedRoute>} />
            <Route path="/passaporte" element={<ProtectedRoute><PassaporteMamae /></ProtectedRoute>} />
            <Route path="/admin/afiliadas" element={<ProtectedRoute allowProfissional><AdminAfiliadas /></ProtectedRoute>} />
            <Route path="/admin/profissionais" element={<ProtectedRoute allowProfissional><AdminProfissionais /></ProtectedRoute>} />
            <Route path="/cartao-gestante" element={<ProtectedRoute><CartaoGestante /></ProtectedRoute>} />
            <Route path="/upload/cartao" element={<UploadCartao />} />
            <Route path="/profissional" element={<ProfissionalRoute><ProfissionalDashboard /></ProfissionalRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </ProfissionalProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
