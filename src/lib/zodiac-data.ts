export interface ZodiacDetail {
  name: string;
  emoji: string;
  dates: string;
  element: string;
  elementIcon: string;
  planet: string;
  traits: string[];
  compatibility: Record<string, { level: 'otima' | 'boa' | 'desafiadora'; icon: string; phrase: string }>;
}

const defaultCompat = (sign: string): { level: 'boa'; icon: string; phrase: string } => ({
  level: 'boa', icon: '🤝', phrase: `${sign} traz equilíbrio à relação.`
});

export const zodiacDetails: Record<string, ZodiacDetail> = {
  'Áries': {
    name: 'Áries', emoji: '♈', dates: '21/mar – 19/abr',
    element: 'Fogo', elementIcon: '🔥', planet: 'Marte',
    traits: ['Corajoso e destemido', 'Líder nato e independente', 'Energético e entusiasmado'],
    compatibility: {
      'Áries': { level: 'boa', icon: '🤝', phrase: 'Juntos são pura energia, mas precisam de paciência mútua.' },
      'Touro': { level: 'desafiadora', icon: '⚡', phrase: 'Ritmos diferentes: um é fogo, o outro é terra.' },
      'Gêmeos': { level: 'otima', icon: '❤️', phrase: 'Combinação dinâmica e cheia de aventuras.' },
      'Câncer': { level: 'desafiadora', icon: '⚡', phrase: 'Áries precisa aprender a acolher a sensibilidade de Câncer.' },
      'Leão': { level: 'otima', icon: '❤️', phrase: 'Dois signos de fogo: paixão e admiração mútua.' },
      'Virgem': { level: 'desafiadora', icon: '⚡', phrase: 'Impulso vs. planejamento — exige adaptação.' },
      'Libra': { level: 'boa', icon: '🤝', phrase: 'Opostos que se atraem e se complementam.' },
      'Escorpião': { level: 'boa', icon: '🤝', phrase: 'Intensidade compartilhada, mas cuidado com as disputas.' },
      'Sagitário': { level: 'otima', icon: '❤️', phrase: 'Parceiros de aventura — liberdade e diversão.' },
      'Capricórnio': { level: 'desafiadora', icon: '⚡', phrase: 'Ambição em comum, mas estilos muito diferentes.' },
      'Aquário': { level: 'boa', icon: '🤝', phrase: 'Inovação e independência unem essa dupla.' },
      'Peixes': { level: 'boa', icon: '🤝', phrase: 'Áries protege, Peixes inspira — equilíbrio delicado.' },
    }
  },
  'Touro': {
    name: 'Touro', emoji: '♉', dates: '20/abr – 20/mai',
    element: 'Terra', elementIcon: '🌍', planet: 'Vênus',
    traits: ['Paciente e confiável', 'Amoroso e sensorial', 'Determinado e persistente'],
    compatibility: {
      'Áries': { level: 'desafiadora', icon: '⚡', phrase: 'Ritmos opostos, mas podem aprender um com o outro.' },
      'Touro': { level: 'otima', icon: '❤️', phrase: 'Estabilidade e conforto em dobro.' },
      'Gêmeos': { level: 'desafiadora', icon: '⚡', phrase: 'Touro quer rotina, Gêmeos quer novidade.' },
      'Câncer': { level: 'otima', icon: '❤️', phrase: 'Parceria amorosa e segura — lar doce lar.' },
      'Leão': { level: 'boa', icon: '🤝', phrase: 'Admiração mútua quando há respeito.' },
      'Virgem': { level: 'otima', icon: '❤️', phrase: 'Dois signos de terra: estabilidade natural.' },
      'Libra': { level: 'boa', icon: '🤝', phrase: 'Ambos regidos por Vênus — amor pela beleza.' },
      'Escorpião': { level: 'boa', icon: '🤝', phrase: 'Intensidade e lealdade profunda.' },
      'Sagitário': { level: 'desafiadora', icon: '⚡', phrase: 'Touro quer raízes, Sagitário quer voar.' },
      'Capricórnio': { level: 'otima', icon: '❤️', phrase: 'Dupla sólida e construtiva.' },
      'Aquário': { level: 'desafiadora', icon: '⚡', phrase: 'Tradição vs. inovação — requer flexibilidade.' },
      'Peixes': { level: 'otima', icon: '❤️', phrase: 'Conexão sensível e amorosa.' },
    }
  },
  'Gêmeos': {
    name: 'Gêmeos', emoji: '♊', dates: '21/mai – 20/jun',
    element: 'Ar', elementIcon: '💨', planet: 'Mercúrio',
    traits: ['Comunicativo e curioso', 'Versátil e adaptável', 'Inteligente e bem-humorado'],
    compatibility: {
      'Áries': { level: 'otima', icon: '❤️', phrase: 'Energia e curiosidade combinam perfeitamente.' },
      'Touro': { level: 'desafiadora', icon: '⚡', phrase: 'Estilos de vida bem diferentes.' },
      'Gêmeos': { level: 'boa', icon: '🤝', phrase: 'Conversa infinita, mas precisam de foco.' },
      'Câncer': { level: 'boa', icon: '🤝', phrase: 'Gêmeos diverte, Câncer acolhe.' },
      'Leão': { level: 'otima', icon: '❤️', phrase: 'Criatividade e diversão garantidas.' },
      'Virgem': { level: 'boa', icon: '🤝', phrase: 'Ambos de Mercúrio: comunicação fluida.' },
      'Libra': { level: 'otima', icon: '❤️', phrase: 'Signos de ar: leveza e harmonia intelectual.' },
      'Escorpião': { level: 'desafiadora', icon: '⚡', phrase: 'Profundidade vs. leveza — exige equilíbrio.' },
      'Sagitário': { level: 'boa', icon: '🤝', phrase: 'Opostos complementares: aprendizado mútuo.' },
      'Capricórnio': { level: 'desafiadora', icon: '⚡', phrase: 'Gêmeos é leve, Capricórnio é sério.' },
      'Aquário': { level: 'otima', icon: '❤️', phrase: 'Inovação e liberdade intelectual.' },
      'Peixes': { level: 'boa', icon: '🤝', phrase: 'Mundos diferentes que podem se enriquecer.' },
    }
  },
  'Câncer': {
    name: 'Câncer', emoji: '♋', dates: '21/jun – 22/jul',
    element: 'Água', elementIcon: '💧', planet: 'Lua',
    traits: ['Protetor e carinhoso', 'Intuitivo e emocional', 'Familiar e acolhedor'],
    compatibility: {
      'Áries': { level: 'desafiadora', icon: '⚡', phrase: 'Impulso vs. sensibilidade — requer cuidado.' },
      'Touro': { level: 'otima', icon: '❤️', phrase: 'Segurança emocional e material juntas.' },
      'Gêmeos': { level: 'boa', icon: '🤝', phrase: 'Câncer ensina profundidade, Gêmeos traz leveza.' },
      'Câncer': { level: 'otima', icon: '❤️', phrase: 'Conexão emocional intensa e natural.' },
      'Leão': { level: 'boa', icon: '🤝', phrase: 'Leão brilha, Câncer nutre — parceria complementar.' },
      'Virgem': { level: 'otima', icon: '❤️', phrase: 'Cuidado mútuo e dedicação ao lar.' },
      'Libra': { level: 'boa', icon: '🤝', phrase: 'Ambos buscam harmonia, mas de formas diferentes.' },
      'Escorpião': { level: 'otima', icon: '❤️', phrase: 'Signos de água: profundidade emocional compartilhada.' },
      'Sagitário': { level: 'desafiadora', icon: '⚡', phrase: 'Câncer quer lar, Sagitário quer mundo.' },
      'Capricórnio': { level: 'boa', icon: '🤝', phrase: 'Opostos que constroem juntos.' },
      'Aquário': { level: 'desafiadora', icon: '⚡', phrase: 'Emoção vs. razão — requer compreensão.' },
      'Peixes': { level: 'otima', icon: '❤️', phrase: 'Água + Água: amor fluido e intuitivo.' },
    }
  },
  'Leão': {
    name: 'Leão', emoji: '♌', dates: '23/jul – 22/ago',
    element: 'Fogo', elementIcon: '🔥', planet: 'Sol',
    traits: ['Generoso e caloroso', 'Criativo e dramático', 'Líder e autoconfiante'],
    compatibility: {
      'Áries': { level: 'otima', icon: '❤️', phrase: 'Dois signos de fogo: paixão e admiração.' },
      'Touro': { level: 'boa', icon: '🤝', phrase: 'Lealdade em comum, mas estilos diferentes.' },
      'Gêmeos': { level: 'otima', icon: '❤️', phrase: 'Diversão e criatividade sem fim.' },
      'Câncer': { level: 'boa', icon: '🤝', phrase: 'Leão protege, Câncer cuida.' },
      'Leão': { level: 'boa', icon: '🤝', phrase: 'Brilho em dobro, mas cuidado com o ego.' },
      'Virgem': { level: 'desafiadora', icon: '⚡', phrase: 'Leão quer holofotes, Virgem prefere discrição.' },
      'Libra': { level: 'otima', icon: '❤️', phrase: 'Beleza, charme e admiração mútua.' },
      'Escorpião': { level: 'desafiadora', icon: '⚡', phrase: 'Dois signos intensos — pode haver disputas.' },
      'Sagitário': { level: 'otima', icon: '❤️', phrase: 'Fogo + Fogo: aventura e otimismo.' },
      'Capricórnio': { level: 'boa', icon: '🤝', phrase: 'Ambição compartilhada, estilos diferentes.' },
      'Aquário': { level: 'boa', icon: '🤝', phrase: 'Opostos que se fascinam mutuamente.' },
      'Peixes': { level: 'boa', icon: '🤝', phrase: 'Leão inspira, Peixes sonha.' },
    }
  },
  'Virgem': {
    name: 'Virgem', emoji: '♍', dates: '23/ago – 22/set',
    element: 'Terra', elementIcon: '🌍', planet: 'Mercúrio',
    traits: ['Analítico e detalhista', 'Prático e organizado', 'Dedicado e prestativo'],
    compatibility: {
      'Áries': { level: 'desafiadora', icon: '⚡', phrase: 'Planejamento vs. impulso.' },
      'Touro': { level: 'otima', icon: '❤️', phrase: 'Estabilidade e pragmatismo em harmonia.' },
      'Gêmeos': { level: 'boa', icon: '🤝', phrase: 'Mercúrio une: comunicação fluida.' },
      'Câncer': { level: 'otima', icon: '❤️', phrase: 'Cuidado mútuo e atenção aos detalhes.' },
      'Leão': { level: 'desafiadora', icon: '⚡', phrase: 'Virgem é discreta, Leão é expansivo.' },
      'Virgem': { level: 'boa', icon: '🤝', phrase: 'Perfecionismo em dobro — precisa de leveza.' },
      'Libra': { level: 'boa', icon: '🤝', phrase: 'Ambos buscam equilíbrio e harmonia.' },
      'Escorpião': { level: 'otima', icon: '❤️', phrase: 'Profundidade e lealdade compartilhadas.' },
      'Sagitário': { level: 'desafiadora', icon: '⚡', phrase: 'Detalhe vs. visão geral — complementar se houver respeito.' },
      'Capricórnio': { level: 'otima', icon: '❤️', phrase: 'Terra + Terra: construção sólida.' },
      'Aquário': { level: 'boa', icon: '🤝', phrase: 'Razão em comum, abordagens diferentes.' },
      'Peixes': { level: 'boa', icon: '🤝', phrase: 'Opostos que se complementam lindamente.' },
    }
  },
  'Libra': {
    name: 'Libra', emoji: '♎', dates: '23/set – 22/out',
    element: 'Ar', elementIcon: '💨', planet: 'Vênus',
    traits: ['Diplomático e justo', 'Harmonioso e sociável', 'Apreciador da beleza e arte'],
    compatibility: {
      'Áries': { level: 'boa', icon: '🤝', phrase: 'Opostos que se atraem com força.' },
      'Touro': { level: 'boa', icon: '🤝', phrase: 'Vênus une: amor pela beleza e conforto.' },
      'Gêmeos': { level: 'otima', icon: '❤️', phrase: 'Ar + Ar: leveza e harmonia intelectual.' },
      'Câncer': { level: 'boa', icon: '🤝', phrase: 'Harmonia é prioridade para ambos.' },
      'Leão': { level: 'otima', icon: '❤️', phrase: 'Charme e admiração em abundância.' },
      'Virgem': { level: 'boa', icon: '🤝', phrase: 'Equilíbrio entre razão e estética.' },
      'Libra': { level: 'boa', icon: '🤝', phrase: 'Paz e harmonia, mas alguém precisa decidir!' },
      'Escorpião': { level: 'desafiadora', icon: '⚡', phrase: 'Superfície vs. profundidade.' },
      'Sagitário': { level: 'otima', icon: '❤️', phrase: 'Otimismo e sociabilidade em comum.' },
      'Capricórnio': { level: 'desafiadora', icon: '⚡', phrase: 'Libra é leve, Capricórnio é sério.' },
      'Aquário': { level: 'otima', icon: '❤️', phrase: 'Dois signos de ar: ideais compartilhados.' },
      'Peixes': { level: 'boa', icon: '🤝', phrase: 'Romantismo e arte unem essa dupla.' },
    }
  },
  'Escorpião': {
    name: 'Escorpião', emoji: '♏', dates: '23/out – 21/nov',
    element: 'Água', elementIcon: '💧', planet: 'Plutão',
    traits: ['Intenso e apaixonado', 'Determinado e estratégico', 'Leal e protetor'],
    compatibility: {
      'Áries': { level: 'boa', icon: '🤝', phrase: 'Intensidade compartilhada — pode ser explosivo.' },
      'Touro': { level: 'boa', icon: '🤝', phrase: 'Opostos leais e possessivos — atração magnética.' },
      'Gêmeos': { level: 'desafiadora', icon: '⚡', phrase: 'Profundidade vs. leveza.' },
      'Câncer': { level: 'otima', icon: '❤️', phrase: 'Água + Água: conexão emocional intensa.' },
      'Leão': { level: 'desafiadora', icon: '⚡', phrase: 'Dois líderes fortes — disputa de poder.' },
      'Virgem': { level: 'otima', icon: '❤️', phrase: 'Lealdade e profundidade compartilhadas.' },
      'Libra': { level: 'desafiadora', icon: '⚡', phrase: 'Escorpião quer profundidade, Libra quer leveza.' },
      'Escorpião': { level: 'boa', icon: '🤝', phrase: 'Intensidade ao quadrado — pode ser demais.' },
      'Sagitário': { level: 'desafiadora', icon: '⚡', phrase: 'Possessividade vs. liberdade.' },
      'Capricórnio': { level: 'otima', icon: '❤️', phrase: 'Poder e ambição em uma dupla formidável.' },
      'Aquário': { level: 'desafiadora', icon: '⚡', phrase: 'Emoção vs. racionalidade.' },
      'Peixes': { level: 'otima', icon: '❤️', phrase: 'Profundidade emocional e conexão espiritual.' },
    }
  },
  'Sagitário': {
    name: 'Sagitário', emoji: '♐', dates: '22/nov – 21/dez',
    element: 'Fogo', elementIcon: '🔥', planet: 'Júpiter',
    traits: ['Aventureiro e otimista', 'Filosófico e bem-humorado', 'Livre e generoso'],
    compatibility: {
      'Áries': { level: 'otima', icon: '❤️', phrase: 'Parceiros de aventura ideais.' },
      'Touro': { level: 'desafiadora', icon: '⚡', phrase: 'Liberdade vs. segurança.' },
      'Gêmeos': { level: 'boa', icon: '🤝', phrase: 'Opostos curiosos que se complementam.' },
      'Câncer': { level: 'desafiadora', icon: '⚡', phrase: 'Mundo vs. lar — difícil equilíbrio.' },
      'Leão': { level: 'otima', icon: '❤️', phrase: 'Fogo + Fogo: energia e entusiasmo.' },
      'Virgem': { level: 'desafiadora', icon: '⚡', phrase: 'Visão ampla vs. detalhes.' },
      'Libra': { level: 'otima', icon: '❤️', phrase: 'Otimismo e sociabilidade compartilhados.' },
      'Escorpião': { level: 'desafiadora', icon: '⚡', phrase: 'Profundidade vs. leveza.' },
      'Sagitário': { level: 'otima', icon: '❤️', phrase: 'Liberdade e aventura em dobro.' },
      'Capricórnio': { level: 'boa', icon: '🤝', phrase: 'Sagitário expande, Capricórnio estrutura.' },
      'Aquário': { level: 'otima', icon: '❤️', phrase: 'Independência e ideais compartilhados.' },
      'Peixes': { level: 'boa', icon: '🤝', phrase: 'Júpiter une: expansão e sonho.' },
    }
  },
  'Capricórnio': {
    name: 'Capricórnio', emoji: '♑', dates: '22/dez – 19/jan',
    element: 'Terra', elementIcon: '🌍', planet: 'Saturno',
    traits: ['Disciplinado e responsável', 'Ambicioso e determinado', 'Prático e estratégico'],
    compatibility: {
      'Áries': { level: 'desafiadora', icon: '⚡', phrase: 'Ambição em comum, métodos opostos.' },
      'Touro': { level: 'otima', icon: '❤️', phrase: 'Terra + Terra: fundação sólida.' },
      'Gêmeos': { level: 'desafiadora', icon: '⚡', phrase: 'Seriedade vs. leveza.' },
      'Câncer': { level: 'boa', icon: '🤝', phrase: 'Opostos que constroem uma família forte.' },
      'Leão': { level: 'boa', icon: '🤝', phrase: 'Ambição compartilhada, estilos diferentes.' },
      'Virgem': { level: 'otima', icon: '❤️', phrase: 'Pragmatismo e dedicação em harmonia.' },
      'Libra': { level: 'desafiadora', icon: '⚡', phrase: 'Capricórnio é sério, Libra é leve.' },
      'Escorpião': { level: 'otima', icon: '❤️', phrase: 'Poder e lealdade formam uma dupla forte.' },
      'Sagitário': { level: 'boa', icon: '🤝', phrase: 'Estrutura + expansão — complementares.' },
      'Capricórnio': { level: 'boa', icon: '🤝', phrase: 'Ambição e disciplina em dobro.' },
      'Aquário': { level: 'desafiadora', icon: '⚡', phrase: 'Tradição vs. revolução.' },
      'Peixes': { level: 'boa', icon: '🤝', phrase: 'Capricórnio estrutura, Peixes sonha.' },
    }
  },
  'Aquário': {
    name: 'Aquário', emoji: '♒', dates: '20/jan – 18/fev',
    element: 'Ar', elementIcon: '💨', planet: 'Urano',
    traits: ['Independente e original', 'Humanitário e visionário', 'Intelectual e inovador'],
    compatibility: {
      'Áries': { level: 'boa', icon: '🤝', phrase: 'Independência e ação combinam.' },
      'Touro': { level: 'desafiadora', icon: '⚡', phrase: 'Inovação vs. tradição.' },
      'Gêmeos': { level: 'otima', icon: '❤️', phrase: 'Ar + Ar: liberdade intelectual.' },
      'Câncer': { level: 'desafiadora', icon: '⚡', phrase: 'Razão vs. emoção.' },
      'Leão': { level: 'boa', icon: '🤝', phrase: 'Opostos fascinantes.' },
      'Virgem': { level: 'boa', icon: '🤝', phrase: 'Razão em comum, abordagens diferentes.' },
      'Libra': { level: 'otima', icon: '❤️', phrase: 'Ar + Ar: ideais e harmonia social.' },
      'Escorpião': { level: 'desafiadora', icon: '⚡', phrase: 'Emoção intensa vs. racionalidade.' },
      'Sagitário': { level: 'otima', icon: '❤️', phrase: 'Liberdade e ideais compartilhados.' },
      'Capricórnio': { level: 'desafiadora', icon: '⚡', phrase: 'Revolução vs. tradição.' },
      'Aquário': { level: 'boa', icon: '🤝', phrase: 'Originalidade em dobro.' },
      'Peixes': { level: 'boa', icon: '🤝', phrase: 'Humanitarismo e compaixão compartilhados.' },
    }
  },
  'Peixes': {
    name: 'Peixes', emoji: '♓', dates: '19/fev – 20/mar',
    element: 'Água', elementIcon: '💧', planet: 'Netuno',
    traits: ['Intuitivo e sensível', 'Sonhador e artístico', 'Compassivo e empático'],
    compatibility: {
      'Áries': { level: 'boa', icon: '🤝', phrase: 'Áries protege, Peixes inspira.' },
      'Touro': { level: 'otima', icon: '❤️', phrase: 'Conexão sensível e amorosa.' },
      'Gêmeos': { level: 'boa', icon: '🤝', phrase: 'Mundos diferentes que se enriquecem.' },
      'Câncer': { level: 'otima', icon: '❤️', phrase: 'Água + Água: amor fluido e intuitivo.' },
      'Leão': { level: 'boa', icon: '🤝', phrase: 'Leão inspira, Peixes sonha.' },
      'Virgem': { level: 'boa', icon: '🤝', phrase: 'Opostos que se complementam lindamente.' },
      'Libra': { level: 'boa', icon: '🤝', phrase: 'Romantismo e sensibilidade artística.' },
      'Escorpião': { level: 'otima', icon: '❤️', phrase: 'Profundidade e conexão espiritual.' },
      'Sagitário': { level: 'boa', icon: '🤝', phrase: 'Júpiter une: expansão e sonho.' },
      'Capricórnio': { level: 'boa', icon: '🤝', phrase: 'Capricórnio estrutura, Peixes sonha.' },
      'Aquário': { level: 'boa', icon: '🤝', phrase: 'Compaixão e humanitarismo em comum.' },
      'Peixes': { level: 'otima', icon: '❤️', phrase: 'Dois sonhadores: conexão mágica e profunda.' },
    }
  },
};

export function getTrioPhrase(baby: string, parent1: string, parent2?: string): string {
  if (!parent2) {
    const d1 = zodiacDetails[baby];
    const d2 = zodiacDetails[parent1];
    if (!d1 || !d2) return 'Um trio cheio de amor e descobertas!';
    const compat = d1.compatibility[parent1];
    if (compat?.level === 'otima') return `${baby} e ${parent1} formam uma dupla harmoniosa — muita conexão e cumplicidade pela frente!`;
    if (compat?.level === 'desafiadora') return `${baby} e ${parent1} terão uma relação de crescimento mútuo — as diferenças vão fortalecer o vínculo!`;
    return `${baby} e ${parent1} se complementam de forma equilibrada — uma parceria cheia de aprendizados!`;
  }

  const sameElement = zodiacDetails[baby]?.element === zodiacDetails[parent1]?.element && zodiacDetails[baby]?.element === zodiacDetails[parent2]?.element;
  if (sameElement) return `Família toda do elemento ${zodiacDetails[baby]?.element}! Uma sintonia natural e muita afinidade entre vocês três.`;

  const fireCount = [baby, parent1, parent2].filter(s => zodiacDetails[s]?.element === 'Fogo').length;
  const waterCount = [baby, parent1, parent2].filter(s => zodiacDetails[s]?.element === 'Água').length;
  const earthCount = [baby, parent1, parent2].filter(s => zodiacDetails[s]?.element === 'Terra').length;
  const airCount = [baby, parent1, parent2].filter(s => zodiacDetails[s]?.element === 'Ar').length;

  if (fireCount >= 2) return 'Família cheia de energia e paixão! O bebê vai crescer em um ambiente vibrante e estimulante.';
  if (waterCount >= 2) return 'Família muito conectada emocionalmente. O bebê vai crescer cercado de amor e intuição.';
  if (earthCount >= 2) return 'Família sólida e estruturada. O bebê vai crescer com segurança e estabilidade.';
  if (airCount >= 2) return 'Família comunicativa e intelectual. O bebê vai crescer em um ambiente de ideias e liberdade.';

  return 'Uma família com elementos diversos — cada um traz uma qualidade única, criando um lar rico e equilibrado!';
}
