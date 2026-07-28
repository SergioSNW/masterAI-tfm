import { Platform, Linking, Alert } from 'react-native'
import * as FileSystem from 'expo-file-system'
import { Sharing } from 'expo-sharing'

export interface AttachmentDTO {
  id: string
  roundId: string
  fileName: string
  fileType: string
  url: string
  fileSize: number
  createdAt: string
}

const MOCK_ATTACHMENTS: Record<string, AttachmentDTO[]> = {
  r1: [
    { id: 'a1', roundId: 'r1', fileName: 'Script_Scene_1.pdf', fileType: 'application/pdf', url: 'https://blob.vercel.storage.com/script.pdf', fileSize: 245000, createdAt: 'Jul 5, 2026' },
    { id: 'a2', roundId: 'r1', fileName: 'Contract_Draft.pdf', fileType: 'application/pdf', url: 'https://blob.vercel.storage.com/contract.pdf', fileSize: 180000, createdAt: 'Jul 6, 2026' },
  ],
  r2: [
    { id: 'a3', roundId: 'r2', fileName: 'Character_Brief.pdf', fileType: 'application/pdf', url: 'https://blob.vercel.storage.com/brief.pdf', fileSize: 92000, createdAt: 'Jul 8, 2026' },
  ],
}

export async function fetchAttachments(roundId: string): Promise<AttachmentDTO[]> {
  return new Promise(resolve => {
    setTimeout(() => resolve(MOCK_ATTACHMENTS[roundId] ?? []), 400)
  })
}

export async function openAttachment(attachment: AttachmentDTO): Promise<void> {
  if (Platform.OS === 'web') {
    window.open(attachment.url, '_blank')
    return
  }

  const cacheUri = `${FileSystem.cacheDirectory}${attachment.fileName}`
  const ext = attachment.fileName.split('.').pop() ?? 'bin'
  const downloadResult = await FileSystem.downloadAsync(attachment.url, cacheUri)

  if (Platform.OS === 'android') {
    const canOpen = await Linking.canOpenURL(downloadResult.uri)
    if (canOpen) {
      await Linking.openURL(downloadResult.uri)
    } else if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(downloadResult.uri, {
        mimeType: attachment.fileType,
        dialogTitle: `Open ${attachment.fileName}`,
        UTI: ext === 'pdf' ? 'com.adobe.pdf' : undefined,
      })
    } else {
      Alert.alert('No viewer found', `Install a PDF viewer to open ${attachment.fileName}`)
    }
  } else {
    await Sharing.shareAsync(downloadResult.uri, { mimeType: attachment.fileType })
  }
}
