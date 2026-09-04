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
 * Uploads a file buffer directly to Cloudinary
 * @param buffer - File data in memory
 * @param folder - Cloudinary folder name (defaults to 'npcrwanda')
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'npcrwanda'
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload to Cloudinary failed'));
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          bytes: result.bytes,
          format: result.format,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export { cloudinary };
