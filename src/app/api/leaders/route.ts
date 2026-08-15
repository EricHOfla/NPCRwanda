import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch leadership list
export async function GET() {
  try {
    const leadership = await prisma.leader.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(leadership);
  } catch (error) {
    console.error('Fetch leaders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaders' },
      { status: 500 }
    );
  }
}

// POST: Create a new leader
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, desc, avatar, committee, email, phone, impairment } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!role || role.trim().length === 0) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }
    if (!desc || desc.trim().length === 0) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const newLeader = await prisma.leader.create({
      data: {
        name: name.trim(),
        role: role.trim(),
        desc: desc.trim(),
        avatar: avatar || 'avatar-4.svg',
        committee: committee || 'Board of Directors',
        email: email ? email.trim() : null,
        phone: phone ? phone.trim() : null,
        impairment: impairment ? impairment.trim() : null,
      },
    });

    return NextResponse.json(newLeader, { status: 201 });
  } catch (error) {
    console.error('Create leader error:', error);
    return NextResponse.json(
      { error: 'Failed to create leader' },
      { status: 500 }
    );
  }
}
