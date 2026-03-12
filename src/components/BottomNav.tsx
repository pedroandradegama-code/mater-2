import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calculator, Sprout, BookOpen, User } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Início' },
  { path: '/calculadoras', icon: Calculator, label: 'Calc.' },
  { path: '/gestacao', icon: Sprout, label: 'Gestação' },
  { path: '/diario', icon: BookOpen, label: 'Diário' },
  { path: '/perfil', icon: User, label: 'Perfil' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav px-2 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
