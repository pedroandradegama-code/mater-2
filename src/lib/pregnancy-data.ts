export interface WeekData {
  week: number;
  fruit: string;
  weight: string;
  size: string;
}

export const weeklyData: WeekData[] = [
  { week: 4, fruit: "Uva", weight: "1g", size: "0.2cm" },
  { week: 5, fruit: "Semente de maçã", weight: "1g", size: "0.3cm" },
  { week: 6, fruit: "Ervilha", weight: "2g", size: "0.6cm" },
  { week: 7, fruit: "Mirtilo", weight: "1g", size: "1cm" },
  { week: 8, fruit: "Feijão", weight: "1g", size: "1.6cm" },
  { week: 9, fruit: "Azeitona", weight: "2g", size: "2.3cm" },
  { week: 10, fruit: "Damasco", weight: "4g", size: "3.1cm" },
  { week: 11, fruit: "Figo", weight: "7g", size: "4.1cm" },
  { week: 12, fruit: "Limão", weight: "14g", size: "5.4cm" },
  { week: 13, fruit: "Ervilha torta", weight: "23g", size: "7.4cm" },
  { week: 14, fruit: "Pêssego", weight: "43g", size: "8.7cm" },
  { week: 15, fruit: "Maçã", weight: "70g", size: "10.1cm" },
  { week: 16, fruit: "Abacate", weight: "100g", size: "11.6cm" },
  { week: 17, fruit: "Rabanete", weight: "140g", size: "13cm" },
  { week: 18, fruit: "Pimentão", weight: "190g", size: "14.2cm" },
  { week: 19, fruit: "Tomate", weight: "240g", size: "15.3cm" },
  { week: 20, fruit: "Banana", weight: "300g", size: "16.4cm" },
  { week: 21, fruit: "Cenoura", weight: "360g", size: "26.7cm" },
  { week: 22, fruit: "Mamão", weight: "430g", size: "27.8cm" },
  { week: 23, fruit: "Manga", weight: "500g", size: "28.9cm" },
  { week: 24, fruit: "Milho", weight: "600g", size: "30cm" },
  { week: 25, fruit: "Couve-flor", weight: "660g", size: "34.6cm" },
  { week: 26, fruit: "Alface", weight: "760g", size: "35.6cm" },
  { week: 27, fruit: "Repolho", weight: "875g", size: "36.6cm" },
  { week: 28, fruit: "Berinjela", weight: "1kg", size: "37.6cm" },
  { week: 29, fruit: "Abóbora", weight: "1.1kg", size: "38.6cm" },
  { week: 30, fruit: "Pepino", weight: "1.3kg", size: "39.9cm" },
  { week: 31, fruit: "Aspargo", weight: "1.5kg", size: "41.1cm" },
  { week: 32, fruit: "Abacaxi", weight: "1.7kg", size: "42.4cm" },
  { week: 33, fruit: "Abacaxi grande", weight: "1.9kg", size: "43.7cm" },
  { week: 34, fruit: "Melão", weight: "2.1kg", size: "45cm" },
  { week: 35, fruit: "Melão médio", weight: "2.4kg", size: "46.2cm" },
  { week: 36, fruit: "Alface romana", weight: "2.6kg", size: "47.4cm" },
  { week: 37, fruit: "Acelga", weight: "2.9kg", size: "48.6cm" },
  { week: 38, fruit: "Alho-poró", weight: "3.1kg", size: "49.8cm" },
  { week: 39, fruit: "Melancia pequena", weight: "3.3kg", size: "50.7cm" },
  { week: 40, fruit: "Melancia", weight: "3.4kg", size: "51.2cm" },
];

export const weekEmojis: Record<number, string> = {
  4: "🫐", 5: "🌱", 6: "🫛", 7: "🫐", 8: "🫘", 9: "🫒", 10: "🍑",
  11: "🫘", 12: "🍋", 13: "🫛", 14: "🍑", 15: "🍎", 16: "🥑", 17: "🥕",
  18: "🫑", 19: "🍅", 20: "🍌", 21: "🥕", 22: "🥭", 23: "🥭", 24: "🌽",
  25: "🥦", 26: "🥬", 27: "🥬", 28: "🍆", 29: "🎃", 30: "🥒", 31: "🥦",
  32: "🍍", 33: "🍍", 34: "🍈", 35: "🍈", 36: "🥬", 37: "🥬", 38: "🥬",
  39: "🍉", 40: "🍉",
};

export function getWeekData(week: number): WeekData | undefined {
  return weeklyData.find(w => w.week === week);
}

export function calculatePregnancyInfo(dum: Date) {
  const now = new Date();
  const diffMs = now.getTime() - dum.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  const dpp = new Date(dum.getTime() + 280 * 24 * 60 * 60 * 1000);
  const daysRemaining = Math.max(0, Math.ceil((dpp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const progress = Math.min(100, Math.max(0, (diffDays / 280) * 100));
  const trimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;

  return { weeks, days, dpp, daysRemaining, progress, trimester, diffDays };
}

/** Parse a "YYYY-MM-DD" string as a local date (avoids UTC timezone shift) */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getHueForSex(sex: string | null): number {
  switch (sex) {
    case 'menina': return 330;
    case 'menino': return 210;
    default: return 280;
  }
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export const chineseTable: Record<number, Record<number, string>> = {
  18: {1:'menina',2:'menino',3:'menino',4:'menino',5:'menino',6:'menino',7:'menino',8:'menino',9:'menino',10:'menino',11:'menino',12:'menino'},
  19: {1:'menino',2:'menina',3:'menino',4:'menina',5:'menino',6:'menino',7:'menino',8:'menino',9:'menino',10:'menina',11:'menino',12:'menina'},
  20: {1:'menina',2:'menino',3:'menina',4:'menino',5:'menino',6:'menino',7:'menino',8:'menino',9:'menino',10:'menina',11:'menino',12:'menino'},
  21: {1:'menino',2:'menina',3:'menina',4:'menina',5:'menina',6:'menina',7:'menina',8:'menina',9:'menina',10:'menina',11:'menina',12:'menina'},
  22: {1:'menina',2:'menino',3:'menino',4:'menina',5:'menino',6:'menina',7:'menina',8:'menino',9:'menina',10:'menina',11:'menina',12:'menina'},
  23: {1:'menino',2:'menino',3:'menina',4:'menino',5:'menino',6:'menina',7:'menino',8:'menina',9:'menino',10:'menino',11:'menino',12:'menina'},
  24: {1:'menino',2:'menina',3:'menino',4:'menino',5:'menina',6:'menino',7:'menino',8:'menina',9:'menina',10:'menina',11:'menina',12:'menina'},
  25: {1:'menina',2:'menino',3:'menino',4:'menina',5:'menina',6:'menino',7:'menina',8:'menino',9:'menino',10:'menino',11:'menino',12:'menino'},
  26: {1:'menino',2:'menina',3:'menino',4:'menina',5:'menina',6:'menino',7:'menina',8:'menino',9:'menina',10:'menina',11:'menina',12:'menina'},
  27: {1:'menina',2:'menino',3:'menina',4:'menino',5:'menina',6:'menina',7:'menino',8:'menino',9:'menino',10:'menino',11:'menina',12:'menino'},
  28: {1:'menino',2:'menina',3:'menino',4:'menina',5:'menina',6:'menino',7:'menino',8:'menino',9:'menino',10:'menina',11:'menina',12:'menina'},
  29: {1:'menina',2:'menino',3:'menina',4:'menina',5:'menino',6:'menino',7:'menina',8:'menina',9:'menina',10:'menino',11:'menino',12:'menino'},
  30: {1:'menino',2:'menina',3:'menina',4:'menina',5:'menina',6:'menina',7:'menina',8:'menina',9:'menina',10:'menina',11:'menino',12:'menino'},
  31: {1:'menino',2:'menina',3:'menino',4:'menina',5:'menina',6:'menina',7:'menina',8:'menina',9:'menina',10:'menina',11:'menina',12:'menino'},
  32: {1:'menino',2:'menina',3:'menina',4:'menino',5:'menina',6:'menina',7:'menina',8:'menino',9:'menina',10:'menina',11:'menina',12:'menina'},
  33: {1:'menina',2:'menino',3:'menino',4:'menina',5:'menina',6:'menina',7:'menina',8:'menino',9:'menina',10:'menina',11:'menina',12:'menino'},
  34: {1:'menino',2:'menina',3:'menino',4:'menina',5:'menina',6:'menina',7:'menina',8:'menina',9:'menina',10:'menina',11:'menino',12:'menino'},
  35: {1:'menino',2:'menino',3:'menina',4:'menino',5:'menina',6:'menina',7:'menina',8:'menino',9:'menina',10:'menina',11:'menino',12:'menino'},
  36: {1:'menina',2:'menino',3:'menino',4:'menina',5:'menino',6:'menina',7:'menina',8:'menina',9:'menino',10:'menino',11:'menino',12:'menino'},
  37: {1:'menino',2:'menina',3:'menino',4:'menino',5:'menina',6:'menino',7:'menina',8:'menino',9:'menina',10:'menino',11:'menina',12:'menino'},
  38: {1:'menina',2:'menino',3:'menina',4:'menino',5:'menino',6:'menina',7:'menino',8:'menina',9:'menino',10:'menina',11:'menino',12:'menina'},
  39: {1:'menino',2:'menina',3:'menino',4:'menino',5:'menino',6:'menina',7:'menina',8:'menino',9:'menina',10:'menina',11:'menina',12:'menina'},
  40: {1:'menina',2:'menino',3:'menina',4:'menino',5:'menina',6:'menino',7:'menina',8:'menina',9:'menino',10:'menina',11:'menino',12:'menino'},
  41: {1:'menino',2:'menina',3:'menino',4:'menina',5:'menino',6:'menina',7:'menino',8:'menino',9:'menino',10:'menino',11:'menino',12:'menino'},
  42: {1:'menina',2:'menino',3:'menina',4:'menino',5:'menina',6:'menino',7:'menina',8:'menina',9:'menino',10:'menino',11:'menina',12:'menino'},
  43: {1:'menino',2:'menina',3:'menino',4:'menina',5:'menino',6:'menino',7:'menina',8:'menina',9:'menina',10:'menina',11:'menino',12:'menino'},
  44: {1:'menino',2:'menino',3:'menina',4:'menino',5:'menino',6:'menina',7:'menino',8:'menina',9:'menina',10:'menino',11:'menina',12:'menina'},
  45: {1:'menina',2:'menino',3:'menina',4:'menina',5:'menina',6:'menino',7:'menino',8:'menina',9:'menino',10:'menina',11:'menino',12:'menino'},
};

export const zodiacSigns = [
  { name: 'Capricórnio', start: [1, 1], end: [1, 19], emoji: '♑', desc: 'Disciplinado, responsável e determinado.' },
  { name: 'Aquário', start: [1, 20], end: [2, 18], emoji: '♒', desc: 'Independente, criativo e humanitário.' },
  { name: 'Peixes', start: [2, 19], end: [3, 20], emoji: '♓', desc: 'Intuitivo, sensível e sonhador.' },
  { name: 'Áries', start: [3, 21], end: [4, 19], emoji: '♈', desc: 'Corajoso, energético e líder nato.' },
  { name: 'Touro', start: [4, 20], end: [5, 20], emoji: '♉', desc: 'Paciente, confiável e amoroso.' },
  { name: 'Gêmeos', start: [5, 21], end: [6, 20], emoji: '♊', desc: 'Comunicativo, curioso e versátil.' },
  { name: 'Câncer', start: [6, 21], end: [7, 22], emoji: '♋', desc: 'Protetor, carinhoso e intuitivo.' },
  { name: 'Leão', start: [7, 23], end: [8, 22], emoji: '♌', desc: 'Generoso, criativo e entusiasta.' },
  { name: 'Virgem', start: [8, 23], end: [9, 22], emoji: '♍', desc: 'Analítico, prático e dedicado.' },
  { name: 'Libra', start: [9, 23], end: [10, 22], emoji: '♎', desc: 'Diplomático, harmonioso e justo.' },
  { name: 'Escorpião', start: [10, 23], end: [11, 21], emoji: '♏', desc: 'Intenso, determinado e apaixonado.' },
  { name: 'Sagitário', start: [11, 22], end: [12, 21], emoji: '♐', desc: 'Aventureiro, otimista e filosófico.' },
  { name: 'Capricórnio', start: [12, 22], end: [12, 31], emoji: '♑', desc: 'Disciplinado, responsável e determinado.' },
];

export function getZodiacSign(date: Date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  for (const sign of zodiacSigns) {
    const [sm, sd] = sign.start;
    const [em, ed] = sign.end;
    if ((m === sm && d >= sd) || (m === em && d <= ed)) {
      return sign;
    }
  }
  return zodiacSigns[0]; // Capricorn fallback
}
