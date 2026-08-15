const fs = require('fs');
const path = require('path');

const models = [
  {
    path: 'npc-clubs',
    model: 'npcClub',
    schema: `
const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});
    `
  },
  {
    path: 'npc-federations',
    model: 'npcFederation',
    schema: `
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
    `
  },
  {
    path: 'dpsco-contacts',
    model: 'dpscoContact',
    schema: `
const schema = z.object({
  id: z.string().optional(),
  province: z.string().min(1, 'Province is required'),
  district: z.string().min(1, 'District is required'),
  coordinator: z.string().min(1, 'Coordinator is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email'),
  active: z.boolean().default(true),
});
    `
  }
];

const basePath = path.join(__dirname, 'src', 'app', 'api');

for (const m of models) {
  const dirPath = path.join(basePath, m.path);
  const idDirPath = path.join(dirPath, '[id]');
  
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  if (!fs.existsSync(idDirPath)) fs.mkdirSync(idDirPath, { recursive: true });

  const routeContent = `import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
${m.schema}

export async function GET(request: Request) {
  try {
    const data = await prisma.${m.model}.findMany({
      orderBy: ${m.model === 'dpscoContact' ? "[{ province: 'asc' }, { district: 'asc' }]" : "[{ order: 'asc' }, { createdAt: 'desc' }]"},
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    const result = await prisma.${m.model}.create({ data: parsed });
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
`;

  const idRouteContent = `import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
${m.schema}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json();
    const parsed = schema.parse(body);
    const { id, ...data } = parsed;

    const result = await prisma.${m.model}.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await prisma.${m.model}.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
`;

  fs.writeFileSync(path.join(dirPath, 'route.ts'), routeContent);
  fs.writeFileSync(path.join(idDirPath, 'route.ts'), idRouteContent);
  console.log('Created APIs for', m.path);
}
