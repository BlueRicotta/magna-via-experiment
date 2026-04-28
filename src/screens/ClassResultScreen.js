import { useMemo } from 'react';
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
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

import { GoldButton } from '../components/GoldButton';
import { colors, fonts, radii } from '../theme/tokens';
import { dimensionMeta, dimensions, resultFromScores } from '../data/results';

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

function makeStars(count) {
  return Array.from({ length: count }, (_, index) => {
    const seed = index * 7919 + 17;
    return {
      id: index,
      left: `${(seed * 13) % 100}%`,
      top: `${(seed * 31) % 100}%`,
      size: 0.7 + (seed % 6) * 0.18,
      opacity: 0.18 + (seed % 8) * 0.045,
    };
  });
}

function point(cx, cy, radius, index, value = 1) {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / dimensions.length;
  return [cx + Math.cos(angle) * radius * value, cy + Math.sin(angle) * radius * value];
}

function HexRadar({ scores, color, size }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.33;
  const rings = [0.25, 0.5, 0.75, 1];
  const data = dimensions.map((dim, index) => point(cx, cy, radius, index, scores[dim] || 0));
  const outer = dimensions.map((_, index) => point(cx, cy, radius, index));

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings.map((ring) => {
        const pts = dimensions.map((_, index) => point(cx, cy, radius, index, ring));
        return (
          <Polygon
            key={ring}
            points={pts.map((p) => p.join(',')).join(' ')}
            fill="none"
            stroke="rgba(232,224,208,0.14)"
            strokeWidth={ring === 1 ? 1 : 0.5}
          />
        );
      })}
      {outer.map(([x, y], index) => (
        <Line key={dimensions[index]} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(232,224,208,0.10)" strokeWidth="0.6" />
      ))}
      <Polygon
        points={data.map((p) => p.join(',')).join(' ')}
        fill={color}
        fillOpacity="0.22"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {data.map(([x, y], index) => (
        <Circle key={dimensions[index]} cx={x} cy={y} r="3.2" fill={color} stroke="#080812" strokeWidth="1" />
      ))}
      {dimensions.map((dim, index) => {
        const [x, y] = point(cx, cy, radius * 1.23, index);
        return (
          <SvgText
            key={dim}
            x={x}
            y={y + 4}
            textAnchor="middle"
            fill={dimensionMeta[dim].color}
            fontSize="12"
            fontFamily="CinzelBold"
          >
            {dim}
          </SvgText>
        );
      })}
    </Svg>
  );
}

function DimensionPill({ dim, value, active }) {
  const meta = dimensionMeta[dim];
  return (
    <View style={[styles.dimensionPill, active && { borderColor: meta.color, backgroundColor: `${meta.color}1F` }]}>
      <Text style={[styles.dimensionKey, { color: meta.color }]}>{dim}</Text>
      <View style={styles.dimensionTextWrap}>
        <Text style={styles.dimensionName}>{meta.name}</Text>
        <View style={styles.meterTrack}>
          <View style={[styles.meterFill, { width: `${Math.max(5, value * 100)}%`, backgroundColor: meta.color }]} />
        </View>
      </View>
    </View>
  );
}

export function ClassResultScreen({ scores = {}, onBack, onChat, onRestart }) {
  const { width } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);
  const desktop = breakpoint === 'desktop';
  const result = useMemo(() => resultFromScores(scores), [scores]);
  const { klass, normalized, topDimensions, dominantLabel } = result;
  const stars = useMemo(() => makeStars(desktop ? 70 : 48), [desktop]);
  const radarSize = desktop ? 284 : breakpoint === 'tablet' ? 244 : 224;

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#0a0a18', '#07070f', colors.bgPrimary]}
        locations={[0, 0.58, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.atmosphere}>
        <View style={[styles.classAura, { backgroundColor: klass.color, shadowColor: klass.color }]} />
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
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.topBar, desktop && styles.topBarDesktop]}>
          <BackButton onPress={onBack} />
          <Text style={styles.step}>STEP 08 - TAKDIRMU</Text>
          <View style={styles.topSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.body,
            desktop && styles.bodyDesktop,
          ]}
        >
          <View style={[styles.portraitColumn, desktop && styles.portraitColumnDesktop]}>
            <View style={[styles.portraitWrap, desktop && styles.portraitWrapDesktop]}>
              <View style={[styles.portraitAura, { backgroundColor: klass.color, shadowColor: klass.color }]} />
              <Image source={klass.image} resizeMode="cover" style={styles.portrait} />
              <View pointerEvents="none" style={[styles.portraitFrame, { borderColor: klass.color }]} />
            </View>
            <View style={styles.nameBlock}>
              <Text style={styles.eyebrow}>Bintang Telah Berbicara</Text>
              <Text style={[styles.title, desktop && styles.titleDesktop]}>{klass.name}</Text>
              <Text style={[styles.flavor, { textShadowColor: klass.glow }]}>"{klass.flavor}"</Text>
            </View>
          </View>

          <View style={[styles.contentColumn, desktop && styles.contentColumnDesktop]}>
            <View style={[styles.panel, { borderColor: `${klass.color}8A` }]}>
              <Text style={styles.panelLabel}>Profil RIASEC</Text>
              <View style={styles.radarWrap}>
                <HexRadar scores={normalized} color={klass.color} size={radarSize} />
              </View>
              <View style={styles.dimensions}>
                {dimensions.map((dim) => (
                  <DimensionPill
                    key={dim}
                    dim={dim}
                    value={normalized[dim] || 0}
                    active={topDimensions.slice(0, 2).includes(dim)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelLabel}>Dimensi Dominan</Text>
              <Text style={[styles.dominant, { color: klass.color }]}>{dominantLabel}</Text>
              <Text style={styles.summary}>{klass.summary}</Text>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelLabel}>Jurusan Rekomendasi</Text>
              <View style={styles.majors}>
                {klass.majors.slice(0, 5).map((major) => (
                  <View key={major} style={styles.majorPill}>
                    <Text style={styles.majorText}>{major}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.panelLabelSmall}>Kekuatanmu</Text>
              <View style={styles.strengths}>
                {klass.strengths.map((strength) => (
                  <Text key={strength} style={styles.strengthText}>+ {strength}</Text>
                ))}
              </View>
            </View>

            <View style={styles.actions}>
              <GoldButton onPress={onChat} style={styles.chatButton}>
                KONSULTASI DENGAN CENAYANG
              </GoldButton>
              <Pressable onPress={onRestart} style={({ pressed }) => [styles.restartButton, pressed && styles.restartPressed]}>
                <Text style={styles.restartText}>ULANGI PERJALANAN</Text>
              </Pressable>
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
  safeArea: {
    flex: 1,
  },
  atmosphere: {
    ...StyleSheet.absoluteFillObject,
  },
  classAura: {
    position: 'absolute',
    left: '10%',
    top: '15%',
    width: '78%',
    aspectRatio: 1,
    borderRadius: 999,
    opacity: 0.18,
    shadowOpacity: 0.9,
    shadowRadius: 76,
  },
  star: {
    position: 'absolute',
    borderRadius: 99,
    backgroundColor: colors.textPrimary,
    shadowColor: colors.goldHi,
    shadowOpacity: 0.45,
    shadowRadius: 4,
  },
  topBar: {
    height: 66,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 10,
  },
  topBarDesktop: {
    height: 82,
    paddingHorizontal: 36,
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
  body: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 42,
    gap: 24,
  },
  bodyDesktop: {
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 54,
    paddingHorizontal: 56,
    paddingBottom: 54,
  },
  portraitColumn: {
    alignItems: 'center',
    gap: 16,
  },
  portraitColumnDesktop: {
    flex: 0.9,
    justifyContent: 'flex-start',
  },
  portraitWrap: {
    width: '86%',
    maxWidth: 340,
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#120d1d',
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 18 },
  },
  portraitWrapDesktop: {
    width: '100%',
    maxWidth: 450,
  },
  portraitAura: {
    position: 'absolute',
    left: -30,
    right: -30,
    top: -30,
    bottom: -30,
    opacity: 0.26,
    shadowOpacity: 0.9,
    shadowRadius: 50,
  },
  portrait: {
    width: '100%',
    height: '100%',
    objectPosition: '50% 26%',
  },
  portraitFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderRadius: 20,
  },
  nameBlock: {
    maxWidth: 480,
    alignItems: 'center',
    gap: 8,
  },
  eyebrow: {
    color: colors.gold,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.displayBold,
    fontSize: 30,
    letterSpacing: 1.1,
    lineHeight: 36,
    textAlign: 'center',
  },
  titleDesktop: {
    fontSize: 44,
    lineHeight: 50,
  },
  flavor: {
    color: colors.textSecondary,
    fontFamily: fonts.oracleItalic,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    textShadowRadius: 18,
  },
  contentColumn: {
    gap: 14,
  },
  contentColumnDesktop: {
    flex: 1,
    maxWidth: 560,
    paddingTop: 8,
  },
  panel: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(232,208,144,0.14)',
    backgroundColor: 'rgba(20,16,34,0.82)',
  },
  panelLabel: {
    color: colors.gold,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  panelLabelSmall: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  radarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
  },
  dimensions: {
    gap: 8,
    marginTop: 8,
  },
  dimensionPill: {
    minHeight: 44,
    borderRadius: 13,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: 'rgba(10,10,20,0.54)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  dimensionKey: {
    width: 22,
    fontFamily: fonts.displayBold,
    fontSize: 15,
    textAlign: 'center',
  },
  dimensionTextWrap: {
    flex: 1,
    gap: 6,
  },
  dimensionName: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  meterTrack: {
    height: 4,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(232,224,208,0.10)',
  },
  meterFill: {
    height: '100%',
    borderRadius: 999,
  },
  dominant: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    letterSpacing: 0.8,
    lineHeight: 28,
  },
  summary: {
    marginTop: 8,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  majors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  majorPill: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 0.5,
    borderColor: 'rgba(232,208,144,0.24)',
    backgroundColor: 'rgba(232,208,144,0.07)',
  },
  majorText: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  strengths: {
    gap: 5,
  },
  strengthText: {
    color: colors.textPrimary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  actions: {
    gap: 10,
    alignItems: 'center',
  },
  chatButton: {
    maxWidth: 430,
  },
  restartButton: {
    height: 44,
    paddingHorizontal: 22,
    borderRadius: radii.pill,
    borderWidth: 0.5,
    borderColor: 'rgba(232,208,144,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartPressed: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(200,160,48,0.08)',
  },
  restartText: {
    color: colors.textSecondary,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2,
  },
});
