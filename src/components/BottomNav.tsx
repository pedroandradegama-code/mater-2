import { useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserIcon,
} from '@/components/dashboard/DashboardIcons';

function ExplorarIcon({ active }: { active?: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-3.5-3.5" />
    </svg>
  );
}

function MeuEspacoIcon({ active }: { active?: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function MusicaNavIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity={0.15} />
      <circle cx="18" cy="16" r="3" fill="currentColor" fillOpacity={0.15} />
    </svg>
  );
}

const EXPLORAR_PATHS = ['/explorar', '/calculadoras', '/gestacao', '/faq', '/curva-peso', '/jornada-saude'];
const MEU_ESPACO_PATHS = ['/diario', '/agenda', '/mala', '/plano-parto', '/nomes', '/eventos', '/meus-exames', '/passaporte'];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const isHome     = path === '/dashboard';
  const isExplorar = EXPLORAR_PATHS.includes(path);
  const isMusica   = path === '/musica-bebe';
  const isMeuEspaco = MEU_ESPACO_PATHS.includes(path);
  const isPerfil   = path === '/perfil';

  return (
    <nav className="bottom-nav px-2 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">

        <button
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
            isHome ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <HomeIcon className="w-6 h-6" active={isHome} />
          <span className={`text-[10px] ${isHome ? 'font-semibold' : 'font-medium'}`}>Início</span>
        </button>

        <button
          onClick={() => navigate('/explorar')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
            isExplorar ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ExplorarIcon active={isExplorar} />
          <span className={`text-[10px] ${isExplorar ? 'font-semibold' : 'font-medium'}`}>Explorar</span>
        </button>

        <button
          onClick={() => navigate('/musica-bebe')}
          className="flex flex-col items-center gap-1 -mt-5 transition-all"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all text-primary-foreground ${
              isMusica ? 'bg-primary scale-105' : 'bg-primary'
            }`}
            style={{ boxShadow: `0 4px 18px hsl(var(--primary) / 0.45)` }}
          >
            <MusicaNavIcon />
          </div>
          <span className={`text-[10px] font-medium mt-0.5 ${isMusica ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
            Música
          </span>
        </button>

        <button
          onClick={() => navigate('/diario')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
            isMeuEspaco ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MeuEspacoIcon active={isMeuEspaco} />
          <span className={`text-[10px] ${isMeuEspaco ? 'font-semibold' : 'font-medium'}`}>Meu Espaço</span>
        </button>

        <button
          onClick={() => navigate('/perfil')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
            isPerfil ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserIcon className="w-6 h-6" active={isPerfil} />
          <span className={`text-[10px] ${isPerfil ? 'font-semibold' : 'font-medium'}`}>Perfil</span>
        </button>

      </div>
    </nav>
  );
}
