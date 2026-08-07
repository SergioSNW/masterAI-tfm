import { upload } from '@vercel/blob/client'

const ROOT = process.env.API_URL ?? 'https://master-ai-tfm.vercel.app'
const API_BASE = ROOT.replace(/\/+$/, '').endsWith('/api') ? ROOT.replace(/\/+$/, '') : `${ROOT.replace(/\/+$/, '')}/api`

function makePdf(): Buffer {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  for (const body of objects) {
    offsets.push(Buffer.byteLength(pdf, 'latin1'))
    pdf += `${offsets.length} 0 obj\n${body}\nendobj\n`
  }
  const xrefStart = Buffer.byteLength(pdf, 'latin1')
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
  return Buffer.from(pdf, 'latin1')
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init)
  const text = await res.text()
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}: ${text.slice(0, 300)}`)
  return JSON.parse(text) as T
}

async function main() {
  console.log(`[api] base = ${API_BASE}`)

  const castings = await fetchJson<Array<{ id: string; title: string; roundId?: string }>>('/castings')
  const target = castings.find(c => c.roundId)
  if (!target?.roundId) throw new Error('No open casting with a round found')
  const { id: castingId, roundId, title } = target
  console.log(`[round] using "${title}" (casting=${castingId}, round=${roundId})`)

  const fileName = `director-script-${Date.now()}.pdf`
  const pdf = makePdf()
  console.log(`[pdf] generated ${pdf.length} bytes`)

  console.log('[blob] uploading via @vercel/blob/client (handleUploadUrl=/api/upload)')
  const { url } = await upload(fileName, pdf, {
    handleUploadUrl: `${API_BASE}/upload`,
    access: 'public',
    clientPayload: JSON.stringify({
      fileName,
      fileType: 'application/pdf',
      fileSize: pdf.length,
    }),
  })
  console.log(`[blob] uploaded -> ${url}`)

  console.log('[attachment] persisting to /rounds/attachment')
  const attachment = await fetchJson<{ id: string; fileName: string; fileType: string; url: string }>('/rounds/attachment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roundId,
      fileName,
      fileType: 'application/pdf',
      url,
      fileSize: pdf.length,
    }),
  })
  console.log(`[attachment] persisted id=${attachment.id} file=${attachment.fileName}`)

  const list = await fetchJson<Array<{ id: string; fileName: string }>>(`/rounds/attachments?roundId=${encodeURIComponent(roundId)}`)
  const confirmed = list.find(a => a.id === attachment.id)
  console.log(`[verify] attachment listed under round: ${confirmed ? `YES (${confirmed.fileName})` : 'NO'}`)
  if (!confirmed) throw new Error('Attachment was not returned by GET /rounds/attachments')

  console.log('\n✅ Document upload pipeline verified (Blob upload -> persistence -> listing)')
}

main().catch(err => {
  console.error(`\n❌ ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
})
