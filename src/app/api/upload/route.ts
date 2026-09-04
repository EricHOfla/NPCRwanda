import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const category = (formData.get('folder') as string) || (formData.get('category') as string) || 'site';
    const entity = (formData.get('entity') as string) || '';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let fileUrl: string;

    // Try Cloudinary upload first with the structured hierarchy
    try {
      const cloudinaryResult = await uploadToCloudinary(buffer, category, entity);
      fileUrl = cloudinaryResult.url;
    } catch (cloudErr) {
      console.warn('Cloudinary upload failed, falling back to local storage:', cloudErr);

      // Fallback to local storage if Cloudinary fails
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
        mimeType: file.type || 'application/octet-stream',
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
