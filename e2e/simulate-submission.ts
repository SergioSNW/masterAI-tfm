import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = process.env.API_URL ?? 'https://master-ai-tfm.vercel.app'
const API_BASE = ROOT.replace(/\/+$/, '').endsWith('/api') ? ROOT.replace(/\/+$/, '') : `${ROOT.replace(/\/+$/, '')}/api`
const ACTOR_ID = process.env.ACTOR_ID ?? 'a1'

const SAMPLE_FILE = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'sample-5s.mp4')
const SAMPLE_URLS = [
  'https://download.samplelib.com/mp4/sample-5s.mp4',
  'https://sample-videos.com/video321/mp4/240/big_buck_bunny_240p_1mb.mp4',
  'https://filesamples.com/samples/video/mp4/sample_640x360.mp4',
]

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init)
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`GET ${path} -> ${res.status}: ${text.slice(0, 300)}`)
  }
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(`GET ${path} -> invalid JSON (${res.status} ${res.headers.get('content-type')}): ${text.slice(0, 300)}`)
  }
}

async function ensureSampleVideo(): Promise<Buffer> {
  try {
    const info = await stat(SAMPLE_FILE)
    if (info.size > 0) {
      console.log(`[video] using cached sample: ${SAMPLE_FILE} (${info.size} bytes)`)
      return readFile(SAMPLE_FILE)
    }
  } catch {
    // not cached yet
  }

  for (const url of SAMPLE_URLS) {
    console.log(`[video] downloading 5s sample from ${url}`)
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const buffer = Buffer.from(await res.arrayBuffer())
      if (buffer.byteLength === 0) continue
      await mkdir(dirname(SAMPLE_FILE), { recursive: true })
      await writeFile(SAMPLE_FILE, buffer)
      console.log(`[video] saved ${buffer.byteLength} bytes -> ${SAMPLE_FILE}`)
      return buffer
    } catch (err) {
      console.log(`[video] failed (${err instanceof Error ? err.message : err}); trying next source`)
    }
  }
  throw new Error('Could not obtain a sample mp4 from any source')
}

async function uploadToCloudinary(videoBuffer: Buffer) {
  const sign = await fetchJson<{
    signature: string
    timestamp: number
    folder: string
    apiKey: string
    cloudName: string
  }>('/cloudinary/sign')

  console.log(`[cloudinary] got signature (cloud=${sign.cloudName}, folder=${sign.folder})`)

  const form = new FormData()
  form.append('file', new Blob([videoBuffer], { type: 'video/mp4' }), 'dummy-5s.mp4')
  form.append('api_key', sign.apiKey)
  form.append('timestamp', String(sign.timestamp))
  form.append('signature', sign.signature)
  form.append('folder', sign.folder)

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/video/upload`, {
    method: 'POST',
    body: form,
  })
  const uploadText = await uploadRes.text()
  if (!uploadRes.ok) {
    throw new Error(`Cloudinary upload failed (${uploadRes.status}): ${uploadText.slice(0, 300)}`)
  }
  const data = JSON.parse(uploadText) as { secure_url?: string }
  if (!data.secure_url) throw new Error('Cloudinary upload returned no secure_url')
  console.log(`[cloudinary] uploaded -> ${data.secure_url}`)
  return data.secure_url
}

async function main() {
  console.log(`[api] base = ${API_BASE}, actor = ${ACTOR_ID}`)

  const castings = await fetchJson<
    Array<{
      id: string
      title: string
      roundId?: string
      status: string
      submission?: { status: string }
    }>
  >(`/castings?actorId=${encodeURIComponent(ACTOR_ID)}`)

  if (castings.length === 0) throw new Error('No open castings found')

  const target = castings.find(c => !c.submission) ?? castings[0]
  const { id: castingId, roundId, title } = target
  console.log(`[castings] found ${castings.length}; targeting "${title}" (${castingId}, round=${roundId ?? 'none'})`)
  if (!roundId) throw new Error(`Casting ${castingId} has no round to submit to`)

  const videoBuffer = await ensureSampleVideo()
  const videoUrl = await uploadToCloudinary(videoBuffer)

  console.log(`[submission] posting to /submissions (casting=${castingId}, actor=${ACTOR_ID})`)
  const submission = await fetchJson<{ id: string; status: string; createdAt: string }>('/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      castingId,
      actorId: ACTOR_ID,
      videoUrl,
      notes: 'Automated 5-second dummy video submission (simulate-submission.ts)',
    }),
  })
  console.log(`[submission] persisted id=${submission.id} status=${submission.status} createdAt=${submission.createdAt}`)

  const verify = await fetchJson<
    Array<{ id: string; title: string; submission?: { status: string } }>
  >(`/castings?actorId=${encodeURIComponent(ACTOR_ID)}`)
  const confirmed = verify.find(c => c.id === castingId)
  console.log(`[verify] casting "${confirmed?.title}" submission: ${confirmed?.submission?.status ?? 'NOT FOUND'}`)

  if (!confirmed?.submission) {
    throw new Error('Submission was not returned by the API after POST — pipeline may be broken')
  }

  console.log('\n✅ End-to-end video submission pipeline verified')
}

main().catch(err => {
  console.error(`\n❌ ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
})
