import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
  LinearGradient as SvgLinearGradient,
} from 'react-native-svg';

import { GoldButton } from '../components/GoldButton';
import { colors, fonts } from '../theme/tokens';

const arcadia = require('../../assets/images/backgrounds/arcadia-splash.webp');

function getBreakpoint(width) {
  if (width >= 960) return 'desktop';
  if (width >= 600) return 'tablet';
  return 'mobile';
}

function seededStars(count) {
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    size: 0.8 + rand() * 1.8,
    opacity: 0.3 + rand() * 0.55,
  }));
}

function SplashBackdrop({ breakpoint }) {
  const stars = useMemo(() => {
    const count = breakpoint === 'desktop' ? 55 : breakpoint === 'tablet' ? 40 : 30;
    return seededStars(count);
  }, [breakpoint]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient id="night" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0a0a18" />
            <Stop offset="0.5" stopColor="#0a0a14" />
            <Stop offset="1" stopColor="#1a0c08" />
          </SvgLinearGradient>
          <RadialGradient id="purpleA" cx="30%" cy="18%" rx="70%" ry="45%">
            <Stop offset="0" stopColor="#3c286e" stopOpacity="0.55" />
            <Stop offset="1" stopColor="#3c286e" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="purpleB" cx="78%" cy="30%" rx="55%" ry="35%">
            <Stop offset="0" stopColor="#281950" stopOpacity="0.5" />
            <Stop offset="1" stopColor="#281950" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="ember" cx="50%" cy="100%" rx="90%" ry="40%">
            <Stop offset="0" stopColor="#8c3c1e" stopOpacity="0.32" />
            <Stop offset="1" stopColor="#8c3c1e" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#night)" />
        <Rect width="100%" height="100%" fill="url(#purpleA)" />
        <Rect width="100%" height="100%" fill="url(#purpleB)" />
        <Rect width="100%" height="100%" fill="url(#ember)" />
      </Svg>

      {stars.map((star, index) => (
        <View
          key={index}
          style={[
            styles.star,
            {
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

function PulseRing({ delay }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: 2600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [delay, progress]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulseRing,
        {
          opacity: progress.interpolate({
            inputRange: [0, 0.05, 0.7, 1],
            outputRange: [0, 0.7, 0, 0],
          }),
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.12],
              }),
            },
          ],
        },
      ]}
    />
  );
}

function Astrolabe({ size, onLaunch, launching }) {
  const cx = size / 2;
  const cy = size / 2;
  const outer = 0.49 * size;
  const inner = 0.36 * size;
  const disc = 0.34 * size;
  const fade = useRef(new Animated.Value(1)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: launching ? 0 : 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fade, launching]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 52000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();
    return () => animation.stop();
  }, [spin]);

  const cardinals = [
    { angle: -90, label: 'IGNIS' },
    { angle: 0, label: 'TERRA' },
    { angle: 90, label: 'VENTUS' },
    { angle: 180, label: 'AQUAE' },
  ];

  return (
    <Animated.View
      style={[
        styles.astrolabe,
        {
          width: size,
          height: size,
          opacity: fade,
          transform: [
            {
              scale: fade.interpolate({
                inputRange: [0, 1],
                outputRange: [0.94, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.astrolabeGlow,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              {
                rotate: spin.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="brass" cx="35%" cy="30%" r="80%">
              <Stop offset="0" stopColor="#f0d68a" />
              <Stop offset="0.35" stopColor={colors.gold} />
              <Stop offset="0.7" stopColor="#7a5e1c" />
              <Stop offset="1" stopColor="#3a2a08" />
            </RadialGradient>
            <RadialGradient id="discGlow" cx="50%" cy="50%" r="55%">
              <Stop offset="0" stopColor={colors.goldHi} stopOpacity="0.18" />
              <Stop offset="0.6" stopColor={colors.gold} stopOpacity="0.06" />
              <Stop offset="1" stopColor={colors.bgPrimary} stopOpacity="0" />
            </RadialGradient>
          </Defs>

          <Circle cx={cx} cy={cy} r={outer + 18} fill="url(#discGlow)" />
          <Circle cx={cx} cy={cy} r={outer} fill="none" stroke="url(#brass)" strokeWidth="1.4" opacity="0.85" />
          <Circle cx={cx} cy={cy} r={outer - 8} fill="none" stroke={colors.goldLo} strokeWidth="0.5" opacity="0.55" />

          {Array.from({ length: 24 }, (_, index) => {
            const angle = (index / 24) * Math.PI * 2 - Math.PI / 2;
            const x1 = cx + Math.cos(angle) * (outer - 1);
            const y1 = cy + Math.sin(angle) * (outer - 1);
            const x2 = cx + Math.cos(angle) * (outer - 9);
            const y2 = cy + Math.sin(angle) * (outer - 9);
            return (
              <Line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={colors.gold}
                strokeWidth="0.7"
                opacity="0.7"
                strokeLinecap="round"
              />
            );
          })}

          {cardinals.map((cardinal) => {
            const angle = (cardinal.angle * Math.PI) / 180;
            const radius = outer - 22;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            return (
              <SvgText
                key={cardinal.label}
                x={x}
                y={y}
                fontFamily={fonts.display}
                fontSize="9"
                letterSpacing="3"
                fill={colors.gold}
                opacity="0.8"
                textAnchor="middle"
                alignmentBaseline="middle"
                transform={`rotate(${cardinal.angle + 90}, ${x}, ${y})`}
              >
                {cardinal.label}
              </SvgText>
            );
          })}

          <Circle cx={cx} cy={cy} r={inner + 3} fill="none" stroke="url(#brass)" strokeWidth="1.1" opacity="0.85" />
          <Circle
            cx={cx}
            cy={cy}
            r={inner - 3}
            fill="none"
            stroke={colors.gold}
            strokeWidth="0.4"
            strokeDasharray="2 4"
            opacity="0.45"
          />

          {Array.from({ length: 8 }, (_, index) => {
            const angle = (index / 8) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(angle) * inner;
            const y = cy + Math.sin(angle) * inner;
            return (
              <Path
                key={index}
                transform={`translate(${x}, ${y})`}
                d="M0 -3 L1 -1 L3 0 L1 1 L0 3 L-1 1 L-3 0 L-1 -1 Z"
                fill={colors.goldHi}
                opacity="0.85"
              />
            );
          })}

          <Circle cx={cx} cy={cy} r={disc} fill="none" stroke={colors.gold} strokeWidth="0.8" opacity="0.7" />
          <Circle cx={cx} cy={cy} r={disc - 4} fill="none" stroke="#3a2a08" strokeWidth="0.4" opacity="0.5" />
        </Svg>
      </Animated.View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mulai perjalanan, buka peta bintang"
        disabled={launching}
        onPress={onLaunch}
        style={({ pressed }) => [
          styles.discButton,
          {
            width: disc * 2,
            height: disc * 2,
            left: cx - disc,
            top: cy - disc,
            borderRadius: disc,
          },
          pressed && !launching && styles.discPressed,
        ]}
      >
        <Image
          source={arcadia}
          resizeMode="cover"
          style={[
            styles.discImage,
            {
              width: disc * 2,
              height: disc * 2,
            },
          ]}
        />
        <View style={styles.discShade} />
        <PulseRing delay={0} />
        <PulseRing delay={1300} />
      </Pressable>
    </Animated.View>
  );
}

export function SplashScreen({ onLaunch }) {
  const { width, height } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);
  const [launching, setLaunching] = useState(false);

  const discSize = useMemo(() => {
    if (breakpoint === 'desktop') return Math.min(460, height * 0.46);
    if (breakpoint === 'tablet') return Math.min(440, width * 0.58, height * 0.54);
    return Math.min(280, width - 72, height * 0.43);
  }, [breakpoint, height, width]);

  const handleLaunch = () => {
    if (launching) return;
    setLaunching(true);
    setTimeout(onLaunch, 600);
  };

  return (
    <View style={styles.screen}>
      <SplashBackdrop breakpoint={breakpoint} />

      <View style={[styles.content, breakpoint === 'desktop' && styles.contentDesktop]}>
        <View style={[styles.header, breakpoint !== 'desktop' && styles.headerCompact]}>
          <Text style={[styles.eyebrow, breakpoint !== 'desktop' && styles.eyebrowCompact]}>
            * Warrior's Journey *
          </Text>
          <Text style={[styles.wordmark, breakpoint !== 'desktop' && styles.wordmarkCompact]}>
            MAGNA VIA
          </Text>
          <Text style={[styles.tagline, breakpoint !== 'desktop' && styles.taglineCompact]}>
            Perjalanan menuju <Text style={styles.taglineEmphasis}>Kemenangan</Text> untuk jalanmu.
          </Text>
        </View>

        <View style={styles.astrolabeWrap}>
          <Astrolabe size={discSize} launching={launching} onLaunch={handleLaunch} />
          <Text style={styles.tapHint}>Tekan untuk Mulai</Text>
        </View>

        <View style={styles.ctaWrap}>
          <GoldButton onPress={handleLaunch} disabled={launching}>
            MULAI PERJALANAN
          </GoldButton>
        
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#050509',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 28,
  },
  contentDesktop: {
    gap: 34,
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    gap: 13,
    maxWidth: 720,
  },
  headerCompact: {
    gap: 7,
    maxWidth: 360,
  },
  eyebrow: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 3.4,
    textTransform: 'uppercase',
  },
  eyebrowCompact: {
    fontSize: 9,
    letterSpacing: 2.4,
  },
  wordmark: {
    color: colors.gold,
    fontFamily: fonts.displayBold,
    fontSize: 56,
    letterSpacing: 10,
    lineHeight: 62,
    textShadowColor: 'rgba(200,160,48,0.35)',
    textShadowRadius: 30,
  },
  wordmarkCompact: {
    fontSize: 36,
    letterSpacing: 6,
    lineHeight: 42,
    textShadowRadius: 22,
  },
  tagline: {
    color: colors.textSecondary,
    fontFamily: fonts.oracleItalic,
    fontSize: 18,
    letterSpacing: 0.3,
  },
  taglineCompact: {
    fontSize: 15,
  },
  taglineEmphasis: {
    color: colors.goldHi,
  },
  astrolabeWrap: {
    alignItems: 'center',
    gap: 12,
  },
  astrolabe: {
    overflow: 'visible',
  },
  astrolabeGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(200,160,48,0.04)',
    shadowColor: colors.gold,
    shadowOpacity: 0.22,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  discButton: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: colors.bgPrimary,
    borderWidth: 1,
    borderColor: 'rgba(200,160,48,0.4)',
    shadowColor: colors.gold,
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
  },
  discPressed: {
    transform: [{ scale: 0.98 }],
  },
  discImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    objectPosition: '50% 50%',
  },
  discShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,20,0.08)',
    borderRadius: 999,
  },
  pulseRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(232,208,144,0.7)',
  },
  tapHint: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 2.4,
    opacity: 0.75,
    textTransform: 'uppercase',
  },
  ctaWrap: {
    alignItems: 'center',
    gap: 14,
    width: '100%',
    maxWidth: 360,
  },
  footnote: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 2.2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  star: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.goldHi,
    shadowColor: colors.goldHi,
    shadowOpacity: 0.55,
    shadowRadius: 4,
  },
});
