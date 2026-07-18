import { post, get } from './api'

export interface AttachmentDTO {
  id: string
  roundId: string
  fileName: string
  fileType: string
  fileData: string
  fileSize: number
  createdAt: string
}

export interface AddAttachmentInput {
  roundId: string
  fileName: string
  fileType: string
  fileData: string
  fileSize: number
}

let localAttachments: AttachmentDTO[] = []

export async function fetchAttachments(roundId: string): Promise<AttachmentDTO[]> {
  const data = await get<AttachmentDTO[]>(`/rounds/attachments?roundId=${roundId}`).catch(() => null)
  if (data) {
    localAttachments = [...localAttachments.filter(a => a.roundId !== roundId), ...data]
    return data
  }
  return localAttachments.filter(a => a.roundId === roundId)
}

export async function addAttachment(input: AddAttachmentInput): Promise<AttachmentDTO> {
  const newAttachment: AttachmentDTO = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...input,
    createdAt: new Date().toISOString(),
  }
  const result = await post<AttachmentDTO>('/rounds/attachment', input).catch(() => null)
  if (result) {
    localAttachments.push(result)
    return result
  }
  localAttachments.push(newAttachment)
  return newAttachment
}

export function downloadAttachment(attachment: AttachmentDTO) {
  const link = document.createElement('a')
  link.href = attachment.fileData.startsWith('data:') ? attachment.fileData : `data:${attachment.fileType};base64,${attachment.fileData}`
  link.download = attachment.fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
