import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from './env';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

export function getUploadsDir() {
  return UPLOADS_DIR;
}

export async function uploadToStorage(buffer: Buffer, mimeType: string, folder: string) {
  const extension = mimeType.split('/')[1] || 'bin';
  const key = `${folder}/${uuidv4()}.${extension}`;

  if (!env.cloudinary.url || !env.cloudinary.preset) {
    const dest = path.join(UPLOADS_DIR, key);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buffer);
    return `/uploads/${key}`;
  }

  const formData = new FormData();
  const file = new File([buffer], key, { type: mimeType });
  formData.append('file', file);
  formData.append('upload_preset', env.cloudinary.preset);
  formData.append('folder', folder);
  formData.append('public_id', key.replace(/\.[^.]+$/, ''));

  if (env.cloudinary.apiKey) {
    formData.append('api_key', env.cloudinary.apiKey);
  }

  const response = await fetch(env.cloudinary.url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed with status ${response.status}`);
  }

  const payload = await response.json() as {
    secure_url?: string;
    url?: string;
    public_id?: string;
  };

  return payload.secure_url || payload.url || payload.public_id || `/uploads/${key}`;
}

export async function getPresignedUrl(key: string, expiresIn = 3600) {
  void expiresIn;
  return key;
}

export async function deleteFromStorage(key: string) {
  if (key.startsWith('/uploads/')) {
    const filePath = path.join(UPLOADS_DIR, key.replace('/uploads/', ''));
    fs.unlink(filePath, () => {});
  }
}
