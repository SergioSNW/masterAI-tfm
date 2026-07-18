import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, radii, spacing } from '../../src/theme/colors'
import { GlassButton } from '../../src/components/GlassButton'
import { GlassCard } from '../../src/components/GlassCard'
import { fetchOpenCastings } from '../../src/services/castingService'
import { submitVideo, readFileAsBase64 } from '../../src/services/submissionService'
import type { CastingDTO } from '../../src/services/types'

const STATUS_META: Record<string, { label: string; color: string }> = {
  shortlisted: { label: 'Shortlisted', color: '#22c55e' },
  reviewed: { label: 'Reviewed', color: '#6366f1' },
  rejected: { label: 'Rejected', color: '#ef4444' },
  pending: { label: 'Pending Review', color: '#eab308' },
}

export default function CastingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [casting, setCasting] = useState<CastingDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [localSubmission, setLocalSubmission] = useState<{ status: string; feedback?: string; submittedAt: string } | null>(null)

  useEffect(() => {
    fetchOpenCastings().then(all => {
      setCasting(all.find(c => c.id === id) ?? null)
      setLoading(false)
    })
  }, [id])

  async function handleFilePick() {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'video/mp4,video/quicktime,video/webm'
      input.onchange = async (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file || !casting) return
        await doUpload(file)
      }
      input.click()
    }
  }

  async function doUpload(file: File) {
    if (!casting) return
    setUploading(true)
    setUploadError(null)
    try {
      const videoData = await readFileAsBase64(file)
      const result = await submitVideo(casting, videoData, file.name)
      setLocalSubmission({ status: result.status, feedback: result.feedback, submittedAt: result.submittedAt })
    } catch {
      setUploadError('Upload failed. Check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><Text style={styles.loading}>Loading...</Text></View>
      </SafeAreaView>
    )
  }

  if (!casting) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.role}>Not Found</Text>
          <GlassButton title="Go Back" onPress={() => router.back()} variant="ghost" />
        </View>
      </SafeAreaView>
    )
  }

  const submission = localSubmission ?? casting.submission
  const meta = submission ? STATUS_META[submission.status ?? ''] : null

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <GlassButton title="← Back" onPress={() => router.back()} variant="ghost" style={{ alignSelf: 'flex-start', marginBottom: spacing.md }} />

        <GlassCard>
          <Text style={styles.role}>{casting.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Project</Text>
            <Text style={styles.metaValue}>{casting.projectName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Role</Text>
            <Text style={styles.metaValue}>{casting.role}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Deadline</Text>
            <Text style={styles.metaValue}>{casting.deadline}</Text>
          </View>
        </GlassCard>

        {submission ? (
          <GlassCard style={{ marginTop: spacing.md }}>
            <Text style={styles.sectionTitle}>Your Submission</Text>
            <View style={[styles.badge, { backgroundColor: meta ? meta.color + '22' : 'transparent', borderColor: meta ? meta.color : 'transparent' }]}>
              <Text style={[styles.badgeText, { color: meta?.color }]}>
                {meta?.label ?? submission.status}
              </Text>
            </View>
            {submission.submittedAt && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Submitted</Text>
                <Text style={styles.metaValue}>{submission.submittedAt}</Text>
              </View>
            )}
            {submission.feedback && (
              <View style={{ marginTop: spacing.md }}>
                <Text style={styles.metaLabel}>Feedback</Text>
                <Text style={styles.feedback}>{submission.feedback}</Text>
              </View>
            )}
          </GlassCard>
        ) : (
          <GlassCard style={{ marginTop: spacing.md }}>
            <Text style={styles.sectionTitle}>Not Submitted</Text>
            <Text style={styles.subtitle}>You haven't submitted for this role yet.</Text>
            {casting.status === 'open' && (
              <GlassButton
                title={uploading ? 'Uploading...' : 'Submit Video'}
                onPress={handleFilePick}
                variant="primary"
                disabled={uploading}
                style={{ marginTop: spacing.md }}
              />
            )}
            {uploadError && (
              <Text style={{ color: '#ef4444', fontSize: 13, marginTop: spacing.sm }}>{uploadError}</Text>
            )}
          </GlassCard>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  loading: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  role: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  metaLabel: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  metaValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  feedback: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
})
