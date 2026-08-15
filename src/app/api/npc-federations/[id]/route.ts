import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  logo: z.string().min(1, 'Logo is required'),
  website: z.string().optional().nullable(),
  role: z.string().min(1, 'Role is required'),
  desc: z.string().min(1, 'Description is required'),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});
    

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json();
    const parsed = schema.parse(body);
    const { id, ...data } = parsed;

    const result = await prisma.npcFederation.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await prisma.npcFederation.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
