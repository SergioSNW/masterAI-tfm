import { type ReactNode } from 'react'
import { View, type ViewStyle, StyleSheet } from 'react-native'
import { colors, radii, spacing } from '../theme/colors'

interface Props {
  children: ReactNode
  style?: ViewStyle
  hoverable?: boolean
  padded?: boolean
}

export function GlassCard({ children, style, hoverable = false, padded = true }: Props) {
  return (
    <View
      style={[
        styles.card,
        padded && { padding: spacing.lg },
        hoverable && styles.hoverable,
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass.bg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: 'hidden',
  },
  hoverable: {
    // On native, we use opacity press; on web, a hover style is applied via cursor
  },
})
