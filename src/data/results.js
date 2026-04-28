export const dimensions = ['R', 'I', 'A', 'S', 'E', 'C'];

export const dimensionMeta = {
  R: { name: 'Realistic', label: 'Praktis', color: '#c87832' },
  I: { name: 'Investigative', label: 'Analitis', color: '#5070c8' },
  A: { name: 'Artistic', label: 'Kreatif', color: '#d85878' },
  S: { name: 'Social', label: 'Suportif', color: '#40a070' },
  E: { name: 'Enterprising', label: 'Pemimpin', color: '#a050c8' },
  C: { name: 'Conventional', label: 'Terstruktur', color: '#c8a030' },
};

export const classCatalog = {
  knight: {
    id: 'knight',
    name: 'The Knight of Arcadia',
    title: 'Penjaga Jalan Nyata',
    image: require('../../assets/images/classes/the-knight.webp'),
    color: '#c86030',
    glow: 'rgba(200,96,48,0.56)',
    dominant: ['R', 'E'],
    profile: { R: 0.95, I: 0.42, A: 0.22, S: 0.46, E: 0.78, C: 0.58 },
    flavor: 'Pedangmu tajam, perisaimu teguh. Kamu paling hidup saat ide berubah menjadi tindakan.',
    summary:
      'Kamu cenderung menyukai pekerjaan yang jelas, berdampak nyata, dan memberi ruang untuk mengambil keputusan di lapangan.',
    strengths: ['Eksekusi cepat', 'Tahan tekanan', 'Berani mengambil peran'],
    majors: ['Teknik Sipil', 'Teknik Mesin', 'Teknik Industri', 'Arsitektur', 'Manajemen'],
  },
  scholar: {
    id: 'scholar',
    name: 'The Scholar of Arcadia',
    title: 'Penafsir Gulungan Langit',
    image: require('../../assets/images/classes/the-scholar.webp'),
    color: '#5070c8',
    glow: 'rgba(80,112,200,0.58)',
    dominant: ['I', 'C'],
    profile: { R: 0.34, I: 0.96, A: 0.50, S: 0.48, E: 0.34, C: 0.78 },
    flavor: 'Penamu menulis takdir, bukunya tak pernah habis. Kamu mengejar pola di balik dunia.',
    summary:
      'Kamu kuat saat mengurai masalah, meneliti kemungkinan, dan membuat keputusan dari bukti yang rapi.',
    strengths: ['Rasa ingin tahu', 'Analisis mendalam', 'Ketelitian berpikir'],
    majors: ['Sains Data', 'Statistika', 'Fisika', 'Teknik Komputer', 'Biologi Molekuler'],
  },
  bard: {
    id: 'bard',
    name: 'The Bard of Arcadia',
    title: 'Penyair Bintang',
    image: require('../../assets/images/classes/the-bard.webp'),
    color: '#d85878',
    glow: 'rgba(216,88,120,0.58)',
    dominant: ['A', 'S'],
    profile: { R: 0.25, I: 0.48, A: 0.98, S: 0.70, E: 0.52, C: 0.24 },
    flavor: 'Lagumu didengar dunia, kisahmu hidup di hati banyak orang.',
    summary:
      'Kamu membawa energi kreatif yang kuat, terutama saat ide perlu menjadi cerita, visual, pengalaman, atau ekspresi.',
    strengths: ['Imajinasi', 'Empati artistik', 'Komunikasi emosional'],
    majors: ['Desain Komunikasi Visual', 'Film', 'Sastra', 'Musik', 'Arsitektur'],
  },
  healer: {
    id: 'healer',
    name: 'The Healer of Arcadia',
    title: 'Penjaga Cahaya',
    image: require('../../assets/images/classes/the-healer.webp'),
    color: '#40a070',
    glow: 'rgba(64,160,112,0.58)',
    dominant: ['S', 'I'],
    profile: { R: 0.42, I: 0.64, A: 0.42, S: 0.98, E: 0.46, C: 0.55 },
    flavor: 'Tanganmu menyembuhkan, hatimu menerangi yang gelap.',
    summary:
      'Kamu kuat dalam memahami orang lain, membantu dengan sabar, dan membangun lingkungan yang membuat orang bertumbuh.',
    strengths: ['Kepekaan sosial', 'Kesabaran', 'Mendampingi orang lain'],
    majors: ['Kedokteran', 'Psikologi', 'Keperawatan', 'Pendidikan', 'Kesehatan Masyarakat'],
  },
  commander: {
    id: 'commander',
    name: 'The Commander of Arcadia',
    title: 'Pengarah Panji Kerajaan',
    image: require('../../assets/images/classes/the-commander.webp'),
    color: '#a050c8',
    glow: 'rgba(160,80,200,0.58)',
    dominant: ['E', 'R'],
    profile: { R: 0.72, I: 0.42, A: 0.36, S: 0.52, E: 0.98, C: 0.58 },
    flavor: 'Saat jalan bercabang, suaramu membuat rombongan berani bergerak.',
    summary:
      'Kamu cocok dengan tantangan yang membutuhkan persuasi, strategi, kepemimpinan, dan keberanian mengambil inisiatif.',
    strengths: ['Memimpin tim', 'Negosiasi', 'Membaca peluang'],
    majors: ['Manajemen', 'Ilmu Komunikasi', 'Bisnis', 'Hubungan Internasional', 'Hukum'],
  },
  merchant: {
    id: 'merchant',
    name: 'The Merchant of Arcadia',
    title: 'Perangkai Jalur Dagang',
    image: require('../../assets/images/classes/the-merchant.webp'),
    color: '#c8a030',
    glow: 'rgba(200,160,48,0.56)',
    dominant: ['C', 'E'],
    profile: { R: 0.45, I: 0.54, A: 0.24, S: 0.42, E: 0.72, C: 0.98 },
    flavor: 'Koin, kontrak, dan catatan kerajaan menjadi peta yang kamu kuasai.',
    summary:
      'Kamu nyaman dengan sistem, angka, alur kerja, dan keputusan yang membutuhkan keteraturan serta tanggung jawab.',
    strengths: ['Organisasi', 'Perencanaan', 'Konsistensi'],
    majors: ['Akuntansi', 'Administrasi Bisnis', 'Ekonomi', 'Sistem Informasi', 'Logistik'],
  },
  mage: {
    id: 'mage',
    name: 'The Mage of Arcadia',
    title: 'Peramu Cahaya Rahasia',
    image: require('../../assets/images/classes/the-mage.webp'),
    color: '#8b54d8',
    glow: 'rgba(139,84,216,0.58)',
    dominant: ['A', 'I'],
    profile: { R: 0.28, I: 0.78, A: 0.96, S: 0.48, E: 0.42, C: 0.38 },
    flavor: 'Kamu mencampur nalar dan imajinasi sampai sesuatu yang baru menyala.',
    summary:
      'Kamu kuat saat eksplorasi kreatif bertemu eksperimen, konsep, teknologi, atau bentuk pemecahan masalah yang tidak biasa.',
    strengths: ['Eksperimen', 'Konsep orisinal', 'Belajar mandiri'],
    majors: ['Game Design', 'Desain Produk', 'Informatika', 'Animasi', 'Arsitektur'],
  },
  alchemist: {
    id: 'alchemist',
    name: 'The Alchemist of Arcadia',
    title: 'Pengubah Bahan Menjadi Makna',
    image: require('../../assets/images/classes/the-alchemist.webp'),
    color: '#50a8b8',
    glow: 'rgba(80,168,184,0.56)',
    dominant: ['I', 'R'],
    profile: { R: 0.72, I: 0.96, A: 0.42, S: 0.34, E: 0.38, C: 0.64 },
    flavor: 'Di tanganmu, percobaan kecil bisa menjadi penemuan besar.',
    summary:
      'Kamu tertarik pada cara kerja sesuatu, baik lewat eksperimen, teknologi, riset, maupun pengembangan solusi yang konkret.',
    strengths: ['Eksperimen teknis', 'Problem solving', 'Ketahanan riset'],
    majors: ['Teknik Kimia', 'Farmasi', 'Bioteknologi', 'Teknik Elektro', 'Teknologi Pangan'],
  },
};

export function blankScores() {
  return dimensions.reduce((acc, dim) => ({ ...acc, [dim]: 0 }), {});
}

export const hobbyCardBonuses = {
  fighter: { R: 2, E: 1 },
  scholar: { I: 2, C: 1 },
  artist: { A: 2, S: 1 },
  guardian: { S: 2, I: 1 },
  leader: { E: 2, S: 1 },
  keeper: { C: 2, I: 1 },
};

export const birthStarBonuses = {
  ignis: { R: 1, E: 1 },
  aqua: { S: 1, I: 1 },
  terra: { C: 1, R: 1 },
  ventus: { A: 1, I: 1 },
};

export function scoreAnswers(answers) {
  const scores = blankScores();
  Object.values(answers || {}).forEach((answer) => {
    if (answer?.dimension && scores[answer.dimension] !== undefined) {
      scores[answer.dimension] += answer.points || 0;
    }
  });
  return scores;
}

export function applyPersonalizationBonuses(scores, hobbyCards = [], birthStar = '') {
  const personalized = { ...blankScores(), ...(scores || {}) };
  hobbyCards.forEach((card) => addBonus(personalized, hobbyCardBonuses[String(card || '').trim().toLowerCase()]));
  addBonus(personalized, birthStarBonuses[String(birthStar || '').trim().toLowerCase()]);
  return personalized;
}

export function scoreAssessment(answers, hobbyCards = [], birthStar = '') {
  return applyPersonalizationBonuses(scoreAnswers(answers), hobbyCards, birthStar);
}

function addBonus(scores, bonus) {
  Object.entries(bonus || {}).forEach(([dim, points]) => {
    if (scores[dim] !== undefined) {
      scores[dim] += points;
    }
  });
}

export function getTopDimensions(scores = {}) {
  return [...dimensions].sort((a, b) => {
    const diff = (scores[b] || 0) - (scores[a] || 0);
    return diff || dimensions.indexOf(a) - dimensions.indexOf(b);
  });
}

export function normalizeScores(scores = {}) {
  const max = Math.max(1, ...dimensions.map((dim) => scores[dim] || 0));
  return dimensions.reduce((acc, dim) => ({ ...acc, [dim]: (scores[dim] || 0) / max }), {});
}

export function chooseClass(scores = {}) {
  const normalized = normalizeScores(scores);
  const entries = Object.values(classCatalog).map((klass) => {
    const fit = dimensions.reduce((total, dim) => total + normalized[dim] * (klass.profile[dim] || 0), 0);
    const topBonus = getTopDimensions(scores)
      .slice(0, 2)
      .reduce((total, dim) => total + (klass.dominant.includes(dim) ? 0.35 : 0), 0);
    return { klass, fit: fit + topBonus };
  });
  entries.sort((a, b) => b.fit - a.fit);
  return entries[0]?.klass || classCatalog.knight;
}

export function resultFromScores(scores = {}) {
  const klass = chooseClass(scores);
  const normalized = normalizeScores(scores);
  const top = getTopDimensions(scores);
  return {
    klass,
    normalized,
    topDimensions: top,
    dominantLabel: top.slice(0, 2).map((dim) => dimensionMeta[dim].name).join(' - '),
  };
}
