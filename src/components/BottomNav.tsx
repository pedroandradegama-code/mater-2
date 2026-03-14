import { useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  CalcIcon,
  SproutIcon,
  BookIcon,
  UserIcon,
} from '@/components/dashboard/DashboardIcons';

const navItems = [
  { path: '/dashboard', Icon: HomeIcon, label: 'Início' },
  { path: '/calculadoras', Icon: CalcIcon, label: 'Calc.' },
  { path: '/gestacao', Icon: SproutIcon, label: 'Gestação' },
  { path: '/diario', Icon: BookIcon, label: 'Diário' },
  { path: '/perfil', Icon: UserIcon, label: 'Perfil' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav px-2 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(({ path, Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-6 h-6" active={active} />
              <span className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
