import type { UploadedPhoto } from '../types/database';
import { isBackendLive } from './config';
import { getSupabaseClient } from './supabase';

const MOCK_UPLOADS = new Map<string, UploadedPhoto>();

const DEFAULT_MOCK_URL =
  'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600';

function createId(): string {
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function uploadRoomPhotoMock(
  localUri: string,
  userId = 'mock-user'
): Promise<UploadedPhoto> {
  const id = createId();
  const photo: UploadedPhoto = {
    id,
    userId,
    storagePath: `room-photos/${userId}/${id}.jpg`,
    publicUrl: localUri.startsWith('http') ? localUri : DEFAULT_MOCK_URL,
    mimeType: 'image/jpeg',
    createdAt: new Date().toISOString(),
  };
  MOCK_UPLOADS.set(id, photo);
  return photo;
}

async function uploadRoomPhotoSupabase(
  localUri: string,
  userId: string
): Promise<UploadedPhoto> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client unavailable');

  const id = createId();
  const storagePath = `${userId}/${id}.jpg`;
  // Future: convert localUri to blob and client.storage.from('room-photos').upload(...)
  await client.storage.from('room-photos').upload(storagePath, localUri);
  const { data } = client.storage.from('room-photos').getPublicUrl(storagePath);

  return {
    id,
    userId,
    storagePath: `room-photos/${storagePath}`,
    publicUrl: data.publicUrl,
    mimeType: 'image/jpeg',
    createdAt: new Date().toISOString(),
  };
}

export async function uploadRoomPhoto(
  localUri: string,
  userId = 'mock-user'
): Promise<UploadedPhoto> {
  if (isBackendLive()) {
    try {
      return await uploadRoomPhotoSupabase(localUri, userId);
    } catch {
      return uploadRoomPhotoMock(localUri, userId);
    }
  }
  return uploadRoomPhotoMock(localUri, userId);
}

export function getUploadedPhotoMock(id: string): UploadedPhoto | undefined {
  return MOCK_UPLOADS.get(id);
}
