import { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { GoldButton } from '../components/GoldButton';
import { colors, fonts, radii } from '../theme/tokens';

const cenayangReveal = require('../../assets/images/misc/5.webp');

function getBreakpoint(width) {
  if (width >= 960) return 'desktop';
  if (width >= 600) return 'tablet';
  return 'mobile';
}

function makeStars(count) {
  return Array.from({ length: count }, (_, index) => {
    const seed = (index + 1) * 9301;
    return {
      id: index,
      left: `${((seed * 13) % 1000) / 10}%`,
      top: `${((seed * 31) % 1000) / 10}%`,
      size: 0.7 + (seed % 9) * 0.14,
      opacity: 0.22 + (seed % 17) * 0.035,
    };
  });
}

export function ResultRevealScreen({ onDone }) {
  const { width, height } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);
  const desktop = breakpoint === 'desktop';
  const tablet = breakpoint === 'tablet';
  const [pressed, setPressed] = useState(false);
  const stars = useMemo(() => makeStars(desktop ? 96 : tablet ? 72 : 54), [desktop, tablet]);
  const figureWidth = desktop
    ? undefined
    : Math.max(
      220,
      Math.min(
        width * (tablet ? 0.58 : 0.86),
        tablet ? 430 : 350,
        (height - (tablet ? 312 : 300)) * (9 / 16),
      ),
    );

  const continueToResult = () => {
    if (pressed) return;
    setPressed(true);
    onDone();
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#06060f', '#0a0820', '#1a0c2a', '#2a1230']}
        locations={[0, 0.42, 0.76, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.sky}>
        <View style={[styles.purpleAura, desktop && styles.purpleAuraDesktop]} />
        <View style={styles.goldBloom} />
        {stars.map((star) => (
          <View
            key={star.id}
            style={[
              styles.star,
              {
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
              },
            ]}
          />
        ))}
        {Array.from({ length: 7 }, (_, index) => (
          <View
            key={index}
            style={[
              styles.ray,
              {
                transform: [
                  { translateX: -3 },
                  { rotate: `${-52 + index * 17}deg` },
                  { translateY: -280 },
                ],
              },
            ]}
          />
        ))}
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.stage,
          desktop && styles.stageDesktop,
          tablet && styles.stageTablet,
        ]}
      >
        <View
          style={[
            styles.figureWrap,
            !desktop && { width: figureWidth, maxWidth: figureWidth },
            desktop && styles.figureWrapDesktop,
            tablet && styles.figureWrapTablet,
          ]}
        >
          <View style={styles.figureGlow} />
          <View style={styles.scrollGlow} />
          <View style={[styles.figureCard, desktop && styles.figureCardDesktop]}>
            <Image source={cenayangReveal} resizeMode="cover" style={styles.figure} />
            <LinearGradient
              colors={['rgba(232,208,144,0.10)', 'rgba(232,208,144,0)', 'rgba(10,10,20,0.28)']}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </View>

        <View style={[styles.copy, desktop && styles.copyDesktop]}>
          <Text style={styles.status}>membaca bintangmu . . .</Text>
          <View style={styles.divider} />
          <Text style={[styles.title, desktop && styles.titleDesktop]}>Takdirmu Sedang Terungkap</Text>
          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotMid]} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>

      <View style={styles.ctaWrap}>
        <GoldButton onPress={continueToResult} disabled={pressed} style={styles.ctaButton}>
          TEKAN UNTUK LANJUT
        </GoldButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.bgPrimary,
  },
  sky: {
    ...StyleSheet.absoluteFillObject,
  },
  purpleAura: {
    position: 'absolute',
    left: '-12%',
    top: '8%',
    width: '124%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(120,70,220,0.22)',
    shadowColor: '#8b54d8',
    shadowOpacity: 0.8,
    shadowRadius: 80,
  },
  purpleAuraDesktop: {
    left: '8%',
    top: '13%',
    width: '54%',
  },
  goldBloom: {
    position: 'absolute',
    left: '24%',
    bottom: '-16%',
    width: '58%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(200,120,48,0.14)',
    shadowColor: colors.gold,
    shadowOpacity: 0.55,
    shadowRadius: 70,
  },
  star: {
    position: 'absolute',
    borderRadius: 99,
    backgroundColor: colors.textPrimary,
    shadowColor: colors.goldHi,
    shadowOpacity: 0.55,
    shadowRadius: 5,
  },
  ray: {
    position: 'absolute',
    left: '50%',
    top: '58%',
    width: 6,
    height: 540,
    borderRadius: 999,
    backgroundColor: 'rgba(232,208,144,0.10)',
    shadowColor: colors.goldHi,
    shadowOpacity: 0.34,
    shadowRadius: 18,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 126,
  },
  stageTablet: {
    justifyContent: 'center',
    paddingBottom: 142,
  },
  stageDesktop: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 60,
    paddingHorizontal: 56,
    paddingBottom: 0,
  },
  figureWrap: {
    width: '94%',
    maxWidth: 380,
    aspectRatio: 9 / 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  figureWrapTablet: {
    width: '60%',
    maxWidth: 430,
  },
  figureWrapDesktop: {
    width: '38%',
    maxWidth: 540,
    marginBottom: 0,
  },
  figureGlow: {
    position: 'absolute',
    width: '110%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(130,80,220,0.22)',
    shadowColor: '#8b54d8',
    shadowOpacity: 0.9,
    shadowRadius: 52,
  },
  scrollGlow: {
    position: 'absolute',
    left: '48%',
    top: '38%',
    width: '46%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(232,208,144,0.24)',
    shadowColor: colors.goldHi,
    shadowOpacity: 0.95,
    shadowRadius: 36,
  },
  figureCard: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(232,208,144,0.44)',
    backgroundColor: '#100b1b',
    shadowColor: '#000',
    shadowOpacity: 0.72,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
  },
  figureCardDesktop: {
    borderRadius: 12,
  },
  figure: {
    width: '100%',
    height: '100%',
  },
  copy: {
    alignItems: 'center',
    marginTop: 2,
  },
  copyDesktop: {
    alignItems: 'flex-start',
    maxWidth: 480,
    marginTop: 0,
  },
  status: {
    color: colors.goldHi,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 4,
    lineHeight: 18,
    textTransform: 'uppercase',
  },
  divider: {
    width: 154,
    height: 1,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(232,208,144,0.42)',
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.displayBold,
    fontSize: 31,
    letterSpacing: 1.5,
    lineHeight: 38,
    textAlign: 'center',
    textShadowColor: 'rgba(200,160,48,0.24)',
    textShadowRadius: 24,
  },
  titleDesktop: {
    fontSize: 52,
    lineHeight: 59,
    textAlign: 'left',
  },
  dots: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 22,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: colors.gold,
    opacity: 0.56,
  },
  dotMid: {
    opacity: 1,
    shadowColor: colors.gold,
    shadowOpacity: 0.85,
    shadowRadius: 10,
  },
  ctaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 26,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  ctaButton: {
    maxWidth: 360,
    borderRadius: radii.lg,
  },
});
