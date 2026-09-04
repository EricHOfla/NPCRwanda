import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'b4dd6lyg',
  api_key: process.env.CLOUDINARY_API_KEY || '839493269412152',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Kp-_OWOgu5sic_1jlEPLwkecJ10',
  secure: true,
});

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
  bytes: number;
  format?: string;
}

/**
 * Builds standard Cloudinary folder path adhering to:
 * npc-rwanda/
 * ├── athletes/
 * │   └── <athlete-id-or-name>/
 * ├── news/
 * │   └── <article-id-or-slug>/
 * ├── events/
 * │   └── <event-id-or-slug>/
 * ├── partners/
 * ├── leaders/
 * └── site/
 */
export function buildCloudinaryFolder(category: string = 'site', entity?: string): string {
  const root = 'npc-rwanda';
  const cleanCategory = category.trim().toLowerCase().replace(/^\/+|\/+$/g, '') || 'site';

  if (entity && entity.trim()) {
    const cleanEntity = entity
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `${root}/${cleanCategory}/${cleanEntity}`;
  }

  return `${root}/${cleanCategory}`;
}

/**
 * Uploads a file buffer directly to Cloudinary using Base64 Data URI for maximum speed and stability.
 * @param buffer - File data in memory
 * @param mimeType - File mime type
 * @param category - Category folder ('athletes' | 'news' | 'events' | 'partners' | 'leaders' | 'site')
 * @param entity - Optional subfolder/entity identifier (e.g. 'athlete-1', 'article-1')
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  mimeType: string = 'image/jpeg',
  category: string = 'site',
  entity?: string
): Promise<CloudinaryUploadResult> {
  const folder = category.startsWith('npc-rwanda')
    ? category
    : buildCloudinaryFolder(category, entity);

  const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(base64Data, {
    folder,
    resource_type: 'auto',
    timeout: 30000,
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
    bytes: result.bytes,
    format: result.format,
  };
}

export { cloudinary };
