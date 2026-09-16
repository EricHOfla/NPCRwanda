import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const FALLBACK_PDF_MAP: Record<string, string> = {
  constitution: 'npc-rwanda-constitution.pdf',
  strategic: 'strategic-plan-2024-2028.pdf',
  annual: 'annual-report-2023.pdf',
  audit: 'financial-audit-2023.pdf',
  financial: 'financial-audit-2023.pdf',
  safeguard: 'safeguarding-policy.pdf',
  doping: 'anti-doping-regulations.pdf',
  selection: 'selection-criteria.pdf',
  classification: 'classification-rules.pdf',
};

function getFallbackFile(hint: string): string | null {
  const lower = (hint || '').toLowerCase();
  for (const [key, filename] of Object.entries(FALLBACK_PDF_MAP)) {
    if (lower.includes(key)) {
      return filename;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');
  const customName = searchParams.get('name') || '';

  try {
    let buffer: Buffer | null = null;
    let contentType = 'application/pdf';
    let downloadFilename = customName || 'document.pdf';

    // 1. Try remote fetch if valid http/https URL
    if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
      try {
        const res = await fetch(fileUrl);
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          buffer = Buffer.from(arrayBuf);
          contentType = res.headers.get('content-type') || 'application/pdf';

          const urlExt = path.extname(new URL(fileUrl).pathname);
          if (!path.extname(downloadFilename) && urlExt) {
            downloadFilename += urlExt;
          }
        }
      } catch {
        // Fetch failed, will try fallback below
      }
    }

    // 2. If not remote or remote fetch failed, try local file
    if (!buffer && fileUrl && fileUrl !== '#' && fileUrl.startsWith('/')) {
      const cleanPath = fileUrl.slice(1);
      const filePath = path.join(process.cwd(), 'public', cleanPath);
      try {
        buffer = await fs.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.pdf') contentType = 'application/pdf';
        if (!path.extname(downloadFilename) && ext) {
          downloadFilename += ext;
        }
      } catch {
        // Local path failed, will try fallback below
      }
    }

    // 3. Fallback to bundled governance PDFs by keyword in name or url
    if (!buffer) {
      const fallbackFile = getFallbackFile(customName) || getFallbackFile(fileUrl || '');
      if (fallbackFile) {
        const fallbackPath = path.join(process.cwd(), 'public', 'documents', 'governance', fallbackFile);
        try {
          buffer = await fs.readFile(fallbackPath);
          contentType = 'application/pdf';
          if (!path.extname(downloadFilename)) {
            downloadFilename += '.pdf';
          }
        } catch {
          // Fallback not found on disk
        }
      }
    }

    if (!buffer) {
      return new NextResponse('The requested document is not currently available.', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
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
    return new NextResponse('Error downloading file', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
