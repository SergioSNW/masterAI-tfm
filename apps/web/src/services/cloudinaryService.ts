export interface CloudinarySignature {
  signature: string
  timestamp: number
  folder: string
  apiKey: string
  cloudName: string
}

export async function getCloudinarySignature(): Promise<CloudinarySignature> {
  const res = await fetch('/api/cloudinary/sign')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? 'Failed to get upload signature')
  }
  return res.json() as Promise<CloudinarySignature>
}

export async function uploadVideoToCloudinary(file: File, sign: CloudinarySignature): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sign.apiKey)
  form.append('timestamp', String(sign.timestamp))
  form.append('signature', sign.signature)
  form.append('folder', sign.folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/video/upload`, {
    method: 'POST',
    body: form,
  })
  const data = await res.json().catch(() => ({})) as { secure_url?: string; error?: { message?: string } }
  if (!res.ok || typeof data.secure_url !== 'string') {
    throw new Error(data.error?.message ?? 'Cloudinary upload failed')
  }
  return data.secure_url
}
