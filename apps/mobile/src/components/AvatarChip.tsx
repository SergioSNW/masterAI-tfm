import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import { colors, radii } from '../theme/colors'

interface Props {
  name: string
  onPress: () => void
  compact?: boolean
}

function initials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AvatarChip({ name, onPress, compact = false }: Props) {
  return (
    <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials(name)}</Text>
      </View>
      {!compact && (
        <>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.chevron}>›</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 100,
    backgroundColor: colors.glass.bg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent['1'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.primary,
    maxWidth: 100,
  },
  chevron: {
    fontSize: 16,
    color: colors.text.tertiary,
    marginLeft: 2,
  },
})
