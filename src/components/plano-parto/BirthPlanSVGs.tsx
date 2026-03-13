
const svgStyle = { stroke: '#E8748A', fill: 'none', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const accent = '#B48FD4';

export function WelcomeSVG() {
  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto">
      {/* Pregnant woman silhouette with clipboard */}
      <ellipse cx="100" cy="170" rx="30" ry="4" fill="#F5EFE6" />
      <path d="M100 35 C100 35 85 40 85 55 C85 68 92 72 100 72 C108 72 115 68 115 55 C115 40 100 35 100 35Z" {...svgStyle} />
      <path d="M88 72 C82 80 78 95 78 110 C78 120 76 135 80 150 C82 158 88 165 100 165 C112 165 118 158 120 150 C124 135 122 120 122 110 C122 95 118 80 112 72" {...svgStyle} />
      <ellipse cx="100" cy="120" rx="18" ry="22" {...svgStyle} stroke={accent} strokeDasharray="4 3" />
      {/* Clipboard */}
      <rect x="130" y="85" width="28" height="36" rx="3" {...svgStyle} />
      <rect x="136" y="80" width="16" height="8" rx="2" {...svgStyle} stroke={accent} />
      <line x1="136" y1="96" x2="152" y2="96" {...svgStyle} stroke={accent} strokeWidth={1} />
      <line x1="136" y1="102" x2="150" y2="102" {...svgStyle} stroke={accent} strokeWidth={1} />
      <line x1="136" y1="108" x2="146" y2="108" {...svgStyle} stroke={accent} strokeWidth={1} />
      {/* Arm holding clipboard */}
      <path d="M112 90 C120 88 128 87 130 90" {...svgStyle} />
    </svg>
  );
}

export function PathsSVG() {
  return (
    <svg viewBox="0 0 200 160" className="w-40 h-40 mx-auto">
      <path d="M100 140 L100 80 C100 60 70 50 50 30" {...svgStyle} />
      <path d="M100 80 C100 60 130 50 150 30" {...svgStyle} />
      {/* Flowers on branches */}
      <circle cx="50" cy="28" r="8" {...svgStyle} stroke={accent} />
      <circle cx="50" cy="28" r="3" {...svgStyle} stroke="#E8748A" />
      <circle cx="150" cy="28" r="8" {...svgStyle} stroke={accent} />
      <circle cx="150" cy="28" r="3" {...svgStyle} stroke="#E8748A" />
      {/* Leaves */}
      <path d="M65 55 C70 50 75 52 72 58" {...svgStyle} stroke={accent} />
      <path d="M135 55 C130 50 125 52 128 58" {...svgStyle} stroke={accent} />
      <path d="M80 70 C85 65 90 67 87 73" {...svgStyle} stroke={accent} />
      <path d="M120 70 C115 65 110 67 113 73" {...svgStyle} stroke={accent} />
    </svg>
  );
}

export function PeopleSVG() {
  return (
    <svg viewBox="0 0 200 160" className="w-40 h-40 mx-auto">
      {/* People in circle */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const r = 55;
        const cx = 100 + r * Math.cos((angle * Math.PI) / 180);
        const cy = 80 + r * Math.sin((angle * Math.PI) / 180);
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r="10" {...svgStyle} stroke={i % 2 === 0 ? '#E8748A' : accent} />
            <circle cx={cx} cy={cy - 14} r="6" {...svgStyle} stroke={i % 2 === 0 ? '#E8748A' : accent} />
          </g>
        );
      })}
      {/* Heart in center */}
      <path d="M95 76 C95 72 88 68 88 74 C88 78 95 84 95 84 C95 84 102 78 102 74 C102 68 95 72 95 76Z" fill="#E8748A" opacity={0.3} stroke="#E8748A" strokeWidth={1.5} />
    </svg>
  );
}

export function RoomSVG() {
  return (
    <svg viewBox="0 0 200 160" className="w-40 h-40 mx-auto">
      {/* Window with light */}
      <rect x="70" y="20" width="60" height="50" rx="4" {...svgStyle} />
      <line x1="100" y1="20" x2="100" y2="70" {...svgStyle} strokeWidth={1} />
      <line x1="70" y1="45" x2="130" y2="45" {...svgStyle} strokeWidth={1} />
      {/* Light rays */}
      {[80, 90, 100, 110, 120].map(x => (
        <line key={x} x1={x} y1="70" x2={x + (x - 100) * 0.3} y2="100" stroke={accent} strokeWidth={0.8} opacity={0.4} />
      ))}
      {/* Candle */}
      <rect x="40" y="105" width="8" height="20" rx="2" {...svgStyle} stroke={accent} />
      <path d="M44 105 C44 98 40 95 44 90 C48 95 44 98 44 105" fill="#E8748A" opacity={0.3} stroke="#E8748A" strokeWidth={1} />
      {/* Plant */}
      <rect x="150" y="110" width="12" height="15" rx="2" {...svgStyle} stroke={accent} />
      <path d="M156 110 C156 100 148 95 152 88" {...svgStyle} stroke="green" opacity={0.5} />
      <path d="M156 105 C160 98 165 95 162 88" {...svgStyle} stroke="green" opacity={0.5} />
      {/* Floor */}
      <line x1="20" y1="140" x2="180" y2="140" {...svgStyle} strokeWidth={1} />
    </svg>
  );
}

export function RelaxSVG() {
  return (
    <svg viewBox="0 0 200 160" className="w-40 h-40 mx-auto">
      {/* Figure in relaxation */}
      <circle cx="100" cy="50" r="12" {...svgStyle} />
      <path d="M100 62 C100 62 88 75 85 95 C83 108 90 120 100 120 C110 120 117 108 115 95 C112 75 100 62 100 62" {...svgStyle} />
      {/* Waves */}
      {[0, 1, 2].map(i => (
        <path key={i} d={`M${55 - i * 10} ${90 + i * 15} C${70 - i * 5} ${85 + i * 15} ${130 + i * 5} ${85 + i * 15} ${145 + i * 10} ${90 + i * 15}`}
          stroke={accent} strokeWidth={1} fill="none" opacity={0.3 + i * 0.1} />
      ))}
      {/* Arms out */}
      <path d="M88 75 C75 72 65 78 60 85" {...svgStyle} stroke={accent} />
      <path d="M112 75 C125 72 135 78 140 85" {...svgStyle} stroke={accent} />
    </svg>
  );
}

export function HandsBabySVG() {
  return (
    <svg viewBox="0 0 200 160" className="w-40 h-40 mx-auto">
      {/* Two hands cupping */}
      <path d="M50 100 C50 80 70 65 85 70 C90 72 95 78 95 85" {...svgStyle} />
      <path d="M150 100 C150 80 130 65 115 70 C110 72 105 78 105 85" {...svgStyle} />
      {/* Baby */}
      <circle cx="100" cy="82" r="8" {...svgStyle} stroke={accent} />
      <ellipse cx="100" cy="100" rx="12" ry="16" {...svgStyle} stroke={accent} />
      {/* Fingers */}
      <path d="M50 100 C55 105 60 108 70 108" {...svgStyle} />
      <path d="M150 100 C145 105 140 108 130 108" {...svgStyle} />
    </svg>
  );
}

export function MotherBabySVG() {
  return (
    <svg viewBox="0 0 200 160" className="w-40 h-40 mx-auto">
      {/* Mother lying with baby */}
      <path d="M40 120 C40 100 55 85 70 85 L160 85" {...svgStyle} />
      {/* Pillow */}
      <ellipse cx="55" cy="78" rx="20" ry="10" {...svgStyle} stroke={accent} strokeDasharray="3 2" />
      {/* Mother head */}
      <circle cx="60" cy="68" r="12" {...svgStyle} />
      {/* Baby on chest */}
      <circle cx="95" cy="72" r="6" {...svgStyle} stroke={accent} />
      <ellipse cx="95" cy="82" rx="7" ry="8" {...svgStyle} stroke={accent} />
      {/* Blanket */}
      <path d="M70 95 C90 90 130 90 160 95 L160 120 C130 115 90 115 70 120 Z" fill="#F5EFE6" opacity={0.5} stroke="#E8748A" strokeWidth={1} />
      {/* Light rays from top */}
      <line x1="90" y1="20" x2="90" y2="40" stroke={accent} strokeWidth={0.8} opacity={0.3} />
      <line x1="100" y1="15" x2="100" y2="38" stroke={accent} strokeWidth={0.8} opacity={0.3} />
      <line x1="110" y1="20" x2="110" y2="40" stroke={accent} strokeWidth={0.8} opacity={0.3} />
    </svg>
  );
}

export function EmergencySVG() {
  return (
    <svg viewBox="0 0 200 160" className="w-40 h-40 mx-auto">
      {/* Two paths connected by bridge */}
      <path d="M30 130 C30 100 40 70 50 50 C55 40 58 35 60 30" {...svgStyle} stroke={accent} />
      <path d="M170 130 C170 100 160 70 150 50 C145 40 142 35 140 30" {...svgStyle} stroke="#E8748A" />
      {/* Bridge */}
      <path d="M60 70 C80 60 120 60 140 70" {...svgStyle} strokeWidth={2} />
      <line x1="80" y1="63" x2="80" y2="70" {...svgStyle} strokeWidth={1} />
      <line x1="100" y1="60" x2="100" y2="68" {...svgStyle} strokeWidth={1} />
      <line x1="120" y1="63" x2="120" y2="70" {...svgStyle} strokeWidth={1} />
      {/* Peaceful symbol (left) */}
      <circle cx="60" cy="25" r="8" stroke={accent} strokeWidth={1.5} fill="none" />
      <path d="M57 23 C59 22 61 22 63 23 C63 25 61 27 60 27 C59 27 57 25 57 23Z" fill={accent} opacity={0.3} />
      {/* Alert symbol (right) */}
      <polygon points="140,18 135,30 145,30" stroke="#E8748A" strokeWidth={1.5} fill="none" />
      <line x1="140" y1="23" x2="140" y2="27" stroke="#E8748A" strokeWidth={1.5} />
      <circle cx="140" cy="29" r="0.8" fill="#E8748A" />
    </svg>
  );
}
