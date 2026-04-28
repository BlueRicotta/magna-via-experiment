import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fonts, radii } from '../theme/tokens';

export function GoldButton({ children, onPress, disabled, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <LinearGradient
        colors={['#d4ad3c', colors.gold, '#a78420']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.fill}
      >
        <Text style={styles.label}>{children}</Text>
        <Text style={styles.arrow}>{'->'}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    maxWidth: 360,
    height: 56,
    borderRadius: radii.lg,
    shadowColor: colors.gold,
    shadowOpacity: 0.42,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  fill: {
    flex: 1,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(232,208,144,0.55)',
  },
  label: {
    color: colors.textOnInvert,
    fontFamily: fonts.displayBold,
    fontSize: 15,
    letterSpacing: 3,
  },
  arrow: {
    color: colors.textOnInvert,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    marginTop: -1,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.25,
  },
  disabled: {
    opacity: 0.45,
  },
});
