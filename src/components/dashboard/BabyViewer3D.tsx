import { useEffect, useRef } from 'react';

// Escala do bebê por semana gestacional (semana 4 a 40)
// Modelo é term (38s), então escala 1.0 = semana 38+
function getBabyScale(week: number): number {
  if (week <= 6)  return 0.08;
  if (week <= 8)  return 0.12;
  if (week <= 10) return 0.18;
  if (week <= 12) return 0.25;
  if (week <= 14) return 0.32;
  if (week <= 16) return 0.40;
  if (week <= 18) return 0.48;
  if (week <= 20) return 0.55;
  if (week <= 22) return 0.62;
  if (week <= 24) return 0.68;
  if (week <= 26) return 0.74;
  if (week <= 28) return 0.79;
  if (week <= 30) return 0.83;
  if (week <= 32) return 0.87;
  if (week <= 34) return 0.91;
  if (week <= 36) return 0.95;
  if (week <= 38) return 0.98;
  return 1.0;
}

interface BabyViewer3DProps {
  week: number;
  sex?: 'menina' | 'menino' | 'surpresa' | null;
  className?: string;
}

export function BabyViewer3D({ week, sex, className = 'w-[110px] h-[110px]' }: BabyViewer3DProps) {
  const scale = getBabyScale(week);

  // Cor de iluminação baseada no sexo (igual ao tema dinâmico do app)
  const lightColor = sex === 'menina'
    ? '#f9a8d4'   // rose
    : sex === 'menino'
    ? '#93c5fd'   // blue
    : '#c4b5fd';  // purple (surpresa)

  return (
    <div className={`${className} relative`} style={{ borderRadius: '50%', overflow: 'hidden' }}>
      {/* @ts-ignore — model-viewer é web component, TypeScript não conhece */}
      <model-viewer
        src="/models/baby.glb"
        alt={`Bebê na semana ${week}`}
        auto-rotate
        auto-rotate-delay="0"
        rotation-per-second="20deg"
        camera-controls={false}
        interaction-prompt="none"
        shadow-intensity="0.4"
        exposure="0.85"
        scale={`${scale} ${scale} ${scale}`}
        camera-orbit="0deg 75deg 2m"
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
          '--progress-bar-color': 'transparent',
          '--progress-mask': 'transparent',
        } as React.CSSProperties}
        environment-image="neutral"
      >
        {/* Iluminação suave baseada no sexo */}
        <style>{`
          model-viewer::part(default-progress-bar) { display: none; }
        `}</style>
      </model-viewer>

      {/* Overlay de glow sutil baseado no sexo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${lightColor}22 0%, transparent 70%)`,
          borderRadius: '50%',
        }}
      />
    </div>
  );
}
