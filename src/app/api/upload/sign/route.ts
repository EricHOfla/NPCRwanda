import { NextResponse, NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getSessionUser } from '@/lib/auth';
import { buildCloudinaryFolder } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const category = body.category || 'site';
    const entity = body.entity || '';

    const folder = buildCloudinaryFolder(category, entity);
    const timestamp = Math.round(new Date().getTime() / 1000);

    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'Kp-_OWOgu5sic_1jlEPLwkecJ10';
    const apiKey = process.env.CLOUDINARY_API_KEY || '839493269412152';
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'b4dd6lyg';

    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      apiSecret
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error: any) {
    console.error('Sign upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to sign upload request' }, { status: 500 });
  }
}
