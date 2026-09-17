import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  let success = false;
  let message = 'Invalid or expired unsubscribe link.';

  if (email) {
    try {
      const sub = await prisma.subscriber.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (sub && (!token || sub.token === token)) {
        await prisma.subscriber.update({
          where: { id: sub.id },
          data: { active: false },
        });
        success = true;
        message = 'You have been successfully unsubscribed from NPC Rwanda notifications.';
      }
    } catch (err) {
      console.error('Unsubscribe error:', err);
    }
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Unsubscribe - NPC Rwanda</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-light d-flex align-items-center justify-content-center" style="min-height: 100vh;">
      <div class="card shadow-sm p-4 text-center" style="max-width: 480px; border-radius: 12px;">
        <div class="mb-3">
          <img src="/assets/img/logo.png" alt="NPC Rwanda" style="height: 60px; object-fit: contain;">
        </div>
        <h2 class="h5 fw-bold ${success ? 'text-success' : 'text-danger'} mb-2">
          ${success ? 'Unsubscribed' : 'Notice'}
        </h2>
        <p class="text-muted small mb-4">${message}</p>
        <div>
          <a href="/" class="btn btn-primary btn-sm px-4">Return to Homepage</a>
        </div>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
