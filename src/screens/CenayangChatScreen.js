import { useMemo, useRef, useState } from 'react';
import {
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
import { colors, fonts, radii } from '../theme/tokens';

const cenayangAvatar = require('../../assets/images/characters/cenayang-avatar.webp');

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
    {
      id: 'm2',
      from: 'user',
      text: 'Jurusan apa yang paling cocok untukku?',
      time: '10:25',
    },
    {
      id: 'm3',
      from: 'oracle',
      text: `Untukmu, jalur seperti ${klass.majors.slice(0, 3).join(', ')} terasa paling selaras. Bukan sebagai batasan, melainkan pintu pertama yang layak kamu buka.`,
      time: '10:25',
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
      <Text style={styles.railTip}>Cenayang memakai hasilmu sebagai konteks dummy untuk simulasi chat ini.</Text>
    </View>
  );
}

export function CenayangChatScreen({ scores = {}, classId, onBack }) {
  const { width } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);
  const desktop = breakpoint === 'desktop';
  const klass = classCatalog[classId] || resultFromScores(scores).klass;
  const [messages, setMessages] = useState(() => seedMessages(klass));
  const [draft, setDraft] = useState('');
  const [sessionsLeft, setSessionsLeft] = useState(4);
  const scrollRef = useRef(null);
  const exhausted = sessionsLeft === 0;
  const showWarning = sessionsLeft <= 2;

  const replies = useMemo(
    () => [
      `Kekuatan ${klass.name} bukan ramalan yang mengikat. Ia lebih seperti kompas: gunakan untuk memilih arah, lalu uji lewat pengalaman nyata.`,
      `Aku melihat pola ${klass.dominant.join(' dan ')} dalam jawabanmu. Carilah kegiatan yang memberi ruang untuk dua energi itu sekaligus.`,
      `Pertanyaan yang baik. Untuk minggu ini, coba satu langkah kecil: cari jurusan, lihat mata kuliahnya, lalu catat mana yang membuatmu penasaran.`,
    ],
    [klass]
  );

  const send = () => {
    const text = draft.trim();
    if (!text || exhausted) return;
    const time = nowTime();
    const userMessage = { id: `u-${Date.now()}`, from: 'user', text, time };
    const reply = {
      id: `o-${Date.now()}`,
      from: 'oracle',
      text: replies[messages.length % replies.length],
      time,
    };
    setDraft('');
    setSessionsLeft((current) => Math.max(0, current - 1));
    setMessages((current) => [...current, userMessage, reply]);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd?.({ animated: true }));
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
              <Text style={styles.presence}>Hadir untukmu</Text>
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
                    placeholder={exhausted ? 'Sesi konsultasi habis' : 'Tanyakan sesuatu...'}
                    placeholderTextColor={colors.textMuted}
                    editable={!exhausted}
                    onSubmitEditing={send}
                    returnKeyType="send"
                    style={styles.input}
                  />
                  <Pressable
                    accessibilityRole="button"
                    onPress={send}
                    disabled={!draft.trim() || exhausted}
                    style={({ pressed }) => [
                      styles.sendButton,
                      (!draft.trim() || exhausted) && styles.sendButtonDisabled,
                      pressed && styles.sendButtonPressed,
                    ]}
                  >
                    <SendIcon disabled={!draft.trim() || exhausted} />
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
