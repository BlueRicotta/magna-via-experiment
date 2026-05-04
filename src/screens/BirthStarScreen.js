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
import { colors, fonts, radii } from '../theme/tokens';

const stars = [
  {
    id: 'ignis',
    image: require('../../assets/images/birth-stars/ignis.webp'),
    name: 'Ignis',
    label: 'Api',
    desc: 'Berani, gagah, bertindak cepat.',
    color: colors.ignis,
    glow: 'rgba(200,48,32,0.55)',
    numeral: 'I',
  },
  {
    id: 'aqua',
    image: require('../../assets/images/birth-stars/aqua.webp'),
    name: 'Aqua',
    label: 'Air',
    desc: 'Empatis, mengalir, menghubungkan.',
    color: colors.aqua,
    glow: 'rgba(32,96,200,0.55)',
    numeral: 'II',
  },
  {
    id: 'terra',
    image: require('../../assets/images/birth-stars/terra.webp'),
    name: 'Terra',
    label: 'Bumi',
    desc: 'Teguh, teratur, membangun.',
    color: colors.terra,
    glow: 'rgba(48,144,80,0.55)',
    numeral: 'III',
  },
  {
    id: 'ventus',
    image: require('../../assets/images/birth-stars/ventus.webp'),
    name: 'Ventus',
    label: 'Angin',
    desc: 'Ingin tahu, berpikir, merenungi.',
    color: colors.ventus,
    glow: 'rgba(112,48,192,0.55)',
    numeral: 'IV',
  },
];

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

function ElementIcon({ color }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 14 14">
      <Path
        d="M7 1.5 L11.5 7 L7 12.5 L2.5 7 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <Path d="M4.5 7 H9.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Path
        d="M3 7 L6 10 L11 4"
        fill="none"
        stroke={colors.textOnInvert}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StarCard({ star, selected, dimmed, onPress, width }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          width,
          minHeight: width * 1.52,
          borderColor: selected ? star.color : colors.border,
          shadowColor: selected ? star.color : '#000',
        },
        selected && styles.cardSelected,
        dimmed && styles.cardDimmed,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardHead}>
        <View style={[styles.elementPill, { borderColor: star.color }]}>
          <ElementIcon color={star.color} />
          <Text style={[styles.elementLabel, { color: star.color }]}>{star.label}</Text>
        </View>
        <Text style={styles.numeral}>{star.numeral}</Text>
      </View>

      <View style={[styles.emblemWrap, selected && { shadowColor: star.color, shadowOpacity: 0.34 }]}>
        <Image source={star.image} resizeMode="cover" style={styles.emblemImage} />
        <View pointerEvents="none" style={[styles.emblemRing, { borderColor: selected ? star.color : 'rgba(200,160,48,0.22)' }]} />
      </View>

      <Text style={[styles.cardName, selected && { color: star.color, textShadowColor: star.glow }]}>
        {star.name}
      </Text>
      <Text style={styles.cardDesc}>{star.desc}</Text>

      <View style={[styles.checkBadge, selected && { opacity: 1, backgroundColor: star.color, borderColor: star.color }]}>
        {selected && <CheckIcon />}
      </View>
    </Pressable>
  );
}

function statusText(selectedStar) {
  if (!selectedStar) return 'Pilih satu bintang untuk lanjut.';
  return `${selectedStar.name} berdenyut dalam nadimu.`;
}

export function BirthStarScreen({ value, onBack, onDone }) {
  const { width } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);
  const columns = breakpoint === 'desktop' ? 4 : 2;
  const horizontalPadding = breakpoint === 'desktop' ? 56 : breakpoint === 'tablet' ? 32 : 16;
  const gap = breakpoint === 'desktop' ? 24 : breakpoint === 'tablet' ? 18 : 12;
  const maxGridWidth = breakpoint === 'desktop' ? 1100 : breakpoint === 'tablet' ? 720 : width - horizontalPadding * 2;
  const gridWidth = Math.min(width - horizontalPadding * 2, maxGridWidth);
  const cardWidth = Math.floor((gridWidth - gap * (columns - 1)) / columns);
  const [selected, setSelected] = useState(value || null);
  const selectedStar = stars.find((star) => star.id === selected);

  const rows = useMemo(() => {
    const grouped = [];
    for (let index = 0; index < stars.length; index += columns) {
      grouped.push(stars.slice(index, index + columns));
    }
    return grouped;
  }, [columns]);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#0a0a18', '#07070f', colors.bgPrimary]}
        locations={[0, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.topBar, breakpoint !== 'mobile' && styles.topBarWide]}>
          <BackButton onPress={onBack} />
          <Text style={styles.step}>STEP 04 - BINTANG LAHIRMU</Text>
          <View style={styles.topSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: breakpoint === 'mobile' ? 140 : 150,
            },
          ]}
        >
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>Step 04 - Bintang Lahirmu</Text>
            <Text style={[styles.title, breakpoint === 'desktop' && styles.titleDesktop]}>Pilih Bintangmu</Text>
            <Text style={styles.subtitle}>
              Keempat elemen ini menuntun pejuang-pejuang Arcadia. Mana yang berdenyut di dalammu?
            </Text>
          </View>

          <View style={[styles.grid, { width: gridWidth, gap }]}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={[styles.gridRow, { gap }]}>
                {row.map((star) => {
                  const isSelected = selected === star.id;
                  return (
                    <StarCard
                      key={star.id}
                      star={star}
                      width={cardWidth}
                      selected={isSelected}
                      dimmed={!!selected && !isSelected}
                      onPress={() => setSelected(isSelected ? null : star.id)}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        <View pointerEvents="box-none" style={styles.ctaBar}>
          <LinearGradient
            colors={['rgba(10,10,20,0)', 'rgba(10,10,20,0.94)', 'rgba(10,10,20,0.99)']}
            style={styles.ctaScrim}
          />
          <View style={[styles.ctaInner, breakpoint !== 'mobile' && styles.ctaInnerWide]}>
            <Text style={styles.status}>
              <Text style={[styles.statusDot, selectedStar && { color: selectedStar.color }]}>● </Text>
              {statusText(selectedStar)}
            </Text>
            <GoldButton onPress={() => onDone(selected)} disabled={!selected} style={[styles.ctaButton, selectedStar && { shadowColor: selectedStar.color }]}>
              {selected ? 'KUNCI BINTANGMU' : 'PILIH UNTUK LANJUT'}
            </GoldButton>
          </View>
        </View>
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
  safeArea: {
    flex: 1,
  },
  topBar: {
    height: 66,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 10,
  },
  topBarWide: {
    height: 82,
    paddingHorizontal: 28,
    gap: 16,
  },
  backButton: {
    minWidth: 94,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: 'rgba(10,10,20,0.62)',
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
    fontFamily: fonts.displayBold,
    fontSize: 11,
    letterSpacing: 2.3,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  topSpacer: {
    width: 94,
  },
  scrollContent: {
    paddingTop: 8,
  },
  intro: {
    maxWidth: 680,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  eyebrow: {
    color: colors.gold,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.8,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.displayBold,
    fontSize: 31,
    letterSpacing: 1.8,
    lineHeight: 37,
    textAlign: 'center',
    textShadowColor: 'rgba(200,160,48,0.16)',
    textShadowRadius: 22,
  },
  titleDesktop: {
    fontSize: 50,
    lineHeight: 56,
  },
  subtitle: {
    maxWidth: 470,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  grid: {
    alignSelf: 'center',
  },
  gridRow: {
    flexDirection: 'row',
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'rgba(22,17,36,0.92)',
    padding: 14,
    shadowOpacity: 0.66,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
  },
  cardSelected: {
    borderWidth: 1.4,
    shadowOpacity: 0.36,
    shadowRadius: 28,
    transform: [{ translateY: -3 }],
  },
  cardDimmed: {
    opacity: 0.48,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
  },
  cardHead: {
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 8,
  },
  elementPill: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
    borderWidth: 0.5,
    backgroundColor: 'rgba(10,10,20,0.62)',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  elementLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.9,
    textTransform: 'uppercase',
  },
  numeral: {
    color: colors.textMuted,
    fontFamily: fonts.displayBold,
    fontSize: 11,
    letterSpacing: 1.8,
    opacity: 0.72,
  },
  emblemWrap: {
    width: '94%',
    aspectRatio: 1,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: colors.bgPrimary,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  emblemImage: {
    width: '100%',
    height: '100%',
    objectPosition: '50% 42%',
  },
  emblemRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 1,
  },
  cardName: {
    color: colors.textPrimary,
    fontFamily: fonts.displayBold,
    fontSize: 22,
    letterSpacing: 1.8,
    lineHeight: 26,
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowRadius: 16,
  },
  cardDesc: {
    color: colors.textMuted,
    fontFamily: fonts.oracleItalic,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 4,
  },
  checkBadge: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  ctaScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 158,
  },
  ctaInner: {
    padding: 16,
    gap: 10,
  },
  ctaInnerWide: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 56,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 24,
  },
  status: {
    color: colors.textSecondary,
    fontFamily: fonts.oracleItalic,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  statusDot: {
    color: colors.textDisabled,
    fontFamily: fonts.bodyBold,
  },
  ctaButton: {
    maxWidth: 360,
    alignSelf: 'center',
  },
});
