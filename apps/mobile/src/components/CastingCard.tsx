import { View, Text, useWindowDimensions, StyleSheet } from 'react-native'
import { GlassCard } from './GlassCard'
import { colors, radii, spacing } from '../theme/colors'
import type { CastingDTO } from '../services/types'

const GRADIENTS = [
  ['#6366f1', '#a855f7'],
  ['#a855f7', '#ec4899'],
  ['#ec4899', '#6366f1'],
]

function initials(text: string): string {
  return text
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

interface Props {
  casting: CastingDTO
  index?: number
}

export function CastingCard({ casting, index = 0 }: Props) {
  const { width } = useWindowDimensions()
  const narrow = width < 520
  const gradient = GRADIENTS[index % GRADIENTS.length]
  return (
    <GlassCard padded={false}>
      <View style={[styles.hero, narrow && styles.heroNarrow, { backgroundColor: gradient[0] }]}>
        <Text style={[styles.heroText, narrow && styles.heroTextNarrow]}>
          {narrow ? initials(casting.title) : casting.title}
        </Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.project}>{casting.projectName}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{casting.role}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>Closes {casting.deadline}</Text>
        </View>
      </View>
    </GlassCard>
  )
}

const styles = StyleSheet.create({
  hero: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  heroNarrow: {
    height: 100,
  },
  heroText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  heroTextNarrow: {
    fontSize: 28,
    letterSpacing: 2,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  project: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  metaDot: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
})
