import * as FileSystem from 'expo-file-system/legacy';
import type { PickedImage, PickedImageSource } from './imagePicker';
import { getOwnerId, getSupabaseClient, hasSupabaseConfig } from './supabase';

export const DESIGN_INPUTS_BUCKET = 'design-inputs';

export type UploadDesignInputResult = {
  storagePath: string;
  publicUrl: string;
  width: number;
  height: number;
  mimeType: string;
  source: PickedImageSource;
};

export class StorageUploadError extends Error {
  code: 'missing_image' | 'upload_failed' | 'network_error' | 'too_large' | 'bucket_not_found';

  constructor(
    message: string,
    code: 'missing_image' | 'upload_failed' | 'network_error' | 'too_large' | 'bucket_not_found'
  ) {
    super(message);
    this.code = code;
  }
}

const DEFAULT_MOCK_URL =
  'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600';

const NETWORK_ERROR_MESSAGE =
  "Couldn't upload this photo. Please check your connection and try again.";

const BUCKET_NOT_FOUND_MESSAGE =
  'Storage bucket not found. Create the design-inputs bucket in Supabase.';

const STORAGE_POLICY_MESSAGE =
  'Storage upload blocked. Add upload policies for the design-inputs bucket in Supabase.';

function logUploadDiag(message: string, details?: Record<string, string | number | boolean>): void {
  if (!__DEV__) return;
  if (details) {
    console.log(`[SpaceFlip Pro][Storage] ${message}`, details);
    return;
  }
  console.log(`[SpaceFlip Pro][Storage] ${message}`);
}

export function buildStoragePath(userId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_') || 'photo.jpg';
  return `users/${userId}/inputs/${Date.now()}-${safeName}`;
}

export function getPublicImageUrl(storagePath: string): string {
  const client = getSupabaseClient();
  if (!client) {
    return storagePath.startsWith('http') || storagePath.startsWith('file://')
      ? storagePath
      : DEFAULT_MOCK_URL;
  }

  const { data } = client.storage.from(DESIGN_INPUTS_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function isRemoteUri(uri: string): boolean {
  return uri.startsWith('http://') || uri.startsWith('https://');
}

function isLocalUri(uri: string): boolean {
  return (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('ph://') ||
    uri.startsWith('assets-library://')
  );
}

/**
 * Converts a React Native / Expo image URI into bytes Supabase Storage can upload.
 * Uses fetch for remote URLs, then fetch for local file:// URIs, with expo-file-system fallback.
 */
async function readLocalUriWithFileSystem(uri: string): Promise<ArrayBuffer> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const buffer = base64ToArrayBuffer(base64);
  if (buffer.byteLength === 0) {
    throw new StorageUploadError(
      'Could not read the selected photo. Please try another image.',
      'network_error'
    );
  }
  logUploadDiag('Local URI converted via FileSystem', { byteLength: buffer.byteLength, uriScheme: uri.split(':')[0] });
  return buffer;
}

async function uriToUploadBody(uri: string): Promise<ArrayBuffer> {
  if (isRemoteUri(uri)) {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        console.warn('[SpaceFlip Pro] Remote photo fetch failed:', {
          uri,
          status: response.status,
          statusText: response.statusText,
        });
        throw new StorageUploadError(NETWORK_ERROR_MESSAGE, 'network_error');
      }
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength === 0) {
        throw new StorageUploadError(NETWORK_ERROR_MESSAGE, 'network_error');
      }
      logUploadDiag('Remote URI converted to ArrayBuffer', { byteLength: buffer.byteLength });
      return buffer;
    } catch (error) {
      if (error instanceof StorageUploadError) throw error;
      console.warn('[SpaceFlip Pro] Remote photo fetch error:', error);
      throw new StorageUploadError(NETWORK_ERROR_MESSAGE, 'network_error');
    }
  }

  if (isLocalUri(uri)) {
    // iOS camera/gallery URIs are most reliable via expo-file-system (fetch(file://) often fails).
    if (uri.startsWith('file://') || uri.startsWith('ph://') || uri.startsWith('assets-library://')) {
      try {
        return await readLocalUriWithFileSystem(uri);
      } catch (error) {
        if (error instanceof StorageUploadError) {
          console.warn('[SpaceFlip Pro] FileSystem read failed:', { uri, message: error.message });
        } else {
          console.warn('[SpaceFlip Pro] FileSystem read failed:', { uri, error });
        }
      }
    }

    try {
      const response = await fetch(uri);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > 0) {
          logUploadDiag('Local URI converted via fetch', { byteLength: buffer.byteLength });
          return buffer;
        }
      }
    } catch (error) {
      console.warn('[SpaceFlip Pro] fetch(local URI) failed:', { uri, error });
    }

    try {
      return await readLocalUriWithFileSystem(uri);
    } catch (error) {
      if (error instanceof StorageUploadError) throw error;
      console.warn('[SpaceFlip Pro] Local photo read failed:', { uri, error });
      throw new StorageUploadError(NETWORK_ERROR_MESSAGE, 'network_error');
    }
  }

  throw new StorageUploadError(
    'Could not read the selected photo. Please try another image.',
    'network_error'
  );
}

function mapSupabaseUploadError(error: { message?: string; statusCode?: string | number }): StorageUploadError {
  const message = (error.message ?? '').toLowerCase();
  const statusCode = String(error.statusCode ?? '');

  if (
    message.includes('bucket not found') ||
    message.includes('does not exist') ||
    (message.includes('not found') && message.includes('bucket'))
  ) {
    return new StorageUploadError(BUCKET_NOT_FOUND_MESSAGE, 'bucket_not_found');
  }

  if (
    statusCode === '403' ||
    message.includes('row-level security') ||
    message.includes('policy') ||
    message.includes('unauthorized') ||
    message.includes('permission denied')
  ) {
    return new StorageUploadError(STORAGE_POLICY_MESSAGE, 'upload_failed');
  }

  if (
    message.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('timeout')
  ) {
    return new StorageUploadError(NETWORK_ERROR_MESSAGE, 'network_error');
  }

  return new StorageUploadError(NETWORK_ERROR_MESSAGE, 'upload_failed');
}

function buildMockUploadResult(image: PickedImage, userId: string): UploadDesignInputResult {
  const fileName = image.fileName ?? `${image.source}-${Date.now()}.jpg`;
  const storagePath = buildStoragePath(userId, fileName);
  const publicUrl =
    image.uri.startsWith('http') ||
    image.uri.startsWith('file://') ||
    image.uri.startsWith('content://')
      ? image.uri
      : DEFAULT_MOCK_URL;

  logUploadDiag('Mock upload fallback (Supabase not configured)', {
    storagePath,
    source: image.source,
  });

  return {
    storagePath,
    publicUrl,
    width: image.width,
    height: image.height,
    mimeType: image.mimeType,
    source: image.source,
  };
}

/** Demo photos are remote URLs — never upload them to Supabase Storage. */
function buildDemoUploadResult(image: PickedImage): UploadDesignInputResult {
  const publicUrl = image.uri.startsWith('http') ? image.uri : DEFAULT_MOCK_URL;

  logUploadDiag('Skipping upload for demo photo', {
    publicUrl,
    source: image.source,
  });

  if (__DEV__) {
    console.log('[SpaceFlip Pro][Storage] Skipping upload for demo photo');
  }

  return {
    storagePath: '',
    publicUrl,
    width: image.width,
    height: image.height,
    mimeType: image.mimeType,
    source: image.source,
  };
}

async function uploadDesignInputImageSupabase(
  image: PickedImage,
  userId: string
): Promise<UploadDesignInputResult> {
  const client = getSupabaseClient();
  if (!client) {
    return buildMockUploadResult(image, userId);
  }

  const fileName = image.fileName ?? `${image.source}-${Date.now()}.jpg`;
  const storagePath = buildStoragePath(userId, fileName);
  const mimeType = image.mimeType || 'image/jpeg';

  logUploadDiag('Upload started', {
    bucket: DESIGN_INPUTS_BUCKET,
    storagePath,
    mimeType,
    source: image.source,
  });

  const body = await uriToUploadBody(image.uri);

  const { error } = await client.storage.from(DESIGN_INPUTS_BUCKET).upload(storagePath, body, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    logUploadDiag('Upload failed', {
      message: error.message,
      statusCode: error.statusCode ?? 'unknown',
      name: error.name ?? 'StorageError',
    });
    console.warn('[SpaceFlip Pro] Supabase upload failed:', {
      message: error.message,
      statusCode: error.statusCode ?? 'unknown',
      name: error.name ?? 'StorageError',
      bucket: DESIGN_INPUTS_BUCKET,
      storagePath,
      source: image.source,
    });
    throw mapSupabaseUploadError(error);
  }

  const publicUrl = getPublicImageUrl(storagePath);
  logUploadDiag('Upload success', { storagePath, publicUrl });

  return {
    storagePath,
    publicUrl,
    width: image.width,
    height: image.height,
    mimeType,
    source: image.source,
  };
}

export async function uploadDesignInputImage(
  image: PickedImage,
  userId = getOwnerId()
): Promise<UploadDesignInputResult> {
  if (!image?.uri) {
    throw new StorageUploadError('No photo selected. Please choose an image first.', 'missing_image');
  }

  if (image.source === 'demo') {
    return buildDemoUploadResult(image);
  }

  if (!hasSupabaseConfig()) {
    return buildMockUploadResult(image, userId);
  }

  return uploadDesignInputImageSupabase(image, userId);
}

export async function deleteDesignInputImage(storagePath: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client || !hasSupabaseConfig()) {
    return;
  }

  const { error } = await client.storage.from(DESIGN_INPUTS_BUCKET).remove([storagePath]);
  if (error) {
    console.warn('[SpaceFlip Pro] Failed to delete storage object:', error.message);
  }
}

/** @deprecated Use uploadDesignInputImage instead */
export async function uploadRoomPhoto(
  localUri: string,
  userId = getOwnerId()
): Promise<{
  id: string;
  userId: string;
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  createdAt: string;
}> {
  const result = await uploadDesignInputImage(
    {
      uri: localUri,
      width: 0,
      height: 0,
      mimeType: 'image/jpeg',
      source: localUri.startsWith('http') ? 'demo' : 'gallery',
    },
    userId
  );

  return {
    id: `photo-${Date.now()}`,
    userId,
    storagePath: result.storagePath,
    publicUrl: result.publicUrl,
    mimeType: result.mimeType,
    createdAt: new Date().toISOString(),
  };
}

/** @deprecated Kept for generation.ts re-export compatibility */
export async function uploadRoomPhotoMock(
  localUri: string,
  userId = getOwnerId()
): Promise<{
  id: string;
  userId: string;
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  createdAt: string;
}> {
  return uploadRoomPhoto(localUri, userId);
}
