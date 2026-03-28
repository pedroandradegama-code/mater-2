import { useEffect, useRef } from 'react';

// Escala do bebê por semana gestacional (semana 4 a 40)
function getBabyScale(week: number): number {
  if (week <= 6)  return 0.02;
  if (week <= 8)  return 0.04;
  if (week <= 10) return 0.07;
  if (week <= 12) return 0.12;
  if (week <= 14) return 0.18;
  if (week <= 16) return 0.25;
  if (week <= 18) return 0.33;
  if (week <= 20) return 0.40;
  if (week <= 22) return 0.48;
  if (week <= 24) return 0.55;
  if (week <= 26) return 0.62;
  if (week <= 28) return 0.69;
  if (week <= 30) return 0.75;
  if (week <= 32) return 0.82;
  if (week <= 34) return 0.88;
  if (week <= 36) return 0.93;
  if (week <= 38) return 0.97;
  return 1.0;
}

interface BabyViewer3DProps {
  week: number;
  sex?: 'menina' | 'menino' | 'surpresa' | null;
  className?: string;
}

export function BabyViewer3D({ week, sex, className = 'w-[110px] h-[110px]' }: BabyViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scale = getBabyScale(week);

  const lightColor = sex === 'menina'
    ? '#f9a8d4'
    : sex === 'menino'
    ? '#93c5fd'
    : '#c4b5fd';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Remove existing model-viewer if any
    const existing = container.querySelector('model-viewer');
    if (existing) existing.remove();

    const mv = document.createElement('model-viewer') as any;
    mv.setAttribute('src', '/models/baby.glb');
    mv.setAttribute('alt', `Bebê na semana ${week}`);
    mv.setAttribute('auto-rotate', '');
    mv.setAttribute('auto-rotate-delay', '0');
    mv.setAttribute('rotation-per-second', '20deg');
    mv.setAttribute('interaction-prompt', 'none');
    mv.setAttribute('shadow-intensity', '0.4');
    mv.setAttribute('exposure', '0.85');
    mv.setAttribute('scale', `${scale} ${scale} ${scale}`);
    mv.setAttribute('camera-orbit', '0deg 75deg 2m');
    mv.setAttribute('environment-image', 'neutral');
    mv.style.width = '100%';
    mv.style.height = '100%';
    mv.style.background = 'transparent';
    mv.style.setProperty('--progress-bar-color', 'transparent');
    mv.style.setProperty('--progress-mask', 'transparent');

    const style = document.createElement('style');
    style.textContent = `model-viewer::part(default-progress-bar) { display: none; }`;
    mv.appendChild(style);

    container.insertBefore(mv, container.firstChild);

    return () => {
      mv.remove();
    };
  }, [week, scale]);

  return (
    <div ref={containerRef} className={`${className} relative`} style={{ borderRadius: '50%', overflow: 'hidden' }}>
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
