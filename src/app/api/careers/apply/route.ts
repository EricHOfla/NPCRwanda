import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendApplicationReceivedEmail } from '@/lib/mailer';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {

    const contentType = request.headers.get('content-type') || '';
    let careerId: string | null = null;
    let careerTitle = '';
    let fullName = '';
    let email = '';
    let phone = '';
    let coverLetter = '';
    let resumeUrl: string | null = null;
    let resumeFileToUpload: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      careerId = (formData.get('careerId') as string) || null;
      careerTitle = (formData.get('careerTitle') as string) || 'General Application';
      fullName = (formData.get('fullName') as string) || '';
      email = (formData.get('email') as string) || '';
      phone = (formData.get('phone') as string) || '';
      coverLetter = (formData.get('coverLetter') as string) || '';

      const honeypot = (formData.get('website_url') as string) || '';
      if (honeypot && honeypot.trim() !== '') {
        return NextResponse.json({ success: true, message: 'Application submitted successfully.' }, { status: 200 });
      }

      const resumeFile = formData.get('resume') as File | null;
      if (resumeFile && resumeFile.size > 0) {
        if (resumeFile.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: 'Resume file size exceeds 10MB limit.' }, { status: 400 });
        }
        const ext = path.extname(resumeFile.name || '').toLowerCase();
        const allowedExts = ['.pdf', '.doc', '.docx', '.rtf', '.txt'];
        if (!allowedExts.includes(ext)) {
          return NextResponse.json({ error: 'Please upload a PDF or Word document (.pdf, .doc, .docx).' }, { status: 400 });
        }
        resumeFileToUpload = resumeFile;
      }
    } else {
      const body = await request.json();
      if (body.website_url && body.website_url.trim() !== '') {
        return NextResponse.json({ success: true, message: 'Application submitted successfully.' }, { status: 200 });
      }
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

    // Verify the selected vacancy against the database; never trust a title/status from the browser.
    if (careerId) {
      const targetCareer = await prisma.career.findUnique({ where: { id: careerId } });
      if (!targetCareer) {
        return NextResponse.json({ error: 'The selected vacancy could not be found.' }, { status: 404 });
      }
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Kigali' }).format(new Date());
      if (targetCareer.status !== 'Open' || (targetCareer.deadline && targetCareer.deadline < today)) {
        return NextResponse.json(
          { error: 'Applications for this position are closed.' },
          { status: 400 }
        );
      }
      careerTitle = targetCareer.title;
    }

    // Store a resume only after the application has passed validation.
    if (resumeFileToUpload) {
      const ext = path.extname(resumeFileToUpload.name || '').toLowerCase();
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
      await fs.mkdir(uploadDir, { recursive: true });
      const safeBase = path.basename(resumeFileToUpload.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${safeBase}_${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      const bytes = await resumeFileToUpload.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(bytes));
      resumeUrl = `/uploads/resumes/${fileName}`;
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

    // Dispatch confirmation email to applicant
    try {
      await sendApplicationReceivedEmail({
        id: application.id,
        fullName: application.fullName,
        email: application.email,
        careerTitle: application.careerTitle,
      });
    } catch (err) {
      console.warn('[Recruitment] Background application receipt email error:', err);
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
