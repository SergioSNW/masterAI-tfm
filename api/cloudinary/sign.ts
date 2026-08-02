import type { VercelRequest, VercelResponse } from '@vercel/node'
import cloudinary from 'cloudinary'

const FOLDER = 'actor_auditions'

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const timestamp = Math.round(Date.now() / 1000)
    const paramsToSign = { timestamp, folder: FOLDER }
    const signature = cloudinary.v2.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET ?? '',
    )

    return res.status(200).json({
      signature,
      timestamp,
      folder: FOLDER,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to sign request'
    return res.status(500).json({ error: message })
  }
}
