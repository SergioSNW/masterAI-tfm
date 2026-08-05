import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, radii, spacing } from '../../src/theme/colors'
import { GlassButton } from '../../src/components/GlassButton'
import { GlassCard } from '../../src/components/GlassCard'
import { CameraRecorder } from '../../src/components/CameraRecorder'
import { fetchOpenCastings } from '../../src/services/castingService'
import { submitCloudinaryVideo } from '../../src/services/submissionService'
import { uploadVideoToCloudinary } from '../../src/services/uploadService'
import { fetchComments } from '../../src/services/commentService'
import type { CommentDTO } from '../../src/services/commentService'
import { fetchAttachments, openAttachment } from '../../src/services/attachmentService'
import type { AttachmentDTO } from '../../src/services/attachmentService'
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
  const [comments, setComments] = useState<CommentDTO[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentDTO[]>([])
  const [attachmentsLoading, setAttachmentsLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  useEffect(() => {
    fetchOpenCastings().then(all => {
      const c = all.find(c => c.id === id) ?? null
      setCasting(c)
      setLoading(false)
      if (c?.roundId) {
        setAttachmentsLoading(true)
        fetchAttachments(c.roundId).then(data => {
          setAttachments(data)
          setAttachmentsLoading(false)
        })
      }
    })
  }, [id])

  useEffect(() => {
    const sub = localSubmission ?? casting?.submission
    if (sub?.status && sub.status !== 'pending') {
      setCommentsLoading(true)
      fetchComments(sub.status).then(data => {
        setComments(data)
        setCommentsLoading(false)
      })
    } else {
      setComments([])
    }
  }, [localSubmission, casting?.submission])

  async function handleRecorded(uri: string) {
    if (!casting) return
    setShowCamera(false)
    setUploading(true)
    setUploadError(null)
    try {
      const videoUrl = await uploadVideoToCloudinary(uri)
      const result = await submitCloudinaryVideo(casting, videoUrl)
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

  if (showCamera && casting) {
    return (
      <CameraRecorder
        onRecorded={handleRecorded}
        onCancel={() => setShowCamera(false)}
      />
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
          {casting.description ? (
            <View style={{ marginTop: spacing.md }}>
              <Text style={styles.metaLabel}>Description</Text>
              <Text style={styles.bodyText}>{casting.description}</Text>
            </View>
          ) : null}
          {casting.requirements ? (
            <View style={{ marginTop: spacing.md }}>
              <Text style={styles.metaLabel}>Requirements</Text>
              <Text style={styles.bodyText}>{casting.requirements}</Text>
            </View>
          ) : null}
        </GlassCard>

        {attachments.length > 0 && (
          <GlassCard style={{ marginTop: spacing.md }}>
            <Text style={styles.sectionTitle}>Attachments ({attachments.length})</Text>
            {attachments.map(a => (
              <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.glass.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  <Text style={{ fontSize: 18 }}>{a.fileType === 'application/pdf' ? '📕' : '📎'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text.primary }} numberOfLines={1}>{a.fileName}</Text>
                    <Text style={{ fontSize: 11, color: colors.text.tertiary }}>{(a.fileSize / 1024).toFixed(0)} KB</Text>
                  </View>
                </View>
                <GlassButton title="Open" onPress={() => openAttachment(a)} variant="ghost" />
              </View>
            ))}
          </GlassCard>
        )}

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
            {comments.length > 0 && (
              <View style={{ marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.glass.border, paddingTop: spacing.md }}>
                <Text style={styles.metaLabel}>Comments ({comments.length})</Text>
                {comments.map(c => (
                  <View key={c.id} style={{ marginTop: spacing.sm, padding: spacing.sm, backgroundColor: colors.glass.bg, borderRadius: radii.sm }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.accent[1] }}>{c.authorName}</Text>
                      <Text style={{ fontSize: 11, color: colors.text.tertiary }}>{c.createdAt}</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: colors.text.secondary }}>{c.content}</Text>
                  </View>
                ))}
              </View>
            )}
            {submission.status === 'pending' && casting.status === 'open' && (
              <GlassButton
                title={uploading ? 'Uploading...' : 'Re-record Video'}
                onPress={() => setShowCamera(true)}
                variant="primary"
                disabled={uploading}
                style={{ marginTop: spacing.md }}
              />
            )}
            {uploadError && (
              <Text style={{ color: '#ef4444', fontSize: 13, marginTop: spacing.sm }}>{uploadError}</Text>
            )}
          </GlassCard>
        ) : (
          <GlassCard style={{ marginTop: spacing.md }}>
            <Text style={styles.sectionTitle}>Not Submitted</Text>
            <Text style={styles.subtitle}>You haven't submitted for this role yet.</Text>
            {casting.status === 'open' && (
              <GlassButton
                title={uploading ? 'Uploading...' : 'Record Video'}
                onPress={() => setShowCamera(true)}
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
  bodyText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
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
