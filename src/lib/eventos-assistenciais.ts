export interface EventoRecomendado {
  semanaMin: number;
  semanaMax: number;
  tipo: 'exame' | 'consulta' | 'vacina';
  nome: string;
}

export const eventosRecomendados: EventoRecomendado[] = [
  // 1ª consulta (até semana 12)
  { semanaMin: 4, semanaMax: 12, tipo: 'consulta', nome: '1ª consulta pré-natal' },
  { semanaMin: 4, semanaMax: 12, tipo: 'exame', nome: 'Hemograma' },
  { semanaMin: 4, semanaMax: 12, tipo: 'exame', nome: 'Tipagem sanguínea e Rh' },
  { semanaMin: 4, semanaMax: 12, tipo: 'exame', nome: 'Glicemia de jejum' },
  { semanaMin: 4, semanaMax: 12, tipo: 'exame', nome: 'Urina tipo I + urocultura' },
  { semanaMin: 4, semanaMax: 12, tipo: 'exame', nome: 'VDRL (sífilis)' },
  { semanaMin: 4, semanaMax: 12, tipo: 'exame', nome: 'Anti-HIV' },
  { semanaMin: 4, semanaMax: 12, tipo: 'exame', nome: 'Toxoplasmose IgG/IgM' },
  { semanaMin: 4, semanaMax: 12, tipo: 'exame', nome: 'Rubéola IgG' },
  { semanaMin: 4, semanaMax: 12, tipo: 'exame', nome: 'Hepatite B (HBsAg)' },
  { semanaMin: 4, semanaMax: 12, tipo: 'exame', nome: 'Hepatite C' },
  { semanaMin: 4, semanaMax: 12, tipo: 'exame', nome: 'HTLV' },
  { semanaMin: 4, semanaMax: 12, tipo: 'exame', nome: 'Citopatológico do colo (se indicado)' },
  { semanaMin: 4, semanaMax: 12, tipo: 'vacina', nome: 'Hepatite B (se não vacinada)' },
  { semanaMin: 4, semanaMax: 12, tipo: 'vacina', nome: 'dT/dTpa' },

  // Semana 11-14
  { semanaMin: 11, semanaMax: 14, tipo: 'exame', nome: 'USG morfológico 1º tri (translucência nucal)' },
  { semanaMin: 11, semanaMax: 14, tipo: 'consulta', nome: '2ª consulta pré-natal' },

  // Semana 16-20
  { semanaMin: 16, semanaMax: 20, tipo: 'consulta', nome: '3ª consulta pré-natal' },
  { semanaMin: 16, semanaMax: 20, tipo: 'exame', nome: 'VDRL de controle' },

  // Semana 20-24
  { semanaMin: 20, semanaMax: 24, tipo: 'exame', nome: 'USG morfológico 2º trimestre' },
  { semanaMin: 20, semanaMax: 24, tipo: 'consulta', nome: '4ª consulta pré-natal' },
  { semanaMin: 20, semanaMax: 28, tipo: 'vacina', nome: 'dTpa (preferencialmente 20-28 sem)' },

  // Semana 24-28
  { semanaMin: 24, semanaMax: 28, tipo: 'exame', nome: 'Glicemia de jejum / TOTG 75g (DMG)' },
  { semanaMin: 24, semanaMax: 28, tipo: 'exame', nome: 'Hemograma de controle' },
  { semanaMin: 24, semanaMax: 28, tipo: 'consulta', nome: '5ª consulta pré-natal' },

  // Semana 28-32
  { semanaMin: 28, semanaMax: 32, tipo: 'exame', nome: 'VDRL de controle' },
  { semanaMin: 28, semanaMax: 32, tipo: 'exame', nome: 'Urina de controle' },
  { semanaMin: 28, semanaMax: 32, tipo: 'consulta', nome: '6ª consulta pré-natal' },

  // Semana 32-36
  { semanaMin: 32, semanaMax: 36, tipo: 'exame', nome: 'USG obstétrico (crescimento fetal)' },
  { semanaMin: 35, semanaMax: 37, tipo: 'exame', nome: 'Streptococcus B (swab vaginal/retal)' },
  { semanaMin: 32, semanaMax: 36, tipo: 'consulta', nome: '7ª consulta pré-natal' },

  // Semana 36-40
  { semanaMin: 36, semanaMax: 38, tipo: 'consulta', nome: '8ª consulta pré-natal' },
  { semanaMin: 38, semanaMax: 40, tipo: 'consulta', nome: '9ª consulta pré-natal' },
  { semanaMin: 40, semanaMax: 42, tipo: 'exame', nome: 'Cardiotocografia (a cada 2 dias)' },
];

export interface PeriodoTimeline {
  label: string;
  semanaMin: number;
  semanaMax: number;
  eventos: EventoRecomendado[];
}

export function getTimelinePeriodos(): PeriodoTimeline[] {
  const periodos: PeriodoTimeline[] = [
    { label: 'Até semana 12', semanaMin: 4, semanaMax: 12, eventos: [] },
    { label: 'Semana 11-14', semanaMin: 11, semanaMax: 14, eventos: [] },
    { label: 'Semana 16-20', semanaMin: 16, semanaMax: 20, eventos: [] },
    { label: 'Semana 20-24', semanaMin: 20, semanaMax: 24, eventos: [] },
    { label: 'Semana 24-28', semanaMin: 24, semanaMax: 28, eventos: [] },
    { label: 'Semana 28-32', semanaMin: 28, semanaMax: 32, eventos: [] },
    { label: 'Semana 32-36', semanaMin: 32, semanaMax: 36, eventos: [] },
    { label: 'Semana 36-40', semanaMin: 36, semanaMax: 40, eventos: [] },
  ];

  for (const ev of eventosRecomendados) {
    // Find best matching period
    const periodo = periodos.find(p => p.semanaMin <= ev.semanaMin && p.semanaMax >= ev.semanaMin)
      || periodos.find(p => ev.semanaMin >= p.semanaMin && ev.semanaMin <= p.semanaMax);
    if (periodo) periodo.eventos.push(ev);
  }

  return periodos;
}
