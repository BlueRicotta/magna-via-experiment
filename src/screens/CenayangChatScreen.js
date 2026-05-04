import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { classCatalog, resultFromScores } from '../data/results';
import { sendChatMessage } from '../services/api';
import { colors, fonts, radii } from '../theme/tokens';

const cenayangAvatar = require('../../assets/images/characters/cenayang-avatar.webp');
const CHAT_MESSAGE_LIMIT = 100;

function getBreakpoint(width) {
  if (width >= 960) return 'desktop';
  if (width >= 600) return 'tablet';
  return 'mobile';
}

function nowTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function seedMessages(klass) {
  return [
    {
      id: 'm1',
      from: 'oracle',
      text: `Selamat atas perjalananmu, ${klass.title}. Aku melihat resonansi ${klass.name} bersinar di gulunganmu.`,
      time: '10:24',
    },
  ];
}

function BackButton({ onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
    >
      <Text style={styles.backIcon}>{'<'}</Text>
    </Pressable>
  );
}

function SendIcon({ disabled }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Path d="M2 14 L14 8 L2 2 L4.4 8 Z" fill={disabled ? colors.textDisabled : colors.textOnInvert} />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <Path d="M6 3.2 V6 L8 7.2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  );
}

function MessageBubble({ message, klass }) {
  const oracle = message.from === 'oracle';
  return (
    <View style={[styles.messageRow, oracle ? styles.oracleRow : styles.userRow]}>
      {oracle && (
        <Image source={cenayangAvatar} resizeMode="cover" style={styles.messageAvatar} />
      )}
      <View style={[styles.bubbleWrap, oracle ? styles.oracleBubbleWrap : styles.userBubbleWrap]}>
        <View
          style={[
            styles.bubble,
            oracle ? styles.oracleBubble : styles.userBubble,
            oracle && { borderColor: `${klass.color}66` },
          ]}
        >
          <Text style={[styles.bubbleText, oracle ? styles.oracleBubbleText : styles.userBubbleText]}>
            {message.text}
          </Text>
        </View>
        <Text style={[styles.time, !oracle && styles.timeUser]}>{message.time}</Text>
      </View>
    </View>
  );
}

function TypingBubble({ klass }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const dots = [0, 1, 2].map((index) => ({
    opacity: pulse.interpolate({
      inputRange: [0, 0.2 + index * 0.18, 0.55 + index * 0.15, 1],
      outputRange: [0.28, 0.28, 1, 0.28],
    }),
    translateY: pulse.interpolate({
      inputRange: [0, 0.2 + index * 0.18, 0.55 + index * 0.15, 1],
      outputRange: [0, 0, -4, 0],
    }),
  }));

  return (
    <View style={[styles.messageRow, styles.oracleRow]}>
      <Image source={cenayangAvatar} resizeMode="cover" style={styles.messageAvatar} />
      <View style={[styles.bubbleWrap, styles.oracleBubbleWrap]}>
        <View style={[styles.bubble, styles.oracleBubble, styles.typingBubble, { borderColor: `${klass.color}88` }]}>
          <View style={[styles.typingSigil, { backgroundColor: `${klass.color}22`, borderColor: `${klass.color}66` }]}>
            <Text style={[styles.typingSigilText, { color: klass.color }]}>*</Text>
          </View>
          <Text style={styles.typingText}>Cenayang membaca gulungan</Text>
          <View style={styles.typingDots}>
            {dots.map((dot, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.typingDot,
                  {
                    backgroundColor: klass.color,
                    opacity: dot.opacity,
                    transform: [{ translateY: dot.translateY }],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function ClassRail({ klass }) {
  return (
    <View style={styles.rail}>
      <View style={[styles.railPortraitWrap, { borderColor: klass.color, shadowColor: klass.color }]}>
        <Image source={klass.image} resizeMode="cover" style={styles.railPortrait} />
      </View>
      <Text style={styles.railEyebrow}>Kelasmu</Text>
      <Text style={styles.railTitle}>{klass.name}</Text>
      <Text style={[styles.railDominant, { color: klass.color }]}>{klass.dominant.join(' - ')}</Text>
      <View style={styles.railMajors}>
        {klass.majors.slice(0, 5).map((major) => (
          <View key={major} style={styles.railMajor}>
            <Text style={styles.railMajorText}>{major}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.railTip}>Cenayang memakai hasil dan pilihanmu sebagai konteks konsultasi singkat.</Text>
    </View>
  );
}

export function CenayangChatScreen({ assessmentId, scores = {}, classId, onBack }) {
  const { width } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);
  const desktop = breakpoint === 'desktop';
  const klass = classCatalog[classId] || resultFromScores(scores).klass;
  const [messages, setMessages] = useState(() => seedMessages(klass));
  const [draft, setDraft] = useState('');
  const [sessionsLeft, setSessionsLeft] = useState(5);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const exhausted = sessionsLeft === 0;
  const showWarning = sessionsLeft <= 2;

  const send = async () => {
    const text = draft.trim();
    if (!text || exhausted || sending) return;
    const time = nowTime();
    const userMessage = { id: `u-${Date.now()}`, from: 'user', text, time };
    setDraft('');
    setSending(true);
    setMessages((current) => [...current, userMessage]);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd?.({ animated: true }));

    try {
      const response = await sendChatMessage({ assessmentId, message: text });
      setSessionsLeft(Number.isFinite(response.repliesLeft) ? response.repliesLeft : Math.max(0, sessionsLeft - 1));
      setMessages((current) => [
        ...current,
        {
          id: `o-${Date.now()}`,
          from: 'oracle',
          text: response.reply,
          time: nowTime(),
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `e-${Date.now()}`,
          from: 'oracle',
          text: error?.message || 'Cenayang belum bisa menjawab saat ini. Coba lagi sebentar.',
          time: nowTime(),
        },
      ]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd?.({ animated: true }));
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.topBar, desktop && styles.topBarDesktop]}>
          <BackButton onPress={onBack} />
          <View style={styles.identity}>
            <View style={[styles.avatarWrap, { shadowColor: klass.color }]}>
              <Image source={cenayangAvatar} resizeMode="cover" style={styles.avatar} />
            </View>
            <View style={styles.identityText}>
              <Text style={styles.name}>Cenayang</Text>
              <Text style={styles.presence}>Siap mendengarkan ceritamu</Text>
            </View>
          </View>
          <View style={[styles.sessionPill, showWarning && styles.sessionPillLow]}>
            <ClockIcon />
            <Text style={styles.sessionText}><Text style={styles.sessionStrong}>{sessionsLeft}</Text> sesi</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <View style={[styles.body, desktop && styles.bodyDesktop]}>
            <View style={[styles.chatPanel, desktop && styles.chatPanelDesktop]}>
              <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.messages}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd?.({ animated: true })}
              >
                <View style={styles.dateDivider}>
                  <View style={styles.dateLine} />
                  <Text style={styles.dateLabel}>Hari ini</Text>
                  <View style={styles.dateLine} />
                </View>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} klass={klass} />
                ))}
                {sending && <TypingBubble klass={klass} />}
              </ScrollView>

              <View style={styles.footer}>
                {showWarning && (
                  <View style={[styles.warning, exhausted && styles.warningExhausted]}>
                    <Text style={styles.warningText}>
                      {exhausted ? 'Sesi konsultasi habis.' : `Sesi konsultasimu hampir habis - ${sessionsLeft} tersisa.`}
                    </Text>
                  </View>
                )}
                <View style={styles.inputShell}>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    maxLength={CHAT_MESSAGE_LIMIT}
                    placeholder={exhausted ? 'Sesi konsultasi habis' : sending ? 'Cenayang membaca gulungan...' : 'Tanyakan sesuatu...'}
                    placeholderTextColor={colors.textMuted}
                    editable={!exhausted && !sending}
                    onSubmitEditing={send}
                    returnKeyType="send"
                    style={styles.input}
                  />
                  {draft.length >= 80 && (
                    <Text style={styles.inputCount}>{draft.length}/{CHAT_MESSAGE_LIMIT}</Text>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    onPress={send}
                    disabled={!draft.trim() || exhausted || sending}
                    style={({ pressed }) => [
                      styles.sendButton,
                      (!draft.trim() || exhausted || sending) && styles.sendButtonDisabled,
                      pressed && styles.sendButtonPressed,
                    ]}
                  >
                    <SendIcon disabled={!draft.trim() || exhausted || sending} />
                  </Pressable>
                </View>
              </View>
            </View>

            {desktop && <ClassRail klass={klass} />}
          </View>
        </KeyboardAvoidingView>
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
    height: 68,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(232,208,144,0.08)',
    backgroundColor: 'rgba(20,14,30,0.95)',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  topBarDesktop: {
    height: 78,
    paddingHorizontal: 28,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 0.5,
    borderColor: 'rgba(232,208,144,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  backButtonPressed: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(200,160,48,0.08)',
  },
  backIcon: {
    color: colors.textSecondary,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  identity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    shadowOpacity: 0.55,
    shadowRadius: 14,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: '#1a1424',
  },
  identityText: {
    minWidth: 0,
  },
  name: {
    color: colors.textPrimary,
    fontFamily: fonts.displayBold,
    fontSize: 16,
    letterSpacing: 0.8,
  },
  presence: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    marginTop: 2,
  },
  sessionPill: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 0.5,
    borderColor: 'rgba(160,110,220,0.42)',
    backgroundColor: 'rgba(120,70,200,0.14)',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  sessionPillLow: {
    borderColor: 'rgba(220,110,100,0.55)',
    backgroundColor: 'rgba(220,90,80,0.12)',
  },
  sessionText: {
    color: '#d4baf2',
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  sessionStrong: {
    color: '#f0ddff',
    fontFamily: fonts.bodyBold,
  },
  keyboard: {
    flex: 1,
    minHeight: 0,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  bodyDesktop: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
  },
  chatPanel: {
    flex: 1,
    minHeight: 0,
  },
  chatPanelDesktop: {
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(232,208,144,0.08)',
  },
  messages: {
    padding: 14,
    paddingBottom: 18,
    gap: 14,
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(232,224,208,0.08)',
  },
  dateLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  oracleRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: colors.gold,
    marginBottom: 18,
  },
  bubbleWrap: {
    maxWidth: '82%',
    gap: 4,
  },
  oracleBubbleWrap: {
    alignItems: 'flex-start',
  },
  userBubbleWrap: {
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 0.5,
  },
  oracleBubble: {
    borderBottomLeftRadius: 5,
    backgroundColor: 'rgba(25,20,38,0.96)',
  },
  userBubble: {
    borderBottomRightRadius: 5,
    borderColor: 'rgba(232,208,144,0.36)',
    backgroundColor: 'rgba(200,160,48,0.18)',
  },
  bubbleText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  oracleBubbleText: {
    color: colors.textSecondary,
  },
  userBubbleText: {
    color: colors.textPrimary,
  },
  typingBubble: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingRight: 16,
    backgroundColor: 'rgba(28,22,42,0.98)',
    shadowColor: '#c8a030',
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  typingSigil: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingSigilText: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    lineHeight: 20,
  },
  typingText: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 2,
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  time: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    marginLeft: 4,
  },
  timeUser: {
    marginRight: 4,
  },
  footer: {
    padding: 12,
    gap: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(232,208,144,0.08)',
    backgroundColor: 'rgba(10,10,20,0.94)',
  },
  warning: {
    minHeight: 34,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(220,110,100,0.34)',
    backgroundColor: 'rgba(220,90,80,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  warningExhausted: {
    borderColor: 'rgba(220,110,100,0.55)',
  },
  warningText: {
    color: '#f0c8c0',
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    textAlign: 'center',
  },
  inputShell: {
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 0.5,
    borderColor: 'rgba(232,208,144,0.16)',
    backgroundColor: 'rgba(20,16,34,0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 16,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    minHeight: 48,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  inputCount: {
    minWidth: 42,
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 11,
    textAlign: 'right',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(232,224,208,0.08)',
  },
  sendButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  rail: {
    width: 360,
    padding: 26,
    gap: 14,
  },
  railPortraitWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#120d1d',
    shadowOpacity: 0.42,
    shadowRadius: 24,
  },
  railPortrait: {
    width: '100%',
    height: '100%',
    objectPosition: '50% 26%',
  },
  railEyebrow: {
    color: colors.gold,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.7,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  railTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.displayBold,
    fontSize: 24,
    lineHeight: 30,
  },
  railDominant: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  railMajors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  railMajor: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(232,208,144,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(232,208,144,0.16)',
  },
  railMajorText: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  railTip: {
    color: colors.textMuted,
    fontFamily: fonts.oracleItalic,
    fontSize: 15,
    lineHeight: 21,
  },
});
