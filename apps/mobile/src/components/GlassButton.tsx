import { TouchableOpacity, Text, StyleSheet, type ViewStyle } from 'react-native'
import { colors, radii, spacing } from '../theme/colors'

interface Props {
  title: string
  onPress: () => void
  variant?: 'primary' | 'ghost'
  disabled?: boolean
  style?: ViewStyle
}

export function GlassButton({ title, onPress, variant = 'primary', disabled, style }: Props) {
  const isPrimary = variant === 'primary'
  return (
    <TouchableOpacity
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textGhost]}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.accent['1'],
  },
  ghost: {
    backgroundColor: colors.glass.bg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  textPrimary: {
    color: '#ffffff',
  },
  textGhost: {
    color: colors.text.primary,
  },
})
