import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import type { PendingUpload } from "~/types";
import { fileNameFromUri } from "~/utils/file";
import { kindFromMime } from "~/utils/mime";

function imageAssetToUpload(asset: ImagePicker.ImagePickerAsset): PendingUpload {
  const mimeType = asset.mimeType ?? "image/jpeg";
  const name = asset.fileName ?? fileNameFromUri(asset.uri);
  return {
    uri: asset.uri,
    text: null,
    name,
    mimeType,
    size: asset.fileSize ?? 0,
    kind: kindFromMime(mimeType),
  };
}

function documentAssetToUpload(asset: DocumentPicker.DocumentPickerAsset): PendingUpload {
  const mimeType = asset.mimeType ?? "application/octet-stream";
  return {
    uri: asset.uri,
    text: null,
    name: asset.name || fileNameFromUri(asset.uri),
    mimeType,
    size: asset.size ?? 0,
    kind: kindFromMime(mimeType),
  };
}

/** File selection sources: gallery/camera (images + video) and documents. */
export function useFilePicker() {
  async function pickImages(): Promise<PendingUpload[]> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return [];
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    return result.canceled ? [] : result.assets.map(imageAssetToUpload);
  }

  async function takePhoto(): Promise<PendingUpload[]> {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return [];
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    return result.canceled ? [] : result.assets.map(imageAssetToUpload);
  }

  async function pickDocuments(): Promise<PendingUpload[]> {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: "*/*",
    });
    return result.canceled ? [] : result.assets.map(documentAssetToUpload);
  }

  return { pickImages, takePhoto, pickDocuments };
}
