import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');
  const customName = searchParams.get('name');

  if (!fileUrl || fileUrl === '#') {
    return NextResponse.json({ error: 'No valid document URL provided' }, { status: 400 });
  }

  try {
    let buffer: Buffer;
    let contentType = 'application/octet-stream';
    let downloadFilename = customName || 'document';

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      // Remote file (Cloudinary, external link)
      const res = await fetch(fileUrl);
      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: res.status });
      }
      const arrayBuf = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuf);
      contentType = res.headers.get('content-type') || 'application/octet-stream';

      const urlExt = path.extname(new URL(fileUrl).pathname);
      if (!path.extname(downloadFilename) && urlExt) {
        downloadFilename += urlExt;
      }
    } else {
      // Local file in public/
      const cleanPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
      const filePath = path.join(process.cwd(), 'public', cleanPath);

      buffer = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();

      const mimeMap: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.txt': 'text/plain',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
      };
      contentType = mimeMap[ext] || 'application/octet-stream';

      if (!path.extname(downloadFilename) && ext) {
        downloadFilename += ext;
      }
    }

    const safeFilename = downloadFilename.replace(/[^a-zA-Z0-9._-]/g, '_');

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Download route error:', error);
    return NextResponse.json({ error: error.message || 'Error downloading file' }, { status: 500 });
  }
}
