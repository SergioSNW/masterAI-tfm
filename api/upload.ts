import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleUpload } from '@vercel/blob/client'

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4',
  'video/quicktime',
  'video/webm',
]

const MAX_SIZE_BYTES = 50 * 1024 * 1024

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload: Record<string, unknown> = clientPayload
          ? JSON.parse(clientPayload)
          : {}

        const { fileType, fileSize, fileName } = payload as {
          fileType?: string
          fileSize?: number
          fileName?: string
        }

        if (!fileName?.trim()) {
          throw new Error('File name is required')
        }

        if (!fileType || !ALLOWED_TYPES.includes(fileType)) {
          throw new Error(`File type '${fileType}' is not supported`)
        }

        if (fileSize === undefined || fileSize > MAX_SIZE_BYTES) {
          throw new Error(
            `File exceeds 50MB limit (${((fileSize ?? MAX_SIZE_BYTES + 1) / 1024 / 1024).toFixed(1)}MB)`,
          )
        }

        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_SIZE_BYTES,
          addRandomSuffix: true,
        }
      },
    })

    return res.status(200).json(response)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload request failed'
    return res.status(400).json({ error: message })
  }
}
