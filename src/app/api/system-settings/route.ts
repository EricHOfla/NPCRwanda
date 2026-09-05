import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

// GET: Fetch all system settings as a key-value object
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.systemSetting.findMany();

    // Transform array to key-value record
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    // Fallback/sync from ContactInfo if any contact fields are missing
    const contact = await prisma.contactInfo.findFirst();
    if (contact) {
      if (!settingsMap.contactPhone && contact.phone) settingsMap.contactPhone = contact.phone;
      if (!settingsMap.contactEmail && contact.email) settingsMap.contactEmail = contact.email;
      if (!settingsMap.address && contact.address) settingsMap.address = contact.address;
    }

    // Default fallbacks to guarantee fields are never empty
    if (!settingsMap.siteName) {
      settingsMap.siteName = 'National Paralympic Committee of Rwanda';
    }
    if (!settingsMap.contactEmail) {
      settingsMap.contactEmail = 'info@npcrwanda.org';
    }
    if (!settingsMap.contactPhone) {
      settingsMap.contactPhone = '+250 788 672 739';
    }
    if (!settingsMap.address) {
      settingsMap.address = 'Amahoro Stadium, Kigali';
    }

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('Fetch system settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT: Save/update system settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid input: expected a key-value object' }, { status: 400 });
    }

    const updates = body as Record<string, string>;

    // Perform upserts in a transaction
    await prisma.$transaction(
      Object.entries(updates).map(([key, value]) =>
        prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    // Synchronize contact fields with ContactInfo table so public site and Footer stay updated
    const phone = updates.contactPhone;
    const email = updates.contactEmail;
    const address = updates.address;

    if (phone || email || address) {
      try {
        const existingContact = await prisma.contactInfo.findFirst();
        if (existingContact) {
          await prisma.contactInfo.update({
            where: { id: existingContact.id },
            data: {
              ...(phone ? { phone } : {}),
              ...(email ? { email } : {}),
              ...(address ? { address } : {}),
            },
          });
        } else {
          await prisma.contactInfo.create({
            data: {
              phone: phone || '+250 788 672 739',
              email: email || 'info@npcrwanda.org',
              address: address || 'Amahoro Stadium, Kigali',
              mapUrl: updates.mapUrl || '',
            },
          });
        }
      } catch (contactSyncErr) {
        console.error('Failed to sync contactInfo with systemSettings:', contactSyncErr);
      }
    }

    // Retrieve and return updated settings
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      settings: settingsMap,
      message: 'System settings and contact information saved successfully',
    });
  } catch (error) {
    console.error('Save system settings error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
