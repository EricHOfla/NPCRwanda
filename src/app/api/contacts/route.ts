import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Contact Message validation schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().default('General Query'),
  message: z.string().min(1, 'Message is required'),
  date: z.string().optional(),
});

// GET: Fetch list of inbox messages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const read = searchParams.get('read');

    const whereClause: any = {};
    if (read !== null && read !== undefined && read !== '') {
      whereClause.read = read === 'true';
    }

    const messages = await prisma.contactMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Fetch contact messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact messages' },
      { status: 500 }
    );
  }
}

// POST: Submit a new contact message (anonymous public endpoint)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    // Set readable date string if not provided
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const formattedDate = `${months[now.getMonth()]} ${now.getFullYear()}`;

    const newMessage = await prisma.contactMessage.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        subject: result.data.subject,
        message: result.data.message,
        date: result.data.date || formattedDate,
        read: false,
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Create contact message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
