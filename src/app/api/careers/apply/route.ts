import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

async function ensureJobApplicationTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "JobApplication" (
        "id"          TEXT NOT NULL,
        "careerId"    TEXT,
        "careerTitle" TEXT NOT NULL,
        "fullName"    TEXT NOT NULL,
        "email"       TEXT NOT NULL,
        "phone"       TEXT NOT NULL,
        "coverLetter" TEXT NOT NULL,
        "resumeUrl"   TEXT,
        "status"      TEXT NOT NULL DEFAULT 'Pending',
        "read"        BOOLEAN NOT NULL DEFAULT false,
        "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
      )
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "JobApplication_careerId_idx" ON "JobApplication"("careerId")
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "JobApplication_read_idx" ON "JobApplication"("read")
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "JobApplication_status_idx" ON "JobApplication"("status")
    `;
  } catch (e) {
    // Table or index may already exist
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureJobApplicationTable();

    const contentType = request.headers.get('content-type') || '';
    let careerId: string | null = null;
    let careerTitle = '';
    let fullName = '';
    let email = '';
    let phone = '';
    let coverLetter = '';
    let resumeUrl: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      careerId = (formData.get('careerId') as string) || null;
      careerTitle = (formData.get('careerTitle') as string) || 'General Application';
      fullName = (formData.get('fullName') as string) || '';
      email = (formData.get('email') as string) || '';
      phone = (formData.get('phone') as string) || '';
      coverLetter = (formData.get('coverLetter') as string) || '';

      const resumeFile = formData.get('resume') as File | null;
      if (resumeFile && resumeFile.size > 0) {
        // Validate max 10MB
        if (resumeFile.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: 'Resume file size exceeds 10MB limit.' }, { status: 400 });
        }

        const ext = path.extname(resumeFile.name || '').toLowerCase();
        const allowedExts = ['.pdf', '.doc', '.docx', '.rtf', '.txt'];
        if (!allowedExts.includes(ext)) {
          return NextResponse.json({ error: 'Please upload a PDF or Word document (.pdf, .doc, .docx).' }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
        await fs.mkdir(uploadDir, { recursive: true });

        const safeBase = path.basename(resumeFile.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `${safeBase}_${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, fileName);

        const bytes = await resumeFile.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(bytes));
        resumeUrl = `/uploads/resumes/${fileName}`;
      }
    } else {
      const body = await request.json();
      careerId = body.careerId || null;
      careerTitle = body.careerTitle || 'General Application';
      fullName = body.fullName || '';
      email = body.email || '';
      phone = body.phone || '';
      coverLetter = body.coverLetter || '';
      resumeUrl = body.resumeUrl || null;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim() || !coverLetter.trim()) {
      return NextResponse.json({ error: 'Please provide your full name, email, phone number, and cover letter.' }, { status: 400 });
    }

    // Create the JobApplication record
    const application = await prisma.jobApplication.create({
      data: {
        careerId,
        careerTitle,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        coverLetter: coverLetter.trim(),
        resumeUrl,
        status: 'Pending',
        read: false,
      },
    });

    // If linked to an existing career, increment applicants count
    if (careerId) {
      try {
        await prisma.career.update({
          where: { id: careerId },
          data: { applicants: { increment: 1 } },
        });
      } catch (err) {
        // If career ID doesn't match a record, proceed gracefully
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully.',
      application,
    });
  } catch (error: any) {
    console.error('Error submitting job application:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}
