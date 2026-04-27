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

const arcadia = require('../../assets/images/backgrounds/arcadia-splash.webp');

const maxSelection = 3;

const hobbies = [
  {
    id: 'fighter',
    image: require('../../assets/images/hobbies/fighter.webp'),
    name: "The Fighter's Path",
    desc: 'Mereka yang menempa tubuh dan tekad.',
    color: '#c87832',
  },
  {
    id: 'scholar',
    image: require('../../assets/images/hobbies/scholar.webp'),
    name: "The Scholar's Scroll",
    desc: 'Mereka yang mencari kebenaran dunia.',
    color: '#5070c8',
  },
  {
    id: 'artist',
    image: require('../../assets/images/hobbies/artist.webp'),
    name: "The Artist's Brush",
    desc: 'Mereka yang menciptakan dari imajinasi.',
    color: '#d85878',
  },
  {
    id: 'guardian',
    image: require('../../assets/images/hobbies/guardians-lantern.webp'),
    name: "The Guardian's Lantern",
    desc: 'Mereka yang kekuatannya ada pada sesama.',
    color: '#d0a83a',
  },
  {
    id: 'leader',
    image: require('../../assets/images/hobbies/leaders-crown.webp'),
    name: "The Leader's Crown",
    desc: 'Mereka yang lahir untuk memimpin.',
    color: '#8b54d8',
  },
  {
    id: 'keeper',
    image: require('../../assets/images/hobbies/keepers-codex.webp'),
    name: "The Keeper's Codex",
    desc: 'Mereka yang menjaga segalanya tetap rapi.',
    color: '#6f80b8',
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

function Counter({ count }) {
  return (
    <View style={[styles.counter, count > 0 && styles.counterActive]}>
      <Text style={[styles.counterNum, count > 0 && styles.counterNumActive]}>{count}</Text>
      <Text style={styles.counterText}>/{maxSelection}</Text>
      <Text style={styles.counterLabel}>dipilih</Text>
    </View>
  );
}

function HobbyCard({ hobby, selected, disabled, onPress, width }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          width,
          height: width * 1.34,
        },
        selected && styles.cardSelected,
        selected && {
          borderColor: hobby.color,
          shadowColor: hobby.color,
        },
        disabled && styles.cardDisabled,
        pressed && !disabled && styles.cardPressed,
      ]}
    >
      <Image source={hobby.image} resizeMode="cover" style={styles.cardImage} />
      <LinearGradient
        colors={['rgba(10,10,20,0)', 'rgba(10,10,20,0.72)', 'rgba(10,10,20,0.96)']}
        locations={[0, 0.46, 1]}
        style={styles.cardScrim}
      />

      <View pointerEvents="none" style={[styles.corner, styles.cornerTopLeft, selected && { borderColor: hobby.color }]} />
      <View pointerEvents="none" style={[styles.corner, styles.cornerTopRight, selected && { borderColor: hobby.color }]} />
      <View pointerEvents="none" style={[styles.corner, styles.cornerBottomLeft, selected && { borderColor: hobby.color }]} />
      <View pointerEvents="none" style={[styles.corner, styles.cornerBottomRight, selected && { borderColor: hobby.color }]} />

      <View
        style={[
          styles.checkBadge,
          selected && styles.checkBadgeOn,
          selected && {
            backgroundColor: hobby.color,
            borderColor: hobby.color,
            shadowColor: hobby.color,
          },
        ]}
      >
        {selected && (
          <Svg width={15} height={15} viewBox="0 0 14 14">
            <Path
              d="M3 7 L6 10 L11 4"
              fill="none"
              stroke={colors.textOnInvert}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      </View>

      <View style={styles.cardMeta}>
        <Text style={styles.cardTitle}>{hobby.name}</Text>
        <Text style={styles.cardDesc}>{hobby.desc}</Text>
      </View>
    </Pressable>
  );
}

function statusCopy(count) {
  if (count === 0) return 'Pilih setidaknya satu kartu untuk melanjutkan.';
  if (count === 1) return 'Satu kartu dipilih. Pilih lagi atau lanjutkan.';
  if (count === 2) return 'Dua kartu dipilih. Tambah satu lagi atau lanjutkan.';
  return 'Tiga kartu telah dipilih. Sempurna.';
}

export function HobbyCardsScreen({ selectedCards = [], onBack, onDone }) {
  const { width } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);
  const columns = breakpoint === 'mobile' ? 2 : 3;
  const horizontalPadding = breakpoint === 'desktop' ? 56 : breakpoint === 'tablet' ? 32 : 16;
  const gap = breakpoint === 'desktop' ? 24 : breakpoint === 'tablet' ? 18 : 12;
  const maxGridWidth = breakpoint === 'desktop' ? 1080 : breakpoint === 'tablet' ? 760 : width - horizontalPadding * 2;
  const gridWidth = Math.min(width - horizontalPadding * 2, maxGridWidth);
  const cardWidth = Math.floor((gridWidth - gap * (columns - 1)) / columns);
  const [selected, setSelected] = useState(selectedCards);

  const canContinue = selected.length > 0;

  const toggle = (id) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= maxSelection) return current;
      return [...current, id];
    });
  };

  const gridRows = useMemo(() => {
    const rows = [];
    for (let index = 0; index < hobbies.length; index += columns) {
      rows.push(hobbies.slice(index, index + columns));
    }
    return rows;
  }, [columns]);

  return (
    <View style={styles.screen}>
      <Image source={arcadia} resizeMode="cover" blurRadius={18} style={styles.backgroundImage} />
      <LinearGradient
        colors={['rgba(10,10,20,0.58)', 'rgba(10,10,20,0.86)', 'rgba(10,10,20,0.97)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.topBar, breakpoint !== 'mobile' && styles.topBarWide]}>
          <BackButton onPress={onBack} />
          <Text style={styles.step}>STEP 05 - KARTU HOBI</Text>
          <Counter count={selected.length} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: breakpoint === 'mobile' ? 138 : 150,
            },
          ]}
        >
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>Step 05 - Kartu Hobi</Text>
            <Text style={[styles.title, breakpoint === 'desktop' && styles.titleDesktop]}>Pilih Jalurmu</Text>
            <Text style={styles.subtitle}>Pilih hingga tiga Hobby Card yang mencerminkan dirimu.</Text>
          </View>

          <View style={[styles.grid, { width: gridWidth, gap }]}>
            {gridRows.map((row, rowIndex) => (
              <View key={rowIndex} style={[styles.gridRow, { gap }]}>
                {row.map((hobby) => {
                  const isSelected = selected.includes(hobby.id);
                  const isDisabled = !isSelected && selected.length >= maxSelection;
                  return (
                    <HobbyCard
                      key={hobby.id}
                      hobby={hobby}
                      width={cardWidth}
                      selected={isSelected}
                      disabled={isDisabled}
                      onPress={() => toggle(hobby.id)}
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
              <Text style={[styles.statusDot, canContinue && styles.statusDotOn]}>● </Text>
              {statusCopy(selected.length)}
            </Text>
            <GoldButton onPress={() => onDone(selected)} disabled={!canContinue} style={styles.ctaButton}>
              {canContinue ? 'LANJUTKAN' : 'PILIH SATU'}
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
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.16,
    transform: [{ scale: 1.1 }],
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
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.3,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  counter: {
    minWidth: 72,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: 'rgba(10,10,20,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  counterActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(200,160,48,0.12)',
    shadowColor: colors.gold,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  counterNum: {
    color: colors.textMuted,
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '700',
  },
  counterNumActive: {
    color: colors.goldHi,
  },
  counterText: {
    color: colors.textMuted,
    fontFamily: fonts.display,
    fontSize: 10,
    fontWeight: '700',
  },
  counterLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingTop: 8,
  },
  intro: {
    maxWidth: 640,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
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
    fontFamily: fonts.display,
    fontSize: 31,
    fontWeight: '700',
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
    maxWidth: 430,
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
    marginBottom: 0,
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    shadowColor: '#000',
    shadowOpacity: 0.62,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  cardSelected: {
    borderWidth: 1.5,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    transform: [{ translateY: -2 }],
  },
  cardDisabled: {
    opacity: 0.44,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectPosition: '50% 28%',
  },
  cardScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  corner: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderColor: colors.gold,
    opacity: 0.82,
  },
  cornerTopLeft: {
    top: 9,
    left: 9,
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  cornerTopRight: {
    top: 9,
    right: 9,
    borderTopWidth: 1,
    borderRightWidth: 1,
  },
  cornerBottomLeft: {
    bottom: 9,
    left: 9,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  cornerBottomRight: {
    bottom: 9,
    right: 9,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  checkBadgeOn: {
    opacity: 1,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  checkText: {
    color: colors.bgPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  checkTextOn: {
    color: colors.textOnInvert,
  },
  cardMeta: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    alignItems: 'center',
    gap: 4,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.7,
    lineHeight: 18,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowRadius: 8,
  },
  cardDesc: {
    color: colors.textSecondary,
    fontFamily: fonts.oracleItalic,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowRadius: 7,
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
  statusDotOn: {
    color: colors.gold,
  },
  ctaButton: {
    maxWidth: 360,
    alignSelf: 'center',
  },
});
