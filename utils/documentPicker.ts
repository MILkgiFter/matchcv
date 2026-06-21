import * as DocumentPicker from 'expo-document-picker';
import type { ResumeFile } from '@/types/api';

const PDF = 'application/pdf';
const DOCX =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const TXT = 'text/plain';

export async function pickResumeFile(
  type: 'pdf' | 'docx' | 'any' = 'any',
): Promise<ResumeFile | null> {
  const mimeTypes =
    type === 'pdf'
      ? [PDF]
      : type === 'docx'
        ? [DOCX]
        : [PDF, DOCX, TXT];

  const result = await DocumentPicker.getDocumentAsync({
    type: mimeTypes,
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? (asset.name.endsWith('.txt') ? TXT : PDF);
  return {
    uri: asset.uri,
    name: asset.name,
    mimeType,
    size: asset.size,
  };
}
