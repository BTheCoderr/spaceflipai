import type { PickedImage, PickedImageSource } from './imagePicker';
import { getSupabaseClient, hasSupabaseConfig } from './supabase';

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
  code: 'missing_image' | 'upload_failed' | 'network_error' | 'too_large';

  constructor(
    message: string,
    code: 'missing_image' | 'upload_failed' | 'network_error' | 'too_large'
  ) {
    super(message);
    this.code = code;
  }
}

const DEFAULT_MOCK_URL =
  'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600';

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

async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new StorageUploadError(
        'Could not read the selected photo. Please try another image.',
        'network_error'
      );
    }
    return response.arrayBuffer();
  } catch (error) {
    if (error instanceof StorageUploadError) throw error;
    throw new StorageUploadError(
      'Network error while preparing your photo. Check your connection and try again.',
      'network_error'
    );
  }
}

function buildMockUploadResult(image: PickedImage, userId: string): UploadDesignInputResult {
  const fileName = image.fileName ?? `${image.source}-${Date.now()}.jpg`;
  const storagePath = buildStoragePath(userId, fileName);
  const publicUrl =
    image.uri.startsWith('http') || image.uri.startsWith('file://') || image.uri.startsWith('content://')
      ? image.uri
      : DEFAULT_MOCK_URL;

  if (__DEV__) {
    console.warn('[SpaceFlip] Supabase not configured — using local mock upload result.');
  }

  return {
    storagePath,
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

  try {
    const body = await uriToArrayBuffer(image.uri);
    const { error } = await client.storage.from(DESIGN_INPUTS_BUCKET).upload(storagePath, body, {
      contentType: image.mimeType || 'image/jpeg',
      upsert: false,
    });

    if (error) {
      console.warn('[SpaceFlip] Supabase upload failed:', error.message);
      throw new StorageUploadError(
        'We could not upload your photo. Please try again.',
        'upload_failed'
      );
    }

    return {
      storagePath,
      publicUrl: getPublicImageUrl(storagePath),
      width: image.width,
      height: image.height,
      mimeType: image.mimeType,
      source: image.source,
    };
  } catch (error) {
    if (error instanceof StorageUploadError) throw error;
    console.warn('[SpaceFlip] Unexpected upload error:', error);
    throw new StorageUploadError(
      'We could not upload your photo. Please try again.',
      'upload_failed'
    );
  }
}

export async function uploadDesignInputImage(
  image: PickedImage,
  userId = 'demo-user'
): Promise<UploadDesignInputResult> {
  if (!image?.uri) {
    throw new StorageUploadError('No photo selected. Please choose an image first.', 'missing_image');
  }

  if (!hasSupabaseConfig()) {
    return buildMockUploadResult(image, userId);
  }

  try {
    return await uploadDesignInputImageSupabase(image, userId);
  } catch (error) {
    if (error instanceof StorageUploadError) {
      throw error;
    }
    console.warn('[SpaceFlip] Upload failed, falling back to mock result:', error);
    return buildMockUploadResult(image, userId);
  }
}

export async function deleteDesignInputImage(storagePath: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client || !hasSupabaseConfig()) {
    return;
  }

  const { error } = await client.storage.from(DESIGN_INPUTS_BUCKET).remove([storagePath]);
  if (error) {
    console.warn('[SpaceFlip] Failed to delete storage object:', error.message);
  }
}

/** @deprecated Use uploadDesignInputImage instead */
export async function uploadRoomPhoto(
  localUri: string,
  userId = 'demo-user'
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
  userId = 'demo-user'
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
