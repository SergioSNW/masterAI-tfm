import { Platform, Linking, Alert } from 'react-native'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { get } from './api'

export interface AttachmentDTO {
  id: string
  roundId: string
  fileName: string
  fileType: string
  url: string
  fileSize: number
  createdAt: string
}

export async function fetchAttachments(roundId: string): Promise<AttachmentDTO[]> {
  return get<AttachmentDTO[]>(`/rounds/attachments?roundId=${encodeURIComponent(roundId)}`)
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
