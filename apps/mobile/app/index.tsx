import { useState } from 'react'
import { useWindowDimensions, View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing } from '../src/theme/colors'
import { AvatarChip } from '../src/components/AvatarChip'
import { CastingCard } from '../src/components/CastingCard'
import { ProfileSheet } from '../src/components/ProfileSheet'

interface Casting {
  id: string
  title: string
  projectName: string
  role: string
  deadline: string
}

const MOCK_CASTINGS: Casting[] = [
  { id: '1', title: 'Lead Role — Feature Film', projectName: 'Eclipse', role: 'Lead Actor', deadline: 'Aug 15, 2026' },
  { id: '2', title: 'Supporting Role — TV Series', projectName: 'Nightfall', role: 'Supporting Actor', deadline: 'Aug 30, 2026' },
  { id: '3', title: 'Voice Over — Animation', projectName: 'Starlight', role: 'Voice Actor', deadline: 'Sep 1, 2026' },
]

export default function Dashboard() {
  const [profileVisible, setProfileVisible] = useState(false)
  const { width } = useWindowDimensions()
  const narrow = width < 520

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {narrow ? (
          <View style={styles.headerStack}>
            <Text style={styles.logo}>MasterAI</Text>
            <Text style={styles.welcome}>Welcome to your actor dashboard</Text>
            <AvatarChip name="Alex Rivera" onPress={() => setProfileVisible(true)} />
          </View>
        ) : (
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.logo}>MasterAI</Text>
              <Text style={styles.welcome}>Welcome to your actor dashboard</Text>
            </View>
            <AvatarChip name="Alex Rivera" onPress={() => setProfileVisible(true)} />
          </View>
        )}

        <Text style={styles.sectionTitle}>Open Castings</Text>

        <View style={styles.list}>
          {MOCK_CASTINGS.map((casting, i) => (
            <CastingCard key={casting.id} casting={casting} index={i} />
          ))}
        </View>
      </ScrollView>

      <ProfileSheet visible={profileVisible} onClose={() => setProfileVisible(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.accent['1'],
    letterSpacing: -0.5,
  },
  welcome: {
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  headerStack: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
})
