import { Platform } from 'react-native'
import { File } from 'expo-file-system'
import { post } from './api'
import type { CastingDTO } from './types'

const ACTOR_ID = process.env.EXPO_PUBLIC_ACTOR_ID ?? 'a1'

export interface UploadResult {
  id: string
  status: string
  feedback?: string
  submittedAt: string
}

export async function submitCloudinaryVideo(
  casting: CastingDTO,
  videoUrl: string,
  notes?: string,
): Promise<UploadResult> {
  const result = await post<{ id: string; status: string; feedback?: string; createdAt: string }>(
    '/submissions',
    { castingId: casting.id, actorId: ACTOR_ID, videoUrl, notes },
  ).catch(() => null)

  if (result) {
    return {
      id: result.id,
      status: result.status,
      feedback: result.feedback,
      submittedAt: result.createdAt,
    }
  }

  return {
    id: `local-${Date.now()}`,
    status: 'pending',
    submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }
}

export async function submitVideo(
  casting: CastingDTO,
  videoData: string,
  fileName: string,
  notes?: string,
): Promise<UploadResult> {
  const body = {
    roundId: casting.roundId,
    actorId: ACTOR_ID,
    videoData,
    fileName,
    notes,
  }
  const result = await post<{ id: string; status: string; feedback?: string; createdAt: string }>(
    '/submissions/upload',
    body,
  ).catch(() => null)

  if (result) {
    return {
      id: result.id,
      status: result.status,
      feedback: result.feedback,
      submittedAt: result.createdAt,
    }
  }

  return {
    id: `local-${Date.now()}`,
    status: 'pending',
    submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }
}

export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function readVideoUriAsBase64(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
  return new File(uri).base64()
}
