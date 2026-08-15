import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch a single leader
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leader = await prisma.leader.findUnique({
      where: { id },
    });

    if (!leader) {
      return NextResponse.json({ error: 'Leader not found' }, { status: 404 });
    }

    return NextResponse.json(leader);
  } catch (error) {
    console.error('Fetch leader by id error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leader' },
      { status: 500 }
    );
  }
}

// PUT: Update a leader record
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, role, desc, avatar, committee, email, phone, impairment } = body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (role !== undefined) updateData.role = role.trim();
    if (desc !== undefined) updateData.desc = desc.trim();
    if (avatar !== undefined) updateData.avatar = avatar;
    if (committee !== undefined) updateData.committee = committee;
    if (email !== undefined) updateData.email = email ? email.trim() : null;
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (impairment !== undefined) updateData.impairment = impairment ? impairment.trim() : null;

    const updatedLeader = await prisma.leader.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedLeader);
  } catch (error) {
    console.error('Update leader error:', error);
    return NextResponse.json(
      { error: 'Failed to update leader' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a leader record
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.leader.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Leader deleted successfully' });
  } catch (error) {
    console.error('Delete leader error:', error);
    return NextResponse.json(
      { error: 'Failed to delete leader' },
      { status: 500 }
    );
  }
}
