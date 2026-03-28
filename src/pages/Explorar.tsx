import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { calculatePregnancyInfo, parseLocalDate } from '@/lib/pregnancy-data';
import BottomNav from '@/components/BottomNav';
import { ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import {
  CalculadoraIcon,
  FAQIcon,
} from '@/components/dashboard/DashboardIcons';

function GestacaoIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="10" cy="11" rx="5" ry="6" fill="currentColor" fillOpacity={0.1} />
      <path d="M10 2c0 0 1.5 1 1.5 3" /><path d="M8.5 5c0 0-1 .5-1.5 1.5" />
    </svg>
  );
}
function CurvaPesoIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 15l4-4 3 3 4-5 3 2" /><path d="M3 3v14h14" />
    </svg>
  );
}

interface Tool {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  path: string;
  tag?: string;
  tagColor?: string;
}

const tools: Tool[] = [
  {
    icon: CalculadoraIcon,
    label: 'Calculadoras clínicas',
    desc: '13 calculadoras: DUM, IMC gestacional, hidratação, período fértil e mais',
    path: '/calculadoras',
    tag: 'Popular',
    tagColor: 'bg-primary/10 text-primary',
  },
  {
    icon: GestacaoIcon,
    label: 'Gestação semana a semana',
    desc: 'Acompanhe o desenvolvimento do bebê com detalhes por trimestre e vacinas',
    path: '/gestacao',
  },
  {
    icon: CurvaPesoIcon,
    label: 'Curva de Peso',
    desc: 'Registre seu peso e acompanhe a evolução com referências da OMS',
    path: '/curva-peso',
  },
  {
    icon: FAQIcon,
    label: 'FAQ médico',
    desc: 'Dúvidas frequentes validadas com base em FEBRASGO e SBP',
    path: '/faq',
    tag: 'Dr. validou',
    tagColor: 'bg-green-50 text-green-700',
  },
];

export default function Explorar() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const dum = profile?.dum ? parseLocalDate(profile.dum) : undefined;
  const info = dum ? calculatePregnancyInfo(dum) : null;

  const filtered = tools.filter(
    (t) =>
      t.label.toLowerCase().includes(query.toLowerCase()) ||
      t.desc.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="dashboard-bg min-h-screen pb-28">
      <div className="app-container px-5 pt-6">
        <div className="mb-6 animate-fade-up">
          <p className="text-sm text-muted-foreground font-body">Ferramentas gratuitas</p>
          <h1 className="font-display text-2xl font-bold text-foreground">Explorar</h1>
        </div>

        <div className="relative mb-5 animate-fade-up">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar ferramenta..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-card border border-[var(--card-border-color)] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {info && !query && (
          <button
            onClick={() => navigate('/gestacao')}
            className="card-press w-full mb-5 rounded-[20px] border border-[var(--card-border-color)] bg-card p-4 flex items-center gap-4 animate-fade-up text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center flex-shrink-0">
              <GestacaoIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Sua semana atual</p>
              <p className="font-display text-base font-bold text-foreground leading-tight">
                Semana {Math.min(info.weeks, 40)} — {info.trimester}º trimestre
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Veja o que está acontecendo agora →</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
          </button>
        )}

        <div className="space-y-2.5 animate-fade-up">
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-10">
              Nenhuma ferramenta encontrada para "{query}"
            </p>
          )}
          {filtered.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.path}
                onClick={() => navigate(tool.path)}
                className="card-press w-full flex items-center gap-4 bg-card rounded-2xl border border-[var(--card-border-color)] px-4 py-3.5 text-left"
              >
                <div className="w-11 h-11 rounded-[12px] bg-primary-light flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-foreground">{tool.label}</span>
                    {tool.tag && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${tool.tagColor}`}>
                        {tool.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{tool.desc}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
