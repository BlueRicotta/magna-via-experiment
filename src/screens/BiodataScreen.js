import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

import { GoldButton } from '../components/GoldButton';
import { colors, fonts, radii } from '../theme/tokens';

const arcadia = require('../../assets/images/backgrounds/arcadia-splash.webp');

const gradeOptions = ['SMP', 'Kelas 10', 'Kelas 11', 'Kelas 12', 'Sudah Lulus'];
const genderOptions = ['Pria', 'Wanita'];

const initialForm = {
  name: '',
  age: '',
  school: '',
  email: '',
  grade: '',
  gender: '',
  consent: false,
};

function getBreakpoint(width) {
  if (width >= 960) return 'desktop';
  if (width >= 600) return 'tablet';
  return 'mobile';
}

function QuillIcon({ size = 44 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36">
      <SvgLinearGradient id="quillGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={colors.goldHi} />
        <Stop offset="0.55" stopColor={colors.gold} />
        <Stop offset="1" stopColor={colors.goldLo} />
      </SvgLinearGradient>
      <Path
        d="M30 4 C22 6 14 12 9 22 L6 28 L12 25 C22 22 28 14 30 4 Z"
        fill="url(#quillGrad)"
        stroke={colors.goldHi}
        strokeWidth="0.5"
      />
      <Path d="M11 22 L17 17 M14 24 L21 19 M9 25 L14 22 M19 17 L24 11" stroke="#1a0e00" strokeWidth="0.7" strokeLinecap="round" opacity="0.55" />
      <Path d="M6 28 L4 32" stroke={colors.gold} strokeWidth="1.2" strokeLinecap="round" />
      <Circle cx="3.5" cy="33" r="1" fill={colors.gold} opacity="0.7" />
    </Svg>
  );
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

function TextField({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize = 'sentences', style }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.fieldLabel, focused && styles.fieldLabelFocused]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.inputFocused]}
      />
    </View>
  );
}

function SelectBar({ label, value, placeholder, options, open, onToggle, onSelect, style, placement = 'down' }) {
  return (
    <View style={[styles.field, open && styles.fieldOpen, style]}>
      <Text style={[styles.fieldLabel, open && styles.fieldLabelFocused]}>{label}</Text>
      <View style={[styles.selectShell, open && styles.selectShellOpen]}>
        <Pressable accessibilityRole="button" onPress={onToggle} style={styles.selectTrigger}>
          <Text style={[styles.selectValue, !value && styles.selectPlaceholder]}>{value || placeholder}</Text>
          <Text style={[styles.selectChevron, open && styles.selectChevronOpen]}>v</Text>
        </Pressable>

        {open && (
          <View style={[styles.optionList, placement === 'up' ? styles.optionListUp : styles.optionListDown]}>
            {options.map((option) => {
              const selected = value === option;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  onPress={() => onSelect(option)}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
                  {selected && <Text style={styles.optionCheck}>OK</Text>}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

function GoldFlourish() {
  return (
    <View style={styles.flourish}>
      <View style={styles.flourishLine} />
      <View style={styles.flourishDiamond} />
      <View style={styles.flourishLine} />
    </View>
  );
}

function Ceremony({ desktop }) {
  return (
    <View style={[styles.ceremony, desktop && styles.ceremonyDesktop]}>
      <View style={styles.quillWrap}>
        <QuillIcon size={desktop ? 52 : 42} />
      </View>
      <Text style={styles.eyebrow}>Selamat Datang di Arcadia</Text>
      <Text style={[styles.title, desktop && styles.titleDesktop]}>Daftarkan Dirimu</Text>
      <Text style={[styles.subtitle, desktop && styles.subtitleDesktop]}>
        Sebelum memasuki Arcadia, perkenalkan siapa dirimu.
      </Text>
      <GoldFlourish />
      {desktop && (
        <Text style={styles.flavor}>
          Setiap pejuang yang datang harus tertulis dalam catatan kerajaan. Goreskan namamu pada gulungan ini, dan gerbang Arcadia akan terbuka.
        </Text>
      )}
    </View>
  );
}

export function BiodataScreen({ user, onBack, onDone }) {
  const { width } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);
  const desktop = breakpoint === 'desktop';
  const twoColumns = breakpoint !== 'mobile';
  const [form, setForm] = useState({ ...initialForm, ...(user || {}) });
  const [openSelect, setOpenSelect] = useState(null);

  const valid = useMemo(
    () => (
      form.consent &&
      ['name', 'age', 'school', 'email', 'grade', 'gender']
        .every((field) => String(form[field] || '').trim().length > 0)
    ),
    [form],
  );

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSelect = (field, value) => {
    setField(field, value);
    setOpenSelect(null);
  };

  const submit = () => {
    if (!valid) return;
    onDone(form);
  };

  return (
    <View style={styles.screen}>
      <Image source={arcadia} resizeMode="cover" blurRadius={14} style={styles.backgroundImage} />
      <LinearGradient
        colors={['rgba(10,10,20,0.62)', 'rgba(10,10,20,0.88)', 'rgba(10,10,20,0.98)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <BackButton onPress={onBack} />
          <Text style={styles.step}>STEP 03 - PENDAFTARAN</Text>
          <View style={styles.topSpacer} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContent, desktop && styles.scrollContentDesktop]}
        >
          <View style={[styles.layout, desktop && styles.layoutDesktop]}>
            <Ceremony desktop={desktop} />

            <View style={styles.scrollCard}>
              <View style={styles.rod}>
                <View style={styles.rodCapLeft} />
                <View style={styles.rodBar} />
                <View style={styles.rodCapRight} />
              </View>

              <LinearGradient
                colors={['rgba(28,22,46,0.96)', 'rgba(20,16,34,0.98)']}
                style={styles.formPanel}
              >
                <View style={styles.formEyebrowRow}>
                  <View style={styles.formEyebrowLine} />
                  <Text style={styles.formEyebrow}>Biodata</Text>
                  <View style={styles.formEyebrowLine} />
                </View>

                <View style={[styles.fields, twoColumns && styles.fieldsTwoColumn]}>
                  <View style={styles.fullSpan}>
                    <TextField
                      label="Nama Lengkap"
                      value={form.name}
                      onChangeText={(value) => setField('name', value)}
                      placeholder="Nama lengkap atau panggilan"
                    />
                  </View>

                  <TextField
                    label="Usia"
                    value={form.age}
                    onChangeText={(value) => setField('age', value.replace(/[^0-9]/g, ''))}
                    placeholder="Usiamu saat ini"
                    keyboardType="number-pad"
                    style={twoColumns && styles.halfSpan}
                  />

                  <SelectBar
                    label="Kelas / Angkatan"
                    value={form.grade}
                    placeholder="Pilih kelasmu"
                    options={gradeOptions}
                    open={openSelect === 'grade'}
                    onToggle={() => setOpenSelect(openSelect === 'grade' ? null : 'grade')}
                    onSelect={(value) => handleSelect('grade', value)}
                    style={twoColumns && styles.halfSpan}
                  />

                  <View style={styles.fullSpan}>
                    <TextField
                      label="Asal Sekolah"
                      value={form.school}
                      onChangeText={(value) => setField('school', value)}
                      placeholder="Nama sekolah atau institusimu"
                    />
                  </View>

                  <View style={styles.fullSpan}>
                    <TextField
                      label="Alamat Email"
                      value={form.email}
                      onChangeText={(value) => setField('email', value)}
                      placeholder="emailkamu@domain.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.fullSpan}>
                    <SelectBar
                      label="Gender"
                      value={form.gender}
                      placeholder="Pilih gender"
                      options={genderOptions}
                      open={openSelect === 'gender'}
                      onToggle={() => setOpenSelect(openSelect === 'gender' ? null : 'gender')}
                      onSelect={(value) => handleSelect('gender', value)}
                      placement="up"
                    />
                  </View>
                </View>

                <View style={styles.ctaWrap}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: form.consent }}
                    onPress={() => setField('consent', !form.consent)}
                    style={({ pressed }) => [styles.consentRow, pressed && styles.consentRowPressed]}
                  >
                    <View style={[styles.consentBox, form.consent && styles.consentBoxChecked]}>
                      {form.consent && <Text style={styles.consentCheck}>✓</Text>}
                    </View>
                    <Text style={styles.consentText}>
                      Aku setuju data ini digunakan untuk menyimpan hasil perjalanan dan kebutuhan penelitian Magna Via lebih lanjut.
                    </Text>
                  </Pressable>
                  <GoldButton onPress={submit} disabled={!valid} style={styles.submitButton}>
                    MASUK KE ARCADIA
                  </GoldButton>
                  <Text style={styles.disclaimer}>Data dapat dilihat oleh admin Magna Via dan tidak akan digunakan di luar kebutuhan pengujian aplikasi.</Text>
                </View>
              </LinearGradient>

              <View style={styles.rod}>
                <View style={styles.rodCapLeft} />
                <View style={styles.rodBar} />
                <View style={styles.rodCapRight} />
              </View>
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
    opacity: 0.18,
    transform: [{ scale: 1.1 }],
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    height: 68,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    minWidth: 96,
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
    color: colors.textMuted,
    fontFamily: fonts.displayBold,
    fontSize: 11,
    letterSpacing: 2.4,
    textAlign: 'center',
  },
  topSpacer: {
    width: 96,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 36,
  },
  scrollContentDesktop: {
    paddingHorizontal: 48,
    paddingTop: 24,
    paddingBottom: 64,
  },
  layout: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    gap: 26,
  },
  layoutDesktop: {
    maxWidth: 1120,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 64,
  },
  ceremony: {
    alignItems: 'center',
    gap: 12,
  },
  ceremonyDesktop: {
    width: 460,
    alignItems: 'flex-start',
    paddingTop: 24,
  },
  quillWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(200,160,48,0.12)',
    shadowColor: colors.gold,
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
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
    textShadowColor: 'rgba(200,160,48,0.18)',
    textShadowRadius: 22,
  },
  titleDesktop: {
    fontSize: 54,
    lineHeight: 60,
    textAlign: 'left',
  },
  subtitle: {
    maxWidth: 410,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  subtitleDesktop: {
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'left',
  },
  flavor: {
    maxWidth: 390,
    color: colors.textMuted,
    fontFamily: fonts.oracleItalic,
    fontSize: 16,
    lineHeight: 25,
  },
  flourish: {
    width: 220,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    opacity: 0.85,
  },
  flourishLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(200,160,48,0.55)',
  },
  flourishDiamond: {
    width: 12,
    height: 12,
    transform: [{ rotate: '45deg' }],
    backgroundColor: colors.gold,
  },
  scrollCard: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  rod: {
    height: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -4,
  },
  rodCapLeft: {
    width: 16,
    height: 14,
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
    backgroundColor: colors.gold,
  },
  rodCapRight: {
    width: 16,
    height: 14,
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
    backgroundColor: colors.gold,
  },
  rodBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#241914',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(232,208,144,0.28)',
  },
  formPanel: {
    paddingHorizontal: 22,
    paddingVertical: 26,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: 'rgba(200,160,48,0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
  },
  formEyebrowRow: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  formEyebrowLine: {
    flex: 1,
    maxWidth: 38,
    height: 1,
    backgroundColor: 'rgba(200,160,48,0.45)',
  },
  formEyebrow: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 2.8,
    textTransform: 'uppercase',
  },
  fields: {
    gap: 15,
    zIndex: 10,
  },
  fieldsTwoColumn: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 16,
    rowGap: 15,
  },
  fullSpan: {
    width: '100%',
  },
  halfSpan: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  field: {
    position: 'relative',
    minWidth: 0,
    gap: 8,
    zIndex: 1,
  },
  fieldOpen: {
    zIndex: 20,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.9,
    textTransform: 'uppercase',
  },
  fieldLabelFocused: {
    color: colors.gold,
  },
  input: {
    height: 50,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingHorizontal: 14,
    outlineStyle: 'none',
  },
  inputFocused: {
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  selectShell: {
    position: 'relative',
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    overflow: 'visible',
    zIndex: 10,
  },
  selectShellOpen: {
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  selectTrigger: {
    minHeight: 50,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 12,
  },
  selectValue: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  selectPlaceholder: {
    color: colors.textDisabled,
    fontFamily: fonts.oracleItalic,
  },
  selectChevron: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  selectChevronOpen: {
    color: colors.gold,
    transform: [{ rotate: '180deg' }],
  },
  optionList: {
    position: 'absolute',
    left: -1,
    right: -1,
    zIndex: 50,
    borderWidth: 0.5,
    borderColor: colors.gold,
    backgroundColor: '#11101d',
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.42,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  optionListDown: {
    top: 49,
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
  },
  optionListUp: {
    bottom: 49,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
  },
  option: {
    minHeight: 40,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 12,
  },
  optionPressed: {
    backgroundColor: 'rgba(200,160,48,0.08)',
  },
  optionSelected: {
    backgroundColor: 'rgba(200,160,48,0.12)',
  },
  optionText: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  optionTextSelected: {
    color: colors.goldHi,
  },
  optionCheck: {
    color: colors.gold,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  ctaWrap: {
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
    zIndex: 1,
  },
  consentRow: {
    width: '100%',
    maxWidth: 520,
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: 'rgba(232,208,144,0.16)',
    backgroundColor: 'rgba(10,10,20,0.38)',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  consentRowPressed: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(200,160,48,0.08)',
  },
  consentBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgInput,
  },
  consentBoxChecked: {
    borderColor: colors.gold,
    backgroundColor: colors.gold,
  },
  consentCheck: {
    color: colors.textOnInvert,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    lineHeight: 20,
  },
  consentText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 17,
  },
  submitButton: {
    maxWidth: '100%',
  },
  disclaimer: {
    maxWidth: 320,
    color: colors.textMuted,
    fontFamily: fonts.oracleItalic,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
