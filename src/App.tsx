import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
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
import PWAInstallBanner from "./components/PWAInstallBanner";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { profile, isLoading } = useProfile();

  if (loading || isLoading) {
    return (
      <div className="gradient-mesh-bg min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h1 className="font-display text-4xl font-semibold mb-2">Mater</h1>
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

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
            <Route path="/gestacao" element={<ProtectedRoute><Gestacao /></ProtectedRoute>} />
            <Route path="/plano-parto" element={<ProtectedRoute><PlanoParto /></ProtectedRoute>} />
            <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
            <Route path="/diario" element={<ProtectedRoute><Diario /></ProtectedRoute>} />
            <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            <Route path="/mala" element={<ProtectedRoute><Mala /></ProtectedRoute>} />
            <Route path="/nomes" element={<ProtectedRoute><NomeBebe /></ProtectedRoute>} />
            <Route path="/musica-bebe" element={<ProtectedRoute><MusicaBebe /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
