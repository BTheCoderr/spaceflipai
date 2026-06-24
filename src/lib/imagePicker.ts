import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Asset } from 'expo-asset';
import type { ExamplePropertyPhoto } from '../data/examplePropertyPhotos';

export type PickedImageSource = 'camera' | 'gallery' | 'example';

export type PickedImage = {
  uri: string;
  width: number;
  height: number;
  fileName?: string;
  mimeType: string;
  fileSize?: number;
  source: PickedImageSource;
};

export class ImagePickerError extends Error {
  code: 'permission_denied' | 'cancelled' | 'too_large' | 'manipulation_failed' | 'unknown';

  constructor(
    message: string,
    code: 'permission_denied' | 'cancelled' | 'too_large' | 'manipulation_failed' | 'unknown'
  ) {
    super(message);
    this.code = code;
  }
}

const MAX_LONG_EDGE = 1400;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const JPEG_QUALITY = 0.85;

export function isLocalImageUri(uri: string): boolean {
  return (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('ph://') ||
    uri.startsWith('assets-library://')
  );
}

export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

export function normalizePickedImage(
  asset: ImagePicker.ImagePickerAsset,
  source: 'camera' | 'gallery'
): PickedImage {
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    fileName: asset.fileName ?? undefined,
    mimeType: asset.mimeType ?? 'image/jpeg',
    fileSize: asset.fileSize,
    source,
  };
}

export async function resizeImageForUpload(image: PickedImage): Promise<PickedImage> {
  const longEdge = Math.max(image.width, image.height);

  if (image.fileSize && image.fileSize > MAX_INPUT_BYTES && longEdge <= MAX_LONG_EDGE) {
    throw new ImagePickerError(
      'That photo is too large. Please choose a smaller image or take a new photo.',
      'too_large'
    );
  }

  try {
    const resizeAction =
      longEdge > MAX_LONG_EDGE
        ? image.width >= image.height
          ? { resize: { width: MAX_LONG_EDGE } }
          : { resize: { height: MAX_LONG_EDGE } }
        : null;

    const result = await ImageManipulator.manipulateAsync(
      image.uri,
      resizeAction ? [resizeAction] : [],
      { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
    );

    return {
      ...image,
      uri: result.uri,
      width: result.width,
      height: result.height,
      mimeType: 'image/jpeg',
      fileName: image.fileName?.replace(/\.\w+$/, '.jpg') ?? `photo-${Date.now()}.jpg`,
    };
  } catch {
    throw new ImagePickerError(
      'We could not prepare your photo. Please try another image.',
      'manipulation_failed'
    );
  }
}

async function processAsset(
  asset: ImagePicker.ImagePickerAsset,
  source: 'camera' | 'gallery'
): Promise<PickedImage> {
  let picked = normalizePickedImage(asset, source);
  picked = await resizeImageForUpload(picked);
  return picked;
}

export async function pickImageFromCamera(): Promise<PickedImage | null> {
  const granted = await requestCameraPermission();
  if (!granted) {
    throw new ImagePickerError(
      'Camera access is needed to take a room photo. You can enable it in your device Settings.',
      'permission_denied'
    );
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return processAsset(result.assets[0], 'camera');
}

export async function pickImageFromGallery(): Promise<PickedImage | null> {
  const granted = await requestMediaLibraryPermission();
  if (!granted) {
    throw new ImagePickerError(
      'Photo library access is needed to choose a room photo. You can enable it in your device Settings.',
      'permission_denied'
    );
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return processAsset(result.assets[0], 'gallery');
}

/**
 * Resolves a bundled Example Property Photo into a local file URI the app can
 * preview and upload. The asset ships inside the app — nothing is fetched from
 * a remote stock source at runtime.
 */
export async function examplePhotoToPickedImage(
  photo: Pick<ExamplePropertyPhoto, 'id' | 'asset'>
): Promise<PickedImage> {
  const asset = Asset.fromModule(photo.asset);
  if (!asset.localUri) {
    await asset.downloadAsync();
  }
  const uri = asset.localUri ?? asset.uri;
  return {
    uri,
    width: asset.width ?? 0,
    height: asset.height ?? 0,
    fileName: `${photo.id}.jpg`,
    mimeType: 'image/jpeg',
    source: 'example',
  };
}

export function formatSourceLabel(source: PickedImageSource): string {
  switch (source) {
    case 'camera':
      return 'Camera';
    case 'gallery':
      return 'Gallery';
    case 'example':
      return 'Example photo';
  }
}

export function handleImagePickerError(error: unknown): void {
  if (error instanceof ImagePickerError) {
    if (error.code === 'permission_denied') {
      Alert.alert('Permission needed', error.message);
      return;
    }
    if (error.code === 'cancelled') {
      return;
    }
    Alert.alert('Photo error', error.message);
    return;
  }
  Alert.alert('Photo error', 'Something went wrong while selecting your photo.');
}
