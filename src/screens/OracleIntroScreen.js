import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { GoldButton } from '../components/GoldButton';
import { colors, fonts, radii } from '../theme/tokens';

const cenayangAvatar = require('../../assets/images/characters/cenayang-avatar.webp');

const scenes = [
  {
    id: 1,
    art: require('../../assets/images/misc/1.webp'),
    eyebrow: 'STEP I - ARCADIA',
    title: 'Sebuah kerajaan menanti.',
    dialogue:
      'Selamat datang, Pejuang. Inilah Arcadia, kerajaan kuno tempat setiap nasib ditenun di antara bintang. Lama sekali kami menanti kedatanganmu.',
  },
  {
    id: 2,
    art: require('../../assets/images/misc/2.webp'),
    eyebrow: 'STEP II - LANGIT',
    title: 'Bintang-bintang berbicara.',
    dialogue:
      'Setiap pelajar lahir di bawah salah satu dari empat unsur: api, air, tanah, atau angin. Bintangmu telah memilih. Kini saatnya kau mendengarkan.',
  },
  {
    id: 3,
    art: require('../../assets/images/misc/3.webp'),
    eyebrow: 'STEP III - PANGGILAN',
    title: 'Dengarkan dengan saksama.',
    dialogue:
      'Aku Cenayang, pembaca kode dan penjaga kunci langit. Akan kubacakan apa yang tertulis untukmu. Tapi pilihanmu tetap pilihanmu.',
  },
  {
    id: 4,
    art: require('../../assets/images/misc/4.webp'),
    eyebrow: 'STEP IV - GERBANG',
    title: 'Jalanmu terbentang.',
    dialogue:
      'Di balik gerbang ini ada kelas-kelas pejuang, penjaga, peneliti, penyembuh, dan banyak lagi. Salah satunya menunggumu. Maukah kau melangkah?',
  },
  {
    id: 5,
    art: require('../../assets/images/misc/5.webp'),
    eyebrow: 'STEP V - GULUNGAN',
    title: 'Mari kita mulai membaca.',
    dialogue:
      'Buka gulungan ini bersamaku. Beri tahu aku siapa dirimu, lalu kita biarkan bintang-bintang menuntun langkah pertamamu.',
  },
];

function getBreakpoint(width) {
  if (width >= 960) return 'desktop';
  if (width >= 600) return 'tablet';
  return 'mobile';
}

function IconButton({ label, align = 'left', onPress, children }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.navButton,
        align === 'right' && styles.navButtonRight,
        pressed && styles.navButtonPressed,
      ]}
    >
      {children}
      <Text style={styles.navButtonText}>{label}</Text>
    </Pressable>
  );
}

function ProgressTicks({ current, total }) {
  return (
    <View style={styles.progressPill} accessibilityRole="progressbar">
      {Array.from({ length: total }, (_, index) => {
        const isDone = index < current;
        const isActive = index === current;
        return (
          <View
            key={index}
            style={[
              styles.progressTick,
              isDone && styles.progressTickDone,
              isActive && styles.progressTickActive,
            ]}
          />
        );
      })}
    </View>
  );
}

function DialogueCard({ scene, isLast, onContinue, compact, disabled }) {
  return (
    <Animated.View style={[styles.dialogue, compact && styles.dialogueCompact]}>
      <View style={styles.dialogueCornerTop} />
      <View style={styles.dialogueCornerBottom} />

      <View style={styles.speakerRow}>
        <View style={styles.avatarWrap}>
          <Image source={cenayangAvatar} resizeMode="cover" style={styles.avatar} />
        </View>
        <View style={styles.speakerMeta}>
          <Text style={styles.speakerName}>Cenayang</Text>
          <Text style={styles.speakerRole}>Pembaca Kode</Text>
        </View>
        {!compact && <Text style={styles.sceneEyebrow}>{scene.eyebrow}</Text>}
      </View>

      <Text style={[styles.sceneTitle, compact && styles.sceneTitleCompact]}>{scene.title}</Text>
      <Text style={[styles.sceneDialogue, compact && styles.sceneDialogueCompact]}>
        <Text style={styles.quoteMark}>" </Text>
        {scene.dialogue}
      </Text>

      <View style={styles.dialogueFooter}>
        <GoldButton onPress={onContinue} disabled={disabled} style={styles.continueButton}>
          {isLast ? 'KE BIODATA' : 'TERUSKAN'}
        </GoldButton>
      </View>
    </Animated.View>
  );
}

export function OracleIntroScreen({ onBack, onDone }) {
  const { width } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);
  const compact = breakpoint === 'mobile';
  const desktop = breakpoint === 'desktop';
  const topAlignedArt = width >= 750;
  const [sceneIndex, setSceneIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(0)).current;
  const scene = scenes[sceneIndex];
  const isLast = sceneIndex === scenes.length - 1;

  useEffect(() => {
    imageScale.setValue(0);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(imageScale, {
          toValue: 1,
          duration: 7000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(imageScale, {
          toValue: 0,
          duration: 7000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [imageScale, sceneIndex]);

  const imageTransform = useMemo(
    () => [
      {
        scale: imageScale.interpolate({
          inputRange: [0, 1],
          outputRange: [1.02, 1.06],
        }),
      },
    ],
    [imageScale],
  );

  const changeScene = (nextIndex) => {
    setBusy(true);
    Animated.timing(imageOpacity, {
      toValue: 0.25,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setSceneIndex(nextIndex);
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setBusy(false));
    });
  };

  const handleContinue = () => {
    if (busy) return;
    if (isLast) {
      setBusy(true);
      setTimeout(onDone, 260);
      return;
    }
    changeScene(sceneIndex + 1);
  };

  const handleBack = () => {
    if (busy) return;
    if (sceneIndex === 0) {
      onBack();
      return;
    }
    changeScene(sceneIndex - 1);
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#0a0a18', colors.bgPrimary, '#1a0c10']}
        locations={[0, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.Image
        key={scene.id}
        source={scene.art}
        resizeMode="cover"
        style={[
          styles.sceneArt,
          topAlignedArt && styles.sceneArtTopAligned,
          desktop && styles.sceneArtDesktop,
          {
            opacity: imageOpacity,
            transform: imageTransform,
          },
        ]}
      />

      <LinearGradient
        colors={
          desktop
            ? ['rgba(10,10,20,0)', 'rgba(10,10,20,0.35)', 'rgba(10,10,20,0.92)']
            : ['rgba(10,10,20,0)', 'rgba(10,10,20,0.55)', 'rgba(10,10,20,0.96)']
        }
        start={desktop ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 }}
        end={desktop ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={styles.vignette} />

      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.topBar, desktop && styles.topBarDesktop]}>
          <IconButton label="Kembali" onPress={handleBack}>
            <Text style={styles.navIcon}>{'<'}</Text>
          </IconButton>

          <ProgressTicks current={sceneIndex} total={scenes.length} />

          <IconButton label="Lewati" align="right" onPress={onDone}>
            <Text style={styles.navIcon}>{'>>'}</Text>
          </IconButton>
        </View>

        <View style={[styles.stage, desktop && styles.stageDesktop]}>
          <View style={[styles.dialogueWrap, desktop && styles.dialogueWrapDesktop]}>
            <DialogueCard
              scene={scene}
              compact={compact}
              isLast={isLast}
              disabled={busy}
              onContinue={handleContinue}
            />
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
  sceneArt: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    objectPosition: '50% 30%',
  },
  sceneArtTopAligned: {
    objectPosition: '50% 0%',
  },
  sceneArtDesktop: {
    objectPosition: '50% 0%',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 0 },
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    height: 68,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 10,
  },
  topBarDesktop: {
    height: 88,
    paddingHorizontal: 36,
  },
  navButton: {
    minWidth: 88,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: 'rgba(10,10,20,0.62)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 7,
  },
  navButtonRight: {
    justifyContent: 'flex-end',
  },
  navButtonPressed: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(200,160,48,0.09)',
  },
  navIcon: {
    color: colors.textSecondary,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  navButtonText: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  progressPill: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: 'rgba(10,10,20,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  progressTick: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(200,160,48,0.18)',
  },
  progressTickDone: {
    backgroundColor: colors.gold,
  },
  progressTickActive: {
    backgroundColor: colors.goldHi,
    shadowColor: colors.goldHi,
    shadowOpacity: 0.75,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  stage: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  stageDesktop: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingBottom: 48,
  },
  dialogueWrap: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  dialogueWrapDesktop: {
    width: 460,
    maxWidth: 460,
    alignSelf: 'auto',
  },
  dialogue: {
    position: 'relative',
    padding: 22,
    borderRadius: 22,
    borderWidth: 0.5,
    borderColor: 'rgba(200,160,48,0.45)',
    backgroundColor: 'rgba(22,17,36,0.94)',
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
  },
  dialogueCompact: {
    padding: 18,
    borderRadius: 18,
    gap: 12,
  },
  dialogueCornerTop: {
    position: 'absolute',
    left: 7,
    top: 7,
    width: 15,
    height: 15,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: colors.gold,
    opacity: 0.7,
  },
  dialogueCornerBottom: {
    position: 'absolute',
    right: 7,
    bottom: 7,
    width: 15,
    height: 15,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gold,
    opacity: 0.7,
  },
  speakerRow: {
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(200,160,48,0.22)',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.gold,
    backgroundColor: colors.bgCard,
    shadowColor: colors.gold,
    shadowOpacity: 0.42,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  speakerMeta: {
    flex: 1,
    gap: 2,
  },
  speakerName: {
    color: colors.gold,
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  speakerRole: {
    color: colors.textMuted,
    fontFamily: fonts.oracleItalic,
    fontSize: 12,
  },
  sceneEyebrow: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 2,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  sceneTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 25,
    fontWeight: '600',
    letterSpacing: 1,
    lineHeight: 31,
  },
  sceneTitleCompact: {
    fontSize: 18,
    lineHeight: 23,
  },
  sceneDialogue: {
    color: colors.textSecondary,
    fontFamily: fonts.oracleItalic,
    fontSize: 18,
    lineHeight: 29,
  },
  sceneDialogueCompact: {
    fontSize: 16,
    lineHeight: 25,
  },
  quoteMark: {
    color: colors.gold,
    fontFamily: fonts.oracle,
    fontSize: 28,
  },
  dialogueFooter: {
    alignItems: 'flex-end',
    marginTop: 2,
  },
  continueButton: {
    height: 52,
    maxWidth: '100%',
  },
});
