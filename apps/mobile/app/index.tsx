import { useState, useEffect, useCallback } from 'react'
import { useWindowDimensions, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { colors, radii, spacing } from '../src/theme/colors'
import { AvatarChip } from '../src/components/AvatarChip'
import { CastingCard } from '../src/components/CastingCard'
import { ProfileSheet } from '../src/components/ProfileSheet'
import { GlassButton } from '../src/components/GlassButton'
import { fetchOpenCastings } from '../src/services/castingService'
import type { CastingDTO } from '../src/services/types'

function SkeletonCard() {
  return (
    <View style={skeleton.card}>
      <View style={skeleton.hero} />
      <View style={skeleton.body}>
        <View style={skeleton.lineWide} />
        <View style={skeleton.lineNarrow} />
      </View>
    </View>
  )
}

export default function Dashboard() {
  const [profileVisible, setProfileVisible] = useState(false)
  const { width } = useWindowDimensions()
  const narrow = width < 520

  const [castings, setCastings] = useState<CastingDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOpenCastings()
      setCastings(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load castings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {narrow ? (
          <View style={styles.headerStack}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.logo}>MasterAI</Text>
              <TouchableOpacity onPress={() => router.push('/guide')} style={styles.helpBtn}>
                <Text style={styles.helpBtnText}>❓</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.welcome}>Welcome to your actor dashboard</Text>
            <AvatarChip name="Alex Rivera" onPress={() => setProfileVisible(true)} />
          </View>
        ) : (
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={styles.logo}>MasterAI</Text>
              <TouchableOpacity onPress={() => router.push('/guide')} style={styles.helpBtn}>
                <Text style={styles.helpBtnText}>❓</Text>
              </TouchableOpacity>
            </View>
            <AvatarChip name="Alex Rivera" onPress={() => setProfileVisible(true)} />
          </View>
        )}

        <Text style={styles.sectionTitle}>Open Castings</Text>

        {loading && (
          <View style={styles.list}>
            {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
          </View>
        )}

        {!loading && error && (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>Something went wrong</Text>
            <Text style={styles.stateSub}>{error}</Text>
            <GlassButton title="Retry" onPress={load} variant="primary" style={{ marginTop: 16 }} />
          </View>
        )}

        {!loading && !error && castings.length === 0 && (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>No open castings found</Text>
            <Text style={styles.stateSub}>Check back later for new opportunities.</Text>
          </View>
        )}

        {!loading && !error && castings.length > 0 && (
          <View style={styles.list}>
            {castings.map((casting, i) => (
              <CastingCard key={casting.id} casting={casting} index={i} onPress={() => router.push(`/casting/${casting.id}`)} />
            ))}
          </View>
        )}
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
  scroll: { flex: 1 },
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
  headerStack: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  stateBox: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  stateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  stateSub: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  helpBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glass.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  helpBtnText: {
    fontSize: 15,
  },
})

const skeleton = StyleSheet.create({
  card: {
    backgroundColor: colors.glass.bg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: 'hidden',
  },
  hero: {
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  body: {
    padding: spacing.lg,
    gap: 8,
  },
  lineWide: {
    height: 14,
    width: '60%',
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  lineNarrow: {
    height: 12,
    width: '40%',
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
})
