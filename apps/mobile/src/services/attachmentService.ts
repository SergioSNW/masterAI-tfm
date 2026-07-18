import { Platform } from 'react-native'

export interface AttachmentDTO {
  id: string
  roundId: string
  fileName: string
  fileType: string
  fileData: string
  fileSize: number
  createdAt: string
}

const MOCK_ATTACHMENTS: Record<string, AttachmentDTO[]> = {
  r1: [
    { id: 'a1', roundId: 'r1', fileName: 'Script_Scene_1.pdf', fileType: 'application/pdf', fileData: '#', fileSize: 245000, createdAt: 'Jul 5, 2026' },
    { id: 'a2', roundId: 'r1', fileName: 'Contract_Draft.pdf', fileType: 'application/pdf', fileData: '#', fileSize: 180000, createdAt: 'Jul 6, 2026' },
  ],
  r2: [
    { id: 'a3', roundId: 'r2', fileName: 'Character_Brief.pdf', fileType: 'application/pdf', fileData: '#', fileSize: 92000, createdAt: 'Jul 8, 2026' },
  ],
}

export async function fetchAttachments(roundId: string): Promise<AttachmentDTO[]> {
  return new Promise(resolve => {
    setTimeout(() => resolve(MOCK_ATTACHMENTS[roundId] ?? []), 400)
  })
}

export function openAttachment(attachment: AttachmentDTO) {
  if (Platform.OS === 'web') {
    const byteChars = atob(attachment.fileData)
    const byteNums = new Array(byteChars.length)
    for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i)
    const byteArr = new Uint8Array(byteNums)
    const blob = new Blob([byteArr], { type: attachment.fileType })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }
}
