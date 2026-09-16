import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getSessionUser } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export const maxDuration = 60; // 60 seconds max execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const category = (formData.get('folder') as string) || (formData.get('category') as string) || 'site';
    const entity = (formData.get('entity') as string) || '';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Accurately determine MIME type from file.type or extension
    const ext = path.extname(file.name || '').toLowerCase();
    const mimeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.rtf': 'application/rtf',
      '.odt': 'application/vnd.oasis.opendocument.text',
      '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
      '.odp': 'application/vnd.oasis.opendocument.presentation',
      '.zip': 'application/zip',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.gif': 'image/gif',
    };
    const mimeType = (file.type && file.type !== 'application/octet-stream') 
      ? file.type 
      : (mimeMap[ext] || file.type || 'application/octet-stream');

    let fileUrl: string;

    // Try Cloudinary upload first
    try {
      const cloudinaryResult = await uploadToCloudinary(buffer, mimeType, category, entity, file.name);
      fileUrl = cloudinaryResult.url;
    } catch (cloudErr: any) {
      console.warn('Cloudinary upload failed, falling back to local storage:', cloudErr?.message || cloudErr);

      // Fallback to local storage if Cloudinary is unreachable
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFilename = `${timestamp}_${sanitizedFilename}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      await fs.writeFile(filePath, buffer);
      fileUrl = `/uploads/${uniqueFilename}`;
    }

    // Save record to DB
    const media = await prisma.mediaAsset.create({
      data: {
        filename: file.name,
        url: fileUrl,
        fileSize: buffer.length,
        mimeType: mimeType,
      },
    });

    return NextResponse.json(media);
  } catch (error: any) {
    console.error('File upload route error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}
