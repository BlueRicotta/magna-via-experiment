import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { GoldButton } from '../components/GoldButton';
import { scoreAnswers } from '../data/results';
import { colors, fonts, radii } from '../theme/tokens';

const questions = [
  {
    id: 1,
    title: 'Persimpangan Jalan',
    image: require('../../assets/images/questions/1.webp'),
    narrative:
      'Setelah perjalanan panjang, kamu tiba di gerbang Kerajaan Timur bernama Arcadia. Seorang penjaga bertanya: "Apa tujuanmu datang ke sini, Petualang?"',
    choices: [
      ['A', 'Aku ingin bekerja keras dan membangun sesuatu yang nyata dengan tanganku sendiri.', 'R', 2],
      ['B', 'Aku ingin memahami rahasia dunia ini melalui pengetahuan dan penelitian.', 'I', 2],
      ['C', 'Aku ingin mengekspresikan diri dan meninggalkan karya yang semua orang akan kenang.', 'A', 2],
      ['D', 'Aku ingin membantu orang-orang yang lemah di kerajaan ini dan membuat mereka bahagia.', 'S', 2],
    ],
  },
  {
    id: 2,
    title: 'Tugas Kerajaan',
    image: require('../../assets/images/questions/2.webp'),
    narrative: 'Kamu dipercayai untuk memilih suatu tugas dalam kerajaan, apa tugas yang akan kamu pilih?',
    choices: [
      ['A', 'Memperbaiki bagian tembok benteng yang rusak.', 'R', 2],
      ['B', 'Menganalisis kelemahan struktural benteng dan menyusun laporan.', 'I', 3],
      ['C', 'Memimpin dan mengorganisir para pekerja agar bekerja efisien.', 'E', 2],
      ['D', 'Mencatat seluruh inventaris material dan membuat anggaran biaya.', 'C', 2],
    ],
  },
  {
    id: 3,
    title: 'Festival Kerajaan',
    image: require('../../assets/images/questions/3.webp'),
    narrative: 'Festival tahunan Arcadia akan segera dimulai. Kamu diminta untuk berkontribusi. Apa yang kamu pilih?',
    choices: [
      ['A', 'Menciptakan dekorasi, pertunjukan seni, atau musik untuk festival.', 'A', 2],
      ['B', 'Menjaga dan merawat lansia serta anak-anak selama festival berlangsung.', 'S', 2],
      ['C', 'Memimpin panitia penyelenggara dan memastikan semua berjalan lancar.', 'E', 3],
      ['D', 'Mengelola anggaran, jadwal, dan pencatatan logistik festival.', 'C', 2],
    ],
  },
  {
    id: 4,
    title: 'Ancaman Naga',
    image: require('../../assets/images/questions/4.webp'),
    narrative: 'Seekor naga dilaporkan mendekati desa yang tidak jauh dari posisimu, apa yang akan kamu lakukan?',
    choices: [
      ['A', 'Langsung pergi ke garis depan medan dan menyiapkan pertahanan fisik.', 'R', 2],
      ['B', 'Mencari literatur kuno tentang kelemahan dan perilaku naga tersebut.', 'I', 2],
      ['C', 'Menulis syair atau cerita untuk menjaga semangat warga agar tidak panik.', 'A', 1],
      ['D', 'Mengumpulkan warga, memimpin evakuasi, dan menyusun strategi untuk keluar dari desa.', 'E', 3],
    ],
  },
  {
    id: 5,
    title: 'Peta Misterius',
    image: require('../../assets/images/questions/5.webp'),
    narrative: 'Kamu menemukan sebuah peta tua di sebuah kastil yang kosong. Apa yang kamu lakukan?',
    choices: [
      ['A', 'Langsung berangkat sendiri menjelajahi lokasi yang ditunjuk peta.', 'R', 3],
      ['B', 'Membagikan peta kepada para petualang lainnya yang mungkin membutuhkan informasinya.', 'S', 1],
      ['C', 'Merekrut tim, mengorganisir ekspedisi, dan memimpin perjalanan bersama.', 'E', 2],
      ['D', 'Mempelajari peta dan membandingkannya dengan catatan geografis kerajaan.', 'C', 2],
    ],
  },
  {
    id: 6,
    title: 'Wabah Misterius',
    image: require('../../assets/images/questions/6.webp'),
    narrative: 'Sebuah penyakit aneh menyebar di desa yang kamu sedang tempati. Apa yang kamu lakukan pertama kali?',
    choices: [
      ['A', 'Menganalisis gejala-gejala yang ada secara sistematis untuk mencari penyebabnya.', 'I', 3],
      ['B', 'Menciptakan lagu atau ritual penyembuhan untuk mengangkat semangat warga.', 'A', 1],
      ['C', 'Langsung merawat yang sakit dan menghibur keluarga yang berduka.', 'S', 2],
      ['D', 'Mendokumentasikan pola penyebaran dan mengorganisir karantina.', 'C', 2],
    ],
  },
  {
    id: 7,
    title: 'Reruntuhan Kuno',
    image: require('../../assets/images/questions/7.webp'),
    narrative: 'Di tengah hutan, kamu menemukan reruntuhan peradaban kuno. Apa yang kamu akan lakukan?',
    choices: [
      ['A', 'Membersihkan puing-puing dan melakukan eksplorasi ke dalam.', 'R', 2],
      ['B', 'Membaca dan mempelajari struktur atau peninggalan yang ada.', 'I', 2],
      ['C', 'Membuat sketsa detail reruntuhan untuk mengabadikan keindahannya.', 'A', 3],
      ['D', 'Melaporkan penemuan ini ke kerajaan untuk diamankan.', 'S', 1],
    ],
  },
  {
    id: 8,
    title: 'Badai di Perjalanan',
    image: require('../../assets/images/questions/8.webp'),
    narrative:
      'Rombongan group-mu tersesat di hutan dalam kondisi badai. Semua orang panik. Kamu adalah yang paling tenang. Apa yang kamu lakukan?',
    choices: [
      ['A', 'Membuka jalur baru secara acak melalui medan yang berat.', 'R', 2],
      ['B', 'Menentukan arah menggunakan bintang, peta, dan penanda alam.', 'I', 2],
      ['C', 'Mengambil alih kepemimpinan, menjaga semangat, dan membagikan tugas.', 'E', 2],
      ['D', 'Mengikuti prosedur darurat yang tertulis dalam panduan perjalanan.', 'C', 2],
    ],
  },
  {
    id: 9,
    title: 'Permintaan Desa Tetangga',
    image: require('../../assets/images/questions/9.webp'),
    narrative: 'Desa tetangga meminta bantuan kerajaan setelah mengalami bencana. Kamu diminta menyampaikan usulan. Apa yang kamu usulkan?',
    choices: [
      ['A', 'Program pertukaran budaya melalui seni dan pertunjukan cerita rakyat untuk menghibur korban bencana.', 'A', 2],
      ['B', 'Mengirimkan penolong dan relawan untuk merawat korban secara langsung.', 'S', 2],
      ['C', 'Membentuk aliansi formal dan menegosiasikan perjanjian kerja sama untuk pembangunan reruntuhan.', 'E', 2],
      ['D', 'Membangun sistem perdagangan agar korban bencana dapat mendapatkan pasokan dan barang bantuan.', 'C', 3],
    ],
  },
  {
    id: 10,
    title: 'Tawaran Pekerjaan',
    image: require('../../assets/images/questions/10.webp'),
    narrative: 'Kepala Guild menawarkan posisi baru setelah melihat kemampuanmu. Kamu memilih untuk:',
    choices: [
      ['A', 'Merancang dan membuat senjata serta peralatan untuk pasukan kerajaan.', 'R', 2],
      ['B', 'Memimpin tim penelitian untuk mengungkap misteri bahan-bahan langka.', 'I', 2],
      ['C', 'Menjadi seniman resmi yang mendokumentasikan sejarah kerajaan lewat karya.', 'A', 2],
      ['D', 'Mengelola jaringan perdagangan dan negosiasi antara kerajaan dan mitra dagang.', 'E', 2],
    ],
  },
  {
    id: 11,
    title: 'Turnamen Besar',
    image: require('../../assets/images/questions/11.webp'),
    narrative: 'Turnamen akbar Arcadia diumumkan. Kamu ikut serta, tetapi bukan untuk bertarung. Peranmu adalah:',
    choices: [
      ['A', 'Mengikuti lomba ketangkasan fisik dan keahlian bertahan.', 'R', 1],
      ['B', 'Menjadi tenaga medis sukarela untuk peserta yang terluka.', 'S', 2],
      ['C', 'Memimpin dan mengatur strategi tim jagoanmu dari balik layar.', 'E', 2],
      ['D', 'Mengelola pendaftaran, jadwal, dan pencatatan hasil pertandingan.', 'C', 3],
    ],
  },
  {
    id: 12,
    title: 'Warisan Tanah',
    image: require('../../assets/images/questions/12.webp'),
    narrative: 'Kamu mewarisi sebidang lahan kosong di tepi kota. Kamu memutuskan untuk menggunakannya sebagai:',
    choices: [
      ['A', 'Laboratorium pribadi untuk penelitian dan eksperimen.', 'I', 2],
      ['B', 'Ruang kreatif terbuka untuk seni, musik, dan kerajinan bersama warga.', 'A', 2],
      ['C', 'Kebun komunal yang bisa diakses dan dimanfaatkan seluruh warga desa.', 'S', 3],
      ['D', 'Lahan pertanian terstruktur dengan sistem irigasi dan pencatatan hasil panen.', 'C', 2],
    ],
  },
  {
    id: 13,
    title: 'Malam Sebelum Pertempuran',
    image: require('../../assets/images/questions/13.webp'),
    narrative: 'Besok adalah hari terpenting dalam perjalananmu di Arcadia. Malam ini, bagaimana kamu menghabiskan waktu?',
    choices: [
      ['A', 'Berlatih fisik dan mempertajam senjata hingga larut malam.', 'R', 2],
      ['B', 'Mempelajari catatan taktik dan strategi dari pertempuran masa lalu.', 'I', 2],
      ['C', 'Menulis surat atau syair untuk orang-orang yang kamu cintai.', 'A', 2],
      ['D', 'Menghabiskan malam bersama rekan-rekan untuk saling menguatkan.', 'S', 2],
    ],
  },
  {
    id: 14,
    title: 'Balai Kota yang Runtuh',
    image: require('../../assets/images/questions/14.webp'),
    narrative: 'Balai kota hancur akibat gempa. Kamu dipercaya memimpin rekonstruksi. Apa langkah pertamamu?',
    choices: [
      ['A', 'Turun langsung memimpin pengerjaan konstruksi bersama para pekerja.', 'R', 2],
      ['B', 'Menegosiasikan kontrak dengan pemasok bahan dan menugaskan tim ahli.', 'E', 2],
      ['C', 'Memastikan seluruh warga yang kehilangan tempat tinggal mendapat perlindungan dulu.', 'S', 2],
      ['D', 'Menyusun anggaran, jadwal, dan prosedur resmi pembangunan balai kota.', 'C', 2],
    ],
  },
  {
    id: 15,
    title: 'Warisan untuk Kerajaan',
    image: require('../../assets/images/questions/15.webp'),
    narrative: 'Jika kamu telah tiada, apa warisan atau jasa yang akan kamu tinggalkan untuk warga dan kerajaan Arcadia?',
    choices: [
      ['A', 'Sebuah buku penelitian komprehensif tentang ilmu alam dan potensi kerajaan.', 'I', 2],
      ['B', 'Sebuah cerita agung, kisah yang menginspirasi generasi penerus lewat seni.', 'A', 2],
      ['C', 'Sebuah jaringan aliansi dan sistem ekonomi yang kamu bangun dari nol.', 'E', 2],
      ['D', 'Konstitusi, sistem hukum, dan arsip lengkap yang menjaga keteraturan kerajaan.', 'C', 3],
    ],
  },
];

const dimColors = {
  R: '#c87832',
  I: '#5070c8',
  A: '#d85878',
  S: '#40a070',
  E: '#a050c8',
  C: '#c8a030',
};

function getBreakpoint(width) {
  if (width >= 960) return 'desktop';
  if (width >= 600) return 'tablet';
  return 'mobile';
}

function BackButton({ onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
    >
      <Text style={styles.backIcon}>{'<'}</Text>
      <Text style={styles.backText}>Kembali</Text>
    </Pressable>
  );
}

function CheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Path d="M3 7 L6 10 L11 4" fill="none" stroke={colors.textOnInvert} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChoiceCard({ choice, selected, onPress }) {
  const [letter, text, dim] = choice;
  const accent = dimColors[dim] || colors.gold;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        selected && {
          borderColor: accent,
          shadowColor: accent,
          backgroundColor: 'rgba(28,22,46,0.96)',
        },
        pressed && styles.choicePressed,
      ]}
    >
      <View style={[styles.choiceLetter, selected && { backgroundColor: accent, borderColor: accent }]}>
        <Text style={[styles.choiceLetterText, selected && styles.choiceLetterTextSelected]}>{letter}</Text>
      </View>
      <Text style={styles.choiceText}>{text}</Text>
      <View style={[styles.choiceCheck, selected && { opacity: 1, backgroundColor: accent, borderColor: accent }]}>
        {selected && <CheckIcon />}
      </View>
    </Pressable>
  );
}

export function QuizScreen({ savedAnswers = {}, onBack, onDone }) {
  const { width } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);
  const desktop = breakpoint === 'desktop';
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(savedAnswers);
  const question = questions[index];
  const selected = answers[question.id]?.letter;
  const progress = ((index + 1) / questions.length) * 100;

  const selectChoice = ([letter, text, dimension, points]) => {
    setAnswers((current) => ({
      ...current,
      [question.id]: { letter, text, dimension, points },
    }));
  };

  const goBack = () => {
    if (index === 0) {
      onBack();
      return;
    }
    setIndex((current) => current - 1);
  };

  const goNext = () => {
    if (!selected) return;
    if (index === questions.length - 1) {
      onDone({
        answers,
        scores: scoreAnswers(answers),
      });
      return;
    }
    setIndex((current) => current + 1);
  };

  return (
    <View style={styles.screen}>
      <Image key={question.id} source={question.image} resizeMode="cover" style={[styles.backgroundImage, desktop && styles.backgroundImageDesktop]} />
      <LinearGradient
        colors={
          desktop
            ? ['rgba(10,10,20,0.12)', 'rgba(10,10,20,0.52)', 'rgba(10,10,20,0.92)']
            : ['rgba(10,10,20,0.06)', 'rgba(10,10,20,0.52)', 'rgba(10,10,20,0.96)']
        }
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.topBar, desktop && styles.topBarDesktop]}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.topRow}>
            <BackButton onPress={goBack} />
            <Text style={styles.step}>STEP 06 - QUIZ ARCADIA</Text>
            <Text style={styles.counter}>{index + 1}/{questions.length}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            desktop && styles.scrollContentDesktop,
          ]}
        >
          <View style={[styles.panel, desktop && styles.panelDesktop]}>
            <Text style={styles.panelEyebrow}>Skenario {question.id} - {question.title}</Text>
            <Text style={[styles.narrative, desktop && styles.narrativeDesktop]}>{question.narrative}</Text>

            <View style={styles.choices}>
              {question.choices.map((choice) => (
                <ChoiceCard
                  key={choice[0]}
                  choice={choice}
                  selected={selected === choice[0]}
                  onPress={() => selectChoice(choice)}
                />
              ))}
            </View>

            <View style={styles.ctaRow}>
              <GoldButton onPress={goNext} disabled={!selected} style={styles.ctaButton}>
                {index === questions.length - 1 ? 'LIHAT TAKDIR' : 'LANJUTKAN'}
              </GoldButton>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.bgPrimary,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    objectPosition: '50% 32%',
  },
  backgroundImageDesktop: {
    objectPosition: '50% 24%',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    height: 80,
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 12,
  },
  topBarDesktop: {
    height: 92,
    paddingHorizontal: 36,
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(200,160,48,0.16)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.55,
    shadowRadius: 10,
  },
  topRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    minWidth: 94,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: 'rgba(10,10,20,0.66)',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  backButtonPressed: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(200,160,48,0.09)',
  },
  backIcon: {
    color: colors.textSecondary,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  backText: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  step: {
    flex: 1,
    color: colors.textMuted,
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.3,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  counter: {
    minWidth: 70,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.gold,
    backgroundColor: 'rgba(200,160,48,0.12)',
    color: colors.goldHi,
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    lineHeight: 33,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 48,
  },
  scrollContentDesktop: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 56,
    paddingTop: 30,
    paddingBottom: 42,
  },
  panel: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(200,160,48,0.42)',
    backgroundColor: 'rgba(20,16,34,0.94)',
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
  },
  panelDesktop: {
    width: 560,
    maxWidth: 560,
    alignSelf: 'auto',
    padding: 22,
  },
  panelEyebrow: {
    color: colors.gold,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  narrative: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.8,
    lineHeight: 27,
  },
  narrativeDesktop: {
    fontSize: 23,
    lineHeight: 31,
  },
  choices: {
    gap: 10,
    marginTop: 18,
  },
  choice: {
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 13,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: 'rgba(10,10,20,0.72)',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  choicePressed: {
    transform: [{ scale: 0.992 }],
  },
  choiceLetter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgPrimary,
  },
  choiceLetterText: {
    color: colors.textSecondary,
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '700',
  },
  choiceLetterTextSelected: {
    color: colors.textOnInvert,
  },
  choiceText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  choiceCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  ctaRow: {
    alignItems: 'flex-end',
    marginTop: 18,
  },
  ctaButton: {
    maxWidth: 360,
  },
});
