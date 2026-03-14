// SVG icons for dashboard — all custom, no emojis

export function CalculadoraIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="20" height="24" rx="3" />
      <rect x="7" y="5" width="14" height="6" rx="1.5" />
      <circle cx="10" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="10" cy="20" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="20" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AgendaIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="22" height="20" rx="3" />
      <path d="M3 11h22" />
      <path d="M9 3v4" />
      <path d="M19 3v4" />
      <circle cx="14" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DiarioIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H21a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 23.5v-19Z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H23" />
      <path d="M9 7h10" />
      <path d="M9 11h7" />
    </svg>
  );
}

export function FAQIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H9l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10Z" />
      <path d="M12 8.5a2 2 0 0 1 3.5 1.3c0 1.2-2 1.7-2 3.2" />
      <circle cx="13.5" cy="16" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MalaIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="20" height="16" rx="3" />
      <path d="M10 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M14 13v5" />
      <path d="M11.5 15.5h5" />
    </svg>
  );
}

export function NomesIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2l3.09 6.26L24 9.27l-5 4.87 1.18 6.88L14 17.77l-6.18 3.25L9 14.14l-5-4.87 6.91-1.01L14 2z" />
      <text x="14" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="7" fontFamily="var(--font-display)" fontWeight="700">A</text>
    </svg>
  );
}

export function PlanoPartoIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2h8l6 6v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M16 2v6h6" />
      <path d="M9 15l2 2 4-4" />
      <path d="M9 21h10" />
    </svg>
  );
}

export function EnqueteIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="16" width="4" height="8" rx="1" />
      <rect x="12" y="10" width="4" height="14" rx="1" />
      <rect x="20" y="4" width="4" height="20" rx="1" />
      <path d="M10 4l2-2 2 2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function EstetoscopioIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10V5a3 3 0 0 1 6 0v5" />
      <path d="M9 10v6a5 5 0 0 0 10 0v-2" />
      <circle cx="19" cy="11" r="2" />
      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CalendarioVazioIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="10" width="36" height="32" rx="4" />
      <path d="M6 18h36" />
      <path d="M16 6v8" />
      <path d="M32 6v8" />
      <path d="M18 28l12 0" opacity="0.3" />
      <path d="M20 34l8 0" opacity="0.3" />
    </svg>
  );
}

// Bottom nav icons (stroke-based, thinner)
export function HomeIcon({ className = "w-6 h-6", active = false }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

export function CalcIcon({ className = "w-6 h-6", active = false }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8" />
      <path d="M8 10h8" />
      <path d="M8 14h4" />
      <path d="M8 18h4" />
    </svg>
  );
}

export function SproutIcon({ className = "w-6 h-6", active = false }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V10" />
      <path d="M7 10c0-4 5-8 5-8s5 4 5 8" />
      <path d="M4 16c2-2 5-2 8 0" />
      <path d="M20 16c-2-2-5-2-8 0" />
    </svg>
  );
}

export function BookIcon({ className = "w-6 h-6", active = false }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h5" />
    </svg>
  );
}

export function UserIcon({ className = "w-6 h-6", active = false }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

// Peso (scale) icon
export function BalancaIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="M4 8l8-5 8 5" />
      <path d="M4 8c0 3 2 5 4 5s4-2 4-5" />
      <path d="M12 8c0 3 2 5 4 5s4-2 4-5" />
    </svg>
  );
}

// Régua (ruler) icon
export function ReguaIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="8" rx="1" />
      <path d="M7 8v3" />
      <path d="M10 8v2" />
      <path d="M13 8v3" />
      <path d="M16 8v2" />
      <path d="M19 8v3" />
    </svg>
  );
}

// Fetus illustration — minimalist line art
export function FetusIllustration({ className = "w-[90px] h-[90px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 90" fill="none">
      <ellipse cx="45" cy="45" rx="38" ry="40" fill="hsl(338 73% 43% / 0.06)" />
      {/* Fetal position — curled body */}
      <path
        d="M55 25c-3-4-10-5-15-2s-8 10-7 17c1 5 3 9 3 14s-2 8-1 11c1 2 4 3 7 2s5-4 7-8c2-3 4-7 7-9s7-2 8-5c1-4-2-8-5-12s-3-5-4-8z"
        stroke="hsl(338 73% 43%)"
        strokeWidth="1.5"
        fill="hsl(338 73% 43% / 0.08)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Head */}
      <circle cx="42" cy="28" r="8" stroke="hsl(338 73% 43%)" strokeWidth="1.5" fill="hsl(338 73% 43% / 0.08)" />
      {/* Tiny hand */}
      <path d="M52 38c2 1 3 3 2 5" stroke="hsl(338 73% 43%)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
