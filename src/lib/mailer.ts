import nodemailer from 'nodemailer';
import { prisma } from './prisma';

export interface NotificationPayload {
  category: 'announcements' | 'news' | 'events' | 'careers';
  title: string;
  description: string;
  url: string;
  date?: string;
  imageUrl?: string;
}

// Helper to retrieve SMTP configuration from SystemSettings or environment variables
async function getSmtpConfig() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpFrom', 'smtpSecure', 'siteName', 'contactEmail']
        }
      }
    });

    const configMap: Record<string, string> = {};
    settings.forEach(s => {
      configMap[s.key] = s.value;
    });

    const host = configMap.smtpHost || process.env.SMTP_HOST || '';
    const port = parseInt(configMap.smtpPort || process.env.SMTP_PORT || '587', 10);
    const user = configMap.smtpUser || process.env.SMTP_USER || '';
    const pass = configMap.smtpPass || process.env.SMTP_PASS || '';
    const from = configMap.smtpFrom || process.env.SMTP_FROM || configMap.contactEmail || 'NPC Rwanda <info@npcrwanda.org>';
    const secure = configMap.smtpSecure === 'true' || port === 465;

    if (!host || !user || !pass) {
      return null;
    }

    return { host, port, user, pass, from, secure };
  } catch (err) {
    console.warn('Error reading SMTP config:', err);
    return null;
  }
}

export async function getTransporter() {
  const config = await getSmtpConfig();
  if (!config) return null;

  return {
    transporter: nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    }),
    from: config.from,
  };
}

export async function sendWelcomeEmail(email: string, token?: string | null) {
  try {
    const mailSetup = await getTransporter();
    if (!mailSetup) {
      console.log(`[Subscription] SMTP not configured. Welcome email skipped for ${email}`);
      return;
    }

    const unsubUrl = token 
      ? `https://npcrwanda.org/api/subscribers/unsubscribe?token=${token}&email=${encodeURIComponent(email)}`
      : 'https://npcrwanda.org/contact';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background: #002B49; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; letter-spacing: 0.5px; }
          .body { padding: 30px; line-height: 1.6; }
          .badge { display: inline-block; background: #198754; color: #ffffff; padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: bold; margin-bottom: 16px; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .footer a { color: #0056b3; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>National Paralympic Committee of Rwanda</h1>
          </div>
          <div class="body">
            <span class="badge">Subscription Confirmed</span>
            <h2>Welcome to NPC Rwanda Updates!</h2>
            <p>Thank you for subscribing to the National Paralympic Committee of Rwanda.</p>
            <p>You will now receive automatic email notifications whenever we publish new:</p>
            <ul>
              <li><strong>Official Announcements & Notices</strong></li>
              <li><strong>News Articles & Athlete Stories</strong></li>
              <li><strong>National & International Events</strong></li>
              <li><strong>Career Opportunities & Positions</strong></li>
            </ul>
            <p>We are dedicated to advancing Paralympic sports, empowering athletes, and promoting inclusivity across Rwanda.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} National Paralympic Committee of Rwanda. All rights reserved.</p>
            <p><a href="${unsubUrl}">Click here to unsubscribe</a> from notifications.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await mailSetup.transporter.sendMail({
      from: mailSetup.from,
      to: email,
      subject: 'Welcome to NPC Rwanda Notifications & Updates',
      html,
    });
    console.log(`[Subscription] Welcome email sent to ${email}`);
  } catch (err: any) {
    console.warn(`[Subscription] Failed to send welcome email to ${email}:`, err?.message || err);
  }
}

export async function notifySubscribers(payload: NotificationPayload) {
  try {
    const subscribers = await prisma.subscriber.findMany({
      where: {
        active: true,
        categories: {
          has: payload.category
        }
      }
    });

    if (!subscribers || subscribers.length === 0) {
      console.log(`[Notification] No active subscribers found for category: ${payload.category}`);
      return;
    }

    const mailSetup = await getTransporter();
    if (!mailSetup) {
      console.log(`[Notification] SMTP not configured. Skipped sending ${payload.category} notification to ${subscribers.length} subscribers.`);
      return;
    }

    const categoryLabels: Record<string, string> = {
      announcements: 'Official Announcement',
      news: 'Latest News & Story',
      events: 'Upcoming Event',
      careers: 'Career Opportunity',
    };

    const label = categoryLabels[payload.category] || 'New Update';
    const actionText = payload.category === 'careers' 
      ? 'View Position & Apply' 
      : payload.category === 'events'
      ? 'View Event Details'
      : 'Read Full Article';

    const fullUrl = payload.url.startsWith('http') ? payload.url : `https://npcrwanda.org${payload.url}`;

    console.log(`[Notification] Dispatching email to ${subscribers.length} subscribers for ${payload.title}...`);

    const BATCH_SIZE = 10;
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(sub => {
          const unsubUrl = `https://npcrwanda.org/api/subscribers/unsubscribe?token=${sub.token || ''}&email=${encodeURIComponent(sub.email)}`;

          const html = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #1e293b; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .header { background: #002B49; color: #ffffff; padding: 20px 24px; text-align: center; }
                .header h1 { margin: 0; font-size: 18px; letter-spacing: 0.5px; }
                .body { padding: 30px; line-height: 1.6; }
                .badge { display: inline-block; background: #0056b3; color: #ffffff; padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: bold; margin-bottom: 16px; text-transform: uppercase; }
                .title { font-size: 22px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
                .desc { color: #475569; font-size: 15px; margin-bottom: 24px; }
                .btn { display: inline-block; background: #0056b3; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
                .footer a { color: #64748b; text-decoration: underline; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>National Paralympic Committee of Rwanda</h1>
                </div>
                <div class="body">
                  <span class="badge">${label}</span>
                  <h2 class="title">${payload.title}</h2>
                  <p class="desc">${payload.description}</p>
                  <div>
                    <a href="${fullUrl}" class="btn">${actionText} &rarr;</a>
                  </div>
                </div>
                <div class="footer">
                  <p>You received this email because you subscribed to updates from NPC Rwanda.</p>
                  <p><a href="${unsubUrl}">Unsubscribe from these notifications</a></p>
                </div>
              </div>
            </body>
            </html>
          `;

          return mailSetup.transporter.sendMail({
            from: mailSetup.from,
            to: sub.email,
            subject: `[NPC Rwanda ${label}] ${payload.title}`,
            html,
          });
        })
      );
    }
  } catch (err: any) {
    console.error('[Notification] Error dispatching subscriber notifications:', err?.message || err);
  }
}
