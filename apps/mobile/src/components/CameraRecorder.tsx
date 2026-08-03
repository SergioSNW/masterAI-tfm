import { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, radii, spacing } from '../theme/colors'
import { GlassButton } from './GlassButton'

interface Props {
  onRecorded: (uri: string) => void
  onCancel: () => void
}

export function CameraRecorder({ onRecorded, onCancel }: Props) {
  const cameraRef = useRef<CameraView>(null)
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions()
  const [recording, setRecording] = useState(false)
  const [videoUri, setVideoUri] = useState<string | null>(null)

  const granted = cameraPermission?.granted === true && microphonePermission?.granted === true

  useEffect(() => {
    if (cameraPermission?.status === 'undetermined') {
      requestCameraPermission()
    }
    if (microphonePermission?.status === 'undetermined') {
      requestMicrophonePermission()
    }
  }, [cameraPermission, microphonePermission, requestCameraPermission, requestMicrophonePermission])

  async function grantAccess() {
    await requestCameraPermission()
    await requestMicrophonePermission()
  }

  async function startRecording() {
    setVideoUri(null)
    setRecording(true)
    try {
      const result = await cameraRef.current?.recordAsync()
      if (result?.uri) {
        setVideoUri(result.uri)
      }
    } catch {
      setRecording(false)
    }
  }

  function stopRecording() {
    cameraRef.current?.stopRecording()
    setRecording(false)
  }

  if (!cameraPermission || !microphonePermission) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent[1]} />
          <Text style={styles.muted}>Checking permissions…</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>Camera Access Required</Text>
          <Text style={styles.muted}>
            To record your audition we need access to both your camera and microphone.
          </Text>
          <GlassButton
            title="Grant Access"
            onPress={grantAccess}
            variant="primary"
            style={styles.action}
          />
          <GlassButton title="Cancel" onPress={onCancel} variant="ghost" style={styles.action} />
        </View>
      </SafeAreaView>
    )
  }

  const hasTake = videoUri !== null

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.cameraWrap}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
          mode="video"
        />
        <View style={styles.topBar}>
          <GlassButton title="Cancel" onPress={onCancel} variant="ghost" />
        </View>
        <View style={styles.bottomBar}>
          {recording && <Text style={styles.recLabel}>● Recording…</Text>}
          {recording ? (
            <TouchableOpacity style={styles.stopButton} onPress={stopRecording} activeOpacity={0.8}>
              <View style={styles.stopInner} />
            </TouchableOpacity>
          ) : hasTake ? (
            <View style={styles.takeActions}>
              <GlassButton
                title="Re-record"
                onPress={() => setVideoUri(null)}
                variant="ghost"
                style={styles.action}
              />
              <GlassButton
                title="Use This Take"
                onPress={() => videoUri && onRecorded(videoUri)}
                variant="primary"
                style={styles.action}
              />
            </View>
          ) : (
            <TouchableOpacity style={styles.recordButton} onPress={startRecording} activeOpacity={0.8}>
              <View style={styles.recordInner} />
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  muted: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    alignSelf: 'stretch',
  },
  cameraWrap: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radii.lg,
    margin: spacing.md,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomBar: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.md,
  },
  recLabel: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
  recordButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ef4444',
  },
  stopButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopInner: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  takeActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
})
