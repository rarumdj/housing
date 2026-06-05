import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from './env';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

export const getUploadsDir = () => {
  return UPLOADS_DIR;
};

const getCloudinaryCloudName = (): string | null => {
  if (env.cloudinary.cloudName) return env.cloudinary.cloudName;
  const match = env.cloudinary.url.match(/\/v1_1\/([^/]+)/);
  return match ? match[1] : null;
};

const isCloudinaryConfigured = (): boolean => {
  return Boolean(env.cloudinary.preset && getCloudinaryCloudName());
};

export const uploadToStorage = async (buffer: Buffer, mimeType: string, folder: string) => {
  const extension = mimeType.split('/')[1] || 'bin';
  const key = `${folder}/${uuidv4()}.${extension}`;

  if (!isCloudinaryConfigured()) {
    const dest = path.join(UPLOADS_DIR, key);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buffer);
    return `/uploads/${key}`;
  }

  const cloudName = getCloudinaryCloudName();
  // `auto` lets images, videos and raw files (e.g. PDFs) all upload through one endpoint.
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const formData = new FormData();
  const file = new File([buffer], `${uuidv4()}.${extension}`, { type: mimeType });
  formData.append('file', file);
  // Unsigned upload: only the preset (and optional folder) — never the api_key,
  // otherwise Cloudinary expects a signature and rejects the request.
  formData.append('upload_preset', env.cloudinary.preset);
  formData.append('folder', folder);

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    secure_url?: string;
    url?: string;
    public_id?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.secure_url) {
    const reason = payload.error?.message || `status ${response.status}`;
    throw new Error(`Cloudinary upload failed: ${reason}`);
  }

  return payload.secure_url;
};

/**
 * Derive a still-frame thumbnail URL for a Cloudinary-hosted video.
 * Cloudinary can render a frame as an image by adding the `so_0` (start offset)
 * transformation and requesting a `.jpg` extension. Returns undefined for
 * non-Cloudinary URLs (e.g. local dev uploads) where this isn't supported.
 */
export const deriveVideoThumbnailUrl = (videoUrl: string): string | undefined => {
  if (!/res\.cloudinary\.com/.test(videoUrl) || !videoUrl.includes('/upload/')) {
    return undefined;
  }

  const withFrame = videoUrl.replace('/upload/', '/upload/so_0/');
  if (/\.(mp4|mov|webm|mkv|avi|m4v|ogv)(\?.*)?$/i.test(withFrame)) {
    return withFrame.replace(/\.(mp4|mov|webm|mkv|avi|m4v|ogv)(\?.*)?$/i, '.jpg');
  }

  return `${withFrame}.jpg`;
};

export const getPresignedUrl = async (key: string, expiresIn = 3600) => {
  void expiresIn;
  return key;
};

export const deleteFromStorage = async (key: string) => {
  if (key.startsWith('/uploads/')) {
    const filePath = path.join(UPLOADS_DIR, key.replace('/uploads/', ''));
    fs.unlink(filePath, () => {});
  }
};
