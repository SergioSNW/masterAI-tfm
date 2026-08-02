const SIGN_ENDPOINT =
  process.env.EXPO_PUBLIC_API_URL
    ? `${process.env.EXPO_PUBLIC_API_URL}/api/cloudinary/sign`
    : 'https://master-ai-tfm.vercel.app/api/cloudinary/sign'

interface SignResponse {
  signature: string
  timestamp: number
  folder: string
  apiKey: string
  cloudName: string
}

export async function uploadVideoToCloudinary(videoUri: string): Promise<string> {
  const signRes = await fetch(SIGN_ENDPOINT)
  if (!signRes.ok) {
    throw new Error(`Failed to obtain Cloudinary upload signature (${signRes.status})`)
  }

  const { signature, timestamp, folder, apiKey, cloudName } = (await signRes.json()) as SignResponse

  const formData = new FormData()
  formData.append('file', {
    uri: videoUri,
    type: 'video/mp4',
    name: 'video.mp4',
  } as unknown as Blob)
  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('signature', signature)
  formData.append('folder', folder)

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!uploadRes.ok) {
    throw new Error(`Cloudinary upload failed (${uploadRes.status})`)
  }

  const data = (await uploadRes.json()) as { secure_url?: string }
  if (!data.secure_url) {
    throw new Error('Cloudinary upload returned no secure_url')
  }

  return data.secure_url
}
