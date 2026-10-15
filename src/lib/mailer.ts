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
    const port = parseInt(configMap.smtpPort || process.env.SMTP_PORT || '465', 10);
    const user = configMap.smtpUser || process.env.SMTP_USER || '';
    const pass = configMap.smtpPass || process.env.SMTP_PASS || '';
    const from = configMap.smtpFrom || process.env.SMTP_FROM || (user ? `NPC Rwanda <${user}>` : 'NPC Rwanda <notification@npcrwanda.org>');
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
      tls: {
        rejectUnauthorized: false,
      },
    }),
    from: config.from,
  };
}

export async function testSmtpConnection() {
  const mailSetup = await getTransporter();
  if (!mailSetup) {
    return { success: false, error: 'SMTP configuration is missing or incomplete (Host, User, or Password not set).' };
  }
  try {
    await mailSetup.transporter.verify();
    return { success: true, message: 'SMTP connection verified successfully!' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to connect to SMTP server.' };
  }
}

// Resolve relative image URLs to absolute HTTPS URLs
function resolveImageUrl(url?: string): string | null {
  if (!url || url === '#' || url === 'default' || url === 'sports-hero.jpg' || url === 'news-volleyball.jpg') {
    return null;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `https://npcrwanda.org${url}`;
  }
  return `https://npcrwanda.org/uploads/images/${url}`;
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

    const currentYear = new Date().getFullYear();

    const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Subscription Confirmed — NPC Rwanda</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1E293B; }
    a { color: #0072C6; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; margin: 0 !important; }
      .content-padding { padding: 24px 20px !important; }
      .header-padding { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #F1F5F9;">

  <center>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
      <tr>
        <td align="center" style="padding: 0 12px;">

          <!-- Main Email Container -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);">
            
            <!-- Rwanda Agitos Accent Stripe -->
            <tr>
              <td style="background: #0072C6; height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
            </tr>

            <!-- Header -->
            <tr>
              <td class="header-padding" style="padding: 28px 36px 24px 36px; border-bottom: 1px solid #EEF2F6; background-color: #FFFFFF;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td valign="middle" width="56" style="padding-right: 16px;">
                      <img src="https://npcrwanda.org/assets/img/logo.png" alt="NPC Rwanda" width="48" height="48" style="display: block; border-radius: 6px; width: 48px; height: 48px; object-fit: contain;" />
                    </td>
                    <td valign="middle">
                      <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.8px; color: #002B49; text-transform: uppercase; line-height: 1.3;">National Paralympic Committee</div>
                      <div style="font-size: 11px; font-weight: 500; color: #64748B; letter-spacing: 0.3px; margin-top: 2px;">Comit&eacute; National Paralympique du Rwanda</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td class="content-padding" style="padding: 36px 36px 28px 36px;">
                
                <!-- Category Eyebrow -->
                <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #0072C6; margin-bottom: 12px;">
                  Subscription Confirmed
                </div>

                <!-- Main Greeting -->
                <h1 style="margin: 0 0 16px 0; font-size: 22px; line-height: 1.35; font-weight: 700; color: #0F172A;">
                  Welcome to NPC Rwanda Official Updates
                </h1>

                <!-- Message Paragraphs -->
                <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.65; color: #334155;">
                  Thank you for subscribing to official communications from the National Paralympic Committee of Rwanda. You have joined a dedicated community supporting Paralympic athletes and inclusive sports excellence across our nation.
                </p>

                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.65; color: #334155;">
                  Moving forward, you will be the first to receive notifications directly from our headquarters regarding:
                </p>

                <!-- Bullet Points in Clean Table -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 28px;">
                  <tr>
                    <td style="padding: 16px 20px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td valign="top" width="24" style="font-size: 14px; color: #0072C6; padding-bottom: 10px;">&bull;</td>
                          <td style="font-size: 14px; line-height: 1.5; color: #334155; padding-bottom: 10px;">
                            <strong style="color: #0F172A;">Official Announcements</strong> &mdash; Policy statements, committee communiqu&eacute;s, and press releases.
                          </td>
                        </tr>
                        <tr>
                          <td valign="top" width="24" style="font-size: 14px; color: #0072C6; padding-bottom: 10px;">&bull;</td>
                          <td style="font-size: 14px; line-height: 1.5; color: #334155; padding-bottom: 10px;">
                            <strong style="color: #0F172A;">News & Athlete Spotlights</strong> &mdash; National team results, international games coverage, and inspirational stories.
                          </td>
                        </tr>
                        <tr>
                          <td valign="top" width="24" style="font-size: 14px; color: #0072C6; padding-bottom: 10px;">&bull;</td>
                          <td style="font-size: 14px; line-height: 1.5; color: #334155; padding-bottom: 10px;">
                            <strong style="color: #0F172A;">Events & Competitions</strong> &mdash; Schedules for championships, qualifying matches, and training camps.
                          </td>
                        </tr>
                        <tr>
                          <td valign="top" width="24" style="font-size: 14px; color: #0072C6;">&bull;</td>
                          <td style="font-size: 14px; line-height: 1.5; color: #334155;">
                            <strong style="color: #0F172A;">Careers & Opportunities</strong> &mdash; Open positions, call for volunteers, and partner initiatives.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Call to Action Button -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                  <tr>
                    <td align="center" bgcolor="#0072C6" style="border-radius: 6px;">
                      <a href="https://npcrwanda.org" target="_blank" style="display: inline-block; padding: 13px 28px; font-size: 14px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 6px; letter-spacing: 0.2px;">
                        Visit NPC Rwanda Website &rarr;
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Institutional Sign-Off -->
                <div style="border-top: 1px solid #EEF2F6; padding-top: 24px; font-size: 13px; line-height: 1.6; color: #64748B;">
                  With warm regards,<br />
                  <strong style="color: #0F172A; font-size: 14px;">National Paralympic Committee of Rwanda</strong><br />
                  Communications & Media Directorate &bull; Kigali, Rwanda
                </div>

              </td>
            </tr>

            <!-- Official Footer -->
            <tr>
              <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 36px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #64748B;">
                  <strong style="color: #334155;">National Paralympic Committee of Rwanda (NPC Rwanda)</strong><br />
                  Amahoro National Stadium, BP 2684, Remera, Kigali, Rwanda<br />
                  Email: <a href="mailto:info@npcrwanda.org" style="color: #0072C6;">info@npcrwanda.org</a> &bull; Web: <a href="https://npcrwanda.org" style="color: #0072C6;">www.npcrwanda.org</a>
                </p>
                <p style="margin: 12px 0 0 0; font-size: 11px; line-height: 1.5; color: #94A3B8;">
                  You received this email because your email was registered on npcrwanda.org.<br />
                  <a href="${unsubUrl}" style="color: #64748B; text-decoration: underline;">Unsubscribe or change notification settings</a>
                </p>
              </td>
            </tr>

          </table>
          <!-- /Main Email Container -->

        </td>
      </tr>
    </table>
  </center>

</body>
</html>
    `;

    await mailSetup.transporter.sendMail({
      from: mailSetup.from,
      to: email,
      subject: 'Official Confirmation: You are subscribed to NPC Rwanda updates',
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
      news: 'News & Press Release',
      events: 'Upcoming Event Notification',
      careers: 'Career Opportunity & Vacancy',
    };

    const categoryColors: Record<string, string> = {
      announcements: '#C0392B',  // red — official/urgent
      news: '#0072C6',           // blue — NPC brand
      events: '#E67E22',         // orange — events
      careers: '#27AE60',        // green — opportunity
    };

    const label = categoryLabels[payload.category] || 'Official Update';
    const accentColor = categoryColors[payload.category] || '#0072C6';
    const actionText = payload.category === 'careers'
      ? 'View Position & Apply'
      : payload.category === 'events'
      ? 'View Event Details'
      : payload.category === 'announcements'
      ? 'Read Official Notice'
      : 'Read Full Article';

    const fullUrl = payload.url.startsWith('http') ? payload.url : `https://npcrwanda.org${payload.url}`;
    const bannerImage = resolveImageUrl(payload.imageUrl);
    const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    console.log(`[Notification] Dispatching professional email to ${subscribers.length} subscribers for ${payload.title}...`);

    const BATCH_SIZE = 10;
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(sub => {
          const unsubUrl = `https://npcrwanda.org/api/subscribers/unsubscribe?token=${sub.token || ''}&email=${encodeURIComponent(sub.email)}`;

          const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${payload.title} — NPC Rwanda</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1E293B; }
    a { color: #0072C6; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; margin: 0 !important; }
      .content-padding { padding: 24px 20px !important; }
      .header-padding { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #F1F5F9;">

  <center>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
      <tr>
        <td align="center" style="padding: 0 12px;">

          <!-- Main Email Container -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);">
            
            <!-- Rwanda / Olympic Accent Stripe -->
            <tr>
              <td style="background: ${accentColor}; height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
            </tr>

            <!-- Header -->
            <tr>
              <td class="header-padding" style="padding: 24px 36px 20px 36px; border-bottom: 1px solid #EEF2F6; background-color: #FFFFFF;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td valign="middle" width="56" style="padding-right: 16px;">
                      <img src="https://npcrwanda.org/assets/img/logo.png" alt="NPC Rwanda Logo" width="48" height="48" style="display: block; border-radius: 6px; width: 48px; height: 48px; object-fit: contain;" />
                    </td>
                    <td valign="middle">
                      <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.8px; color: #002B49; text-transform: uppercase; line-height: 1.3;">National Paralympic Committee</div>
                      <div style="font-size: 11px; font-weight: 500; color: #64748B; letter-spacing: 0.3px; margin-top: 2px;">Official Bulletin &bull; Kigali, Rwanda</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td class="content-padding" style="padding: 36px 36px 28px 36px;">
                
                <!-- Category Eyebrow & Date -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                  <tr>
                    <td align="left" style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${accentColor};">
                      ${label}
                    </td>
                    <td align="right" style="font-size: 12px; color: #94A3B8; font-weight: 500;">
                      ${currentDate}
                    </td>
                  </tr>
                </table>

                <!-- Article / Event Title -->
                <h1 style="margin: 0 0 20px 0; font-size: 22px; line-height: 1.35; font-weight: 700; color: #0F172A;">
                  ${payload.title}
                </h1>

                <!-- Optional Hero Image -->
                ${bannerImage ? `
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                  <tr>
                    <td>
                      <img src="${bannerImage}" alt="${payload.title}" width="528" style="display: block; width: 100%; max-height: 280px; object-fit: cover; border-radius: 6px; border: 1px solid #E2E8F0;" />
                    </td>
                  </tr>
                </table>
                ` : ''}

                <!-- Body Content -->
                <div style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.7; color: #334155;">
                  ${payload.description.split('\n').map(p => p.trim()).filter(Boolean).map(p => `<p style="margin: 0 0 14px 0;">${p}</p>`).join('')}
                </div>

                <!-- Call to Action Button -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                  <tr>
                    <td align="center" bgcolor="${accentColor}" style="border-radius: 6px;">
                      <a href="${fullUrl}" target="_blank" style="display: inline-block; padding: 13px 28px; font-size: 14px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 6px; letter-spacing: 0.2px;">
                        ${actionText} &rarr;
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Official Institutional Sign-Off -->
                <div style="border-top: 1px solid #EEF2F6; padding-top: 24px; font-size: 13px; line-height: 1.6; color: #64748B;">
                  <strong style="color: #0F172A; font-size: 14px;">National Paralympic Committee of Rwanda</strong><br />
                  Communications & Media Directorate<br />
                  Amahoro National Stadium &bull; Kigali, Rwanda
                </div>

              </td>
            </tr>

            <!-- Official Footer -->
            <tr>
              <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 36px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #64748B;">
                  <strong style="color: #334155;">National Paralympic Committee of Rwanda (NPC Rwanda)</strong><br />
                  Amahoro National Stadium, BP 2684, Remera, Kigali, Rwanda<br />
                  Email: <a href="mailto:info@npcrwanda.org" style="color: #0072C6;">info@npcrwanda.org</a> &bull; Web: <a href="https://npcrwanda.org" style="color: #0072C6;">www.npcrwanda.org</a>
                </p>
                <p style="margin: 12px 0 0 0; font-size: 11px; line-height: 1.5; color: #94A3B8;">
                  You received this official communication because you are subscribed to updates from NPC Rwanda.<br />
                  <a href="${unsubUrl}" style="color: #64748B; text-decoration: underline;">Unsubscribe from these notifications</a>
                </p>
              </td>
            </tr>

          </table>
          <!-- /Main Email Container -->

        </td>
      </tr>
    </table>
  </center>

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

/**
 * Sends automated confirmation email to candidate when they submit a job application
 */
export async function sendApplicationReceivedEmail(application: {
  id: string;
  fullName: string;
  email: string;
  careerTitle: string;
}) {
  try {
    const mailSetup = await getTransporter();
    if (!mailSetup) {
      console.log(`[Recruitment] SMTP not configured. Application receipt email skipped for ${application.email}`);
      return;
    }

    const currentYear = new Date().getFullYear();
    const refCode = application.id.slice(0, 8).toUpperCase();

    const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application Received — NPC Rwanda</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1E293B; }
    a { color: #0072C6; text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #F1F5F9;">
  <center>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
      <tr>
        <td align="center" style="padding: 0 12px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);">
            <tr>
              <td style="background: #0072C6; height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding: 28px 36px 20px 36px; border-bottom: 1px solid #EEF2F6;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td valign="middle" width="56" style="padding-right: 16px;">
                      <img src="https://npcrwanda.org/assets/img/logo.png" alt="NPC Rwanda" width="48" height="48" style="display: block; border-radius: 6px; width: 48px; height: 48px; object-fit: contain;" />
                    </td>
                    <td valign="middle">
                      <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.8px; color: #002B49; text-transform: uppercase;">National Paralympic Committee</div>
                      <div style="font-size: 11px; font-weight: 500; color: #64748B; margin-top: 2px;">Comité National Paralympique du Rwanda</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 36px 36px 36px;">
                <span style="display: inline-block; padding: 4px 12px; background-color: #E0F2FE; color: #0284C7; font-size: 11px; font-weight: 700; text-transform: uppercase; border-radius: 20px; letter-spacing: 0.5px; margin-bottom: 16px;">
                  Application Acknowledgment
                </span>
                <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; line-height: 1.3; color: #0F172A;">
                  Application Received: ${application.careerTitle}
                </h1>
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                  Dear <strong>${application.fullName}</strong>,
                </p>
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                  Thank you for applying for the position of <strong>${application.careerTitle}</strong> at the National Paralympic Committee of Rwanda (NPC Rwanda).
                </p>
                <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; line-height: 1.6; color: #475569;">
                    <tr>
                      <td style="padding: 4px 0; font-weight: 600; color: #1E293B;" width="140">Position:</td>
                      <td style="padding: 4px 0; color: #0F172A;">${application.careerTitle}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; font-weight: 600; color: #1E293B;">Applicant Name:</td>
                      <td style="padding: 4px 0; color: #0F172A;">${application.fullName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; font-weight: 600; color: #1E293B;">Reference Code:</td>
                      <td style="padding: 4px 0; font-family: monospace; font-weight: 700; color: #0072C6;">#${refCode}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; font-weight: 600; color: #1E293B;">Status:</td>
                      <td style="padding: 4px 0; color: #0284C7; font-weight: 600;">Received & Under Review</td>
                    </tr>
                  </table>
                </div>
                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                  Our Human Resources & Selection Panel will review your qualifications against the position criteria. If your background matches our requirements, we will contact you directly with instructions regarding the next steps in the recruitment process.
                </p>
                <div style="border-top: 1px solid #EEF2F6; padding-top: 20px; font-size: 13px; line-height: 1.6; color: #64748B;">
                  <strong style="color: #0F172A;">NPC Rwanda Recruitment & Human Resources</strong><br />
                  Amahoro National Stadium &bull; Kigali, Rwanda<br />
                  Email: <a href="mailto:info@npcrwanda.org" style="color: #0072C6;">info@npcrwanda.org</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 36px; text-align: center; font-size: 12px; color: #64748B;">
                &copy; ${currentYear} National Paralympic Committee of Rwanda. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
    `;

    await mailSetup.transporter.sendMail({
      from: mailSetup.from,
      to: application.email,
      subject: `[NPC Rwanda] Application Received — ${application.careerTitle}`,
      html,
    });
  } catch (err: any) {
    console.error('[Recruitment] Error sending application received email:', err?.message || err);
  }
}

/**
 * Sends candidate status update email (Shortlisted or Regret/Rejected)
 */
export async function sendApplicationStatusEmail(application: {
  fullName: string;
  email: string;
  careerTitle: string;
  status: 'Shortlisted' | 'Rejected' | string;
}) {
  try {
    const mailSetup = await getTransporter();
    if (!mailSetup) {
      console.log(`[Recruitment] SMTP not configured. Status email skipped for ${application.email}`);
      return;
    }

    const currentYear = new Date().getFullYear();
    const isShortlisted = application.status === 'Shortlisted';
    const isRejected = application.status === 'Rejected';

    // Only send automated emails for decisive milestones
    if (!isShortlisted && !isRejected) {
      return;
    }

    const subject = isShortlisted
      ? `[NPC Rwanda] Congratulations — Shortlisted for ${application.careerTitle}`
      : `[NPC Rwanda] Application Status Update — ${application.careerTitle}`;

    const badgeBg = isShortlisted ? '#DCFCE7' : '#F1F5F9';
    const badgeColor = isShortlisted ? '#16A34A' : '#64748B';
    const badgeText = isShortlisted ? 'Application Shortlisted' : 'Recruitment Update';

    const headline = isShortlisted
      ? `You Have Been Shortlisted!`
      : `Update on Your Application`;

    const bodyHtml = isShortlisted
      ? `
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
          Dear <strong>${application.fullName}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
          We are pleased to inform you that following the review of applications for the position of <strong>${application.careerTitle}</strong>, your application has been <strong style="color: #16A34A;">shortlisted</strong> by the National Paralympic Committee of Rwanda (NPC Rwanda).
        </p>
        <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #166534;">What Happens Next?</h4>
          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #15803D;">
            Our Human Resources team will contact you shortly via email or phone to provide the interview schedule, venue details, and any preparatory requirements. Please ensure your contact channels remain accessible.
          </p>
        </div>
        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
          We look forward to meeting with you soon and discussing how your experience can contribute to the Paralympic movement in Rwanda.
        </p>
      `
      : `
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
          Dear <strong>${application.fullName}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
          Thank you very much for taking the time to apply for the position of <strong>${application.careerTitle}</strong> and for your interest in joining the National Paralympic Committee of Rwanda (NPC Rwanda).
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
          We received a large number of competitive applications for this vacancy. After careful review and evaluation by our selection panel, we regret to inform you that we will not be moving forward with your application for this specific position at this time.
        </p>
        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
          We sincerely appreciate the effort you put into your application and your enthusiasm for our mission. We encourage you to visit our careers portal at <a href="https://npcrwanda.org/careers" style="color: #0072C6; font-weight: 600;">npcrwanda.org/careers</a> for future openings that match your skills and qualifications.
        </p>
        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
          We wish you every success in your career and future endeavors.
        </p>
      `;

    const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headline} — NPC Rwanda</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1E293B; }
    a { color: #0072C6; text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #F1F5F9;">
  <center>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
      <tr>
        <td align="center" style="padding: 0 12px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);">
            <tr>
              <td style="background: ${isShortlisted ? '#16A34A' : '#0072C6'}; height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding: 28px 36px 20px 36px; border-bottom: 1px solid #EEF2F6;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td valign="middle" width="56" style="padding-right: 16px;">
                      <img src="https://npcrwanda.org/assets/img/logo.png" alt="NPC Rwanda" width="48" height="48" style="display: block; border-radius: 6px; width: 48px; height: 48px; object-fit: contain;" />
                    </td>
                    <td valign="middle">
                      <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.8px; color: #002B49; text-transform: uppercase;">National Paralympic Committee</div>
                      <div style="font-size: 11px; font-weight: 500; color: #64748B; margin-top: 2px;">Comité National Paralympique du Rwanda</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 36px 36px 36px;">
                <span style="display: inline-block; padding: 4px 12px; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 11px; font-weight: 700; text-transform: uppercase; border-radius: 20px; letter-spacing: 0.5px; margin-bottom: 16px;">
                  ${badgeText}
                </span>
                <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; line-height: 1.3; color: #0F172A;">
                  ${headline}
                </h1>
                ${bodyHtml}
                <div style="border-top: 1px solid #EEF2F6; padding-top: 20px; font-size: 13px; line-height: 1.6; color: #64748B;">
                  <strong style="color: #0F172A;">NPC Rwanda Human Resources & Recruitment</strong><br />
                  Amahoro National Stadium &bull; BP 2684, Remera, Kigali, Rwanda<br />
                  Email: <a href="mailto:info@npcrwanda.org" style="color: #0072C6;">info@npcrwanda.org</a> &bull; Web: <a href="https://npcrwanda.org" style="color: #0072C6;">www.npcrwanda.org</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 36px; text-align: center; font-size: 12px; color: #64748B;">
                &copy; ${currentYear} National Paralympic Committee of Rwanda. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
    `;

    await mailSetup.transporter.sendMail({
      from: mailSetup.from,
      to: application.email,
      subject,
      html,
    });
  } catch (err: any) {
    console.error('[Recruitment] Error sending application status email:', err?.message || err);
  }
}

// ─────────────────────────────────────────────────────────────
// Contact Form: Admin Alert & User Confirmation Receipt
// ─────────────────────────────────────────────────────────────
export async function sendContactNotification(contact: { name: string; email: string; subject: string; message: string; date?: string }) {
  try {
    const mailSetup = await getTransporter();
    if (!mailSetup) return;

    const currentYear = new Date().getFullYear();

    // 1. Send Alert to Admin/Secretariat
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
        <div style="background: #0B2545; padding: 20px 24px; color: #fff;">
          <h2 style="margin: 0; font-size: 18px;">📬 New Contact Inquiry Received</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #FFA000;">National Paralympic Committee of Rwanda</p>
        </div>
        <div style="padding: 24px; color: #1E293B; line-height: 1.6; font-size: 14px;">
          <p><strong>From:</strong> ${contact.name} (&lt;<a href="mailto:${contact.email}">${contact.email}</a>&gt;)</p>
          <p><strong>Subject:</strong> ${contact.subject}</p>
          <p><strong>Date:</strong> ${contact.date || new Date().toLocaleString()}</p>
          <div style="margin-top: 16px; padding: 16px; background: #F8FAFC; border-left: 4px solid #0072C6; border-radius: 4px;">
            <p style="margin: 0; white-space: pre-wrap;">${contact.message}</p>
          </div>
          <div style="margin-top: 24px;">
            <a href="mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}" style="display: inline-block; background: #0072C6; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;">Reply to ${contact.name}</a>
          </div>
        </div>
        <div style="background: #F1F5F9; padding: 12px 24px; font-size: 12px; color: #64748B; text-align: center;">
          &copy; ${currentYear} NPC Rwanda Administrative Notification
        </div>
      </div>
    `;

    // Try sending admin notification to sender of SMTP or fallback to info@npcrwanda.org
    await mailSetup.transporter.sendMail({
      from: mailSetup.from,
      to: mailSetup.from,
      subject: `[New Inquiry] ${contact.subject} - ${contact.name}`,
      html: adminHtml,
      replyTo: contact.email,
    });

    // 2. Send Automated Confirmation Receipt to the User
    const userReceiptHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
        <div style="background: #0B2545; padding: 24px; color: #fff; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">Thank You for Contacting NPC Rwanda</h2>
          <p style="margin: 6px 0 0; font-size: 13px; color: #FFA000;">National Paralympic Committee of Rwanda</p>
        </div>
        <div style="padding: 24px; color: #1E293B; line-height: 1.6; font-size: 14px;">
          <p>Dear <strong>${contact.name}</strong>,</p>
          <p>We have received your message regarding "<strong>${contact.subject}</strong>". Our secretariat team has logged your inquiry and will respond to you shortly.</p>
          <div style="margin: 16px 0; padding: 16px; background: #F8FAFC; border-radius: 6px; border: 1px solid #E2E8F0;">
            <p style="margin: 0; font-size: 12px; color: #64748B;">Summary of your message:</p>
            <p style="margin: 8px 0 0; font-style: italic; color: #334155;">"${contact.message}"</p>
          </div>
          <p>If your matter is urgent, you can also reach our secretariat at Amahoro National Stadium, BP 2684 Kigali, Rwanda.</p>
          <p style="margin-top: 24px; margin-bottom: 0;">Warm regards,<br /><strong>Secretariat Team</strong><br />National Paralympic Committee of Rwanda</p>
        </div>
        <div style="background: #F1F5F9; padding: 12px 24px; font-size: 12px; color: #64748B; text-align: center;">
          &copy; ${currentYear} National Paralympic Committee of Rwanda &bull; <a href="https://npcrwanda.org" style="color: #0072C6;">www.npcrwanda.org</a>
        </div>
      </div>
    `;

    await mailSetup.transporter.sendMail({
      from: mailSetup.from,
      to: contact.email,
      subject: `Receipt: We received your message - NPC Rwanda`,
      html: userReceiptHtml,
    });
  } catch (err: any) {
    console.error('[Contact] Error sending notification email:', err?.message || err);
  }
}

// ─────────────────────────────────────────────────────────────
// Volunteer Application: Admin Alert & Applicant Confirmation
// ─────────────────────────────────────────────────────────────
export async function sendVolunteerNotification(volunteer: { name: string; email: string; interest: string; skills: string; details: string }) {
  try {
    const mailSetup = await getTransporter();
    if (!mailSetup) return;

    const currentYear = new Date().getFullYear();

    // 1. Alert to Admin
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
        <div style="background: #065F46; padding: 20px 24px; color: #fff;">
          <h2 style="margin: 0; font-size: 18px;">🤝 New Volunteer Application</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #A7F3D0;">NPC Rwanda Community & Volunteer Network</p>
        </div>
        <div style="padding: 24px; color: #1E293B; line-height: 1.6; font-size: 14px;">
          <p><strong>Applicant:</strong> ${volunteer.name} (&lt;<a href="mailto:${volunteer.email}">${volunteer.email}</a>&gt;)</p>
          <p><strong>Area of Interest:</strong> ${volunteer.interest}</p>
          <p><strong>Key Skills:</strong> ${volunteer.skills}</p>
          <div style="margin-top: 16px; padding: 16px; background: #F8FAFC; border-left: 4px solid #10B981; border-radius: 4px;">
            <p style="margin: 0; font-size: 12px; color: #64748B;">Additional Details:</p>
            <p style="margin: 4px 0 0; white-space: pre-wrap;">${volunteer.details}</p>
          </div>
          <div style="margin-top: 24px;">
            <a href="mailto:${volunteer.email}?subject=NPC Rwanda Volunteer Application - ${encodeURIComponent(volunteer.interest)}" style="display: inline-block; background: #065F46; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;">Contact Volunteer</a>
          </div>
        </div>
        <div style="background: #F1F5F9; padding: 12px 24px; font-size: 12px; color: #64748B; text-align: center;">
          &copy; ${currentYear} NPC Rwanda Volunteer Portal
        </div>
      </div>
    `;

    await mailSetup.transporter.sendMail({
      from: mailSetup.from,
      to: mailSetup.from,
      subject: `[Volunteer Application] ${volunteer.name} - ${volunteer.interest}`,
      html: adminHtml,
      replyTo: volunteer.email,
    });

    // 2. Receipt to Volunteer
    const volunteerReceiptHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
        <div style="background: #065F46; padding: 24px; color: #fff; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">Thank You for Stepping Up!</h2>
          <p style="margin: 6px 0 0; font-size: 13px; color: #A7F3D0;">National Paralympic Committee of Rwanda</p>
        </div>
        <div style="padding: 24px; color: #1E293B; line-height: 1.6; font-size: 14px;">
          <p>Dear <strong>${volunteer.name}</strong>,</p>
          <p>Thank you for offering your passion and time to support Para-sports development in Rwanda. We have received your application to volunteer in <strong>${volunteer.interest}</strong>.</p>
          <p>Our volunteer coordination team reviews all applications according to our scheduled events and community programs. We will reach out to you as opportunities aligned with your background arise.</p>
          <p style="margin-top: 24px; margin-bottom: 0;">Together for Inclusion and Excellence,<br /><strong>Volunteer Coordination Team</strong><br />National Paralympic Committee of Rwanda</p>
        </div>
        <div style="background: #F1F5F9; padding: 12px 24px; font-size: 12px; color: #64748B; text-align: center;">
          &copy; ${currentYear} National Paralympic Committee of Rwanda &bull; <a href="https://npcrwanda.org" style="color: #065F46;">www.npcrwanda.org</a>
        </div>
      </div>
    `;

    await mailSetup.transporter.sendMail({
      from: mailSetup.from,
      to: volunteer.email,
      subject: `Volunteer Application Received - NPC Rwanda`,
      html: volunteerReceiptHtml,
    });
  } catch (err: any) {
    console.error('[Volunteer] Error sending volunteer notification email:', err?.message || err);
  }
}

// ─────────────────────────────────────────────────────────────
// Donation Inquiry: Admin Alert & Donor Receipt
// ─────────────────────────────────────────────────────────────
export async function sendDonationNotification(donation: { name: string; email: string; category: string; supportType: string; details: string }) {
  try {
    const mailSetup = await getTransporter();
    if (!mailSetup) return;

    const currentYear = new Date().getFullYear();

    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
        <div style="background: #92400E; padding: 20px 24px; color: #fff;">
          <h2 style="margin: 0; font-size: 18px;">💛 New Donation / Partnership Inquiry</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #FDE68A;">NPC Rwanda Resource Mobilization</p>
        </div>
        <div style="padding: 24px; color: #1E293B; line-height: 1.6; font-size: 14px;">
          <p><strong>Contributor:</strong> ${donation.name} (&lt;<a href="mailto:${donation.email}">${donation.email}</a>&gt;)</p>
          <p><strong>Category:</strong> ${donation.category}</p>
          <p><strong>Support Type:</strong> ${donation.supportType}</p>
          <div style="margin-top: 16px; padding: 16px; background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 4px;">
            <p style="margin: 0; font-size: 12px; color: #92400E;">Details / Pledge:</p>
            <p style="margin: 4px 0 0; white-space: pre-wrap;">${donation.details}</p>
          </div>
          <div style="margin-top: 24px;">
            <a href="mailto:${donation.email}?subject=NPC Rwanda Support & Partnership" style="display: inline-block; background: #92400E; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;">Follow Up With Contributor</a>
          </div>
        </div>
      </div>
    `;

    await mailSetup.transporter.sendMail({
      from: mailSetup.from,
      to: mailSetup.from,
      subject: `[Support Inquiry] ${donation.name} - ${donation.supportType}`,
      html: adminHtml,
      replyTo: donation.email,
    });

    // 2. Receipt to Contributor / Donor
    const donorReceiptHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0B2545 0%, #134074 100%); padding: 28px 24px; color: #fff; text-align: center;">
          <h2 style="margin: 0; font-size: 20px; color: #FFA000;">Thank You for Your Support!</h2>
          <p style="margin: 6px 0 0; font-size: 13px; color: #E2E8F0;">National Paralympic Committee of Rwanda</p>
        </div>
        <div style="padding: 24px; color: #1E293B; line-height: 1.6; font-size: 14px;">
          <p>Dear <strong>${donation.name}</strong>,</p>
          <p>Thank you for reaching out to the National Paralympic Committee of Rwanda regarding <strong>${donation.supportType}</strong> (${donation.category}).</p>
          <p>Your passion to empower Rwandan Para-athletes and support inclusive sports is deeply appreciated. Every contribution helps our athletes compete with pride on national and international stages.</p>
          <div style="margin: 18px 0; padding: 16px; background: #F8FAFC; border-left: 4px solid #FFA000; border-radius: 4px;">
            <p style="margin: 0; font-size: 12px; color: #64748B; font-weight: bold; text-transform: uppercase;">Inquiry Summary:</p>
            <p style="margin: 6px 0 0; color: #334155;"><strong>Support Type:</strong> ${donation.supportType}</p>
            <p style="margin: 4px 0 0; color: #334155;"><strong>Category:</strong> ${donation.category}</p>
            <p style="margin: 4px 0 0; color: #334155; white-space: pre-wrap;">${donation.details}</p>
          </div>
          <p>Our Resource Mobilization and Partnerships team will review your message and contact you directly with documentation and next steps.</p>
          <p style="margin-top: 24px; margin-bottom: 0;">Together for Inclusion and Excellence,<br /><strong>Resource Mobilization Office</strong><br />National Paralympic Committee of Rwanda<br /><a href="https://npcrwanda.org" style="color: #0072C6;">www.npcrwanda.org</a></p>
        </div>
        <div style="background: #F1F5F9; padding: 12px 24px; font-size: 12px; color: #64748B; text-align: center;">
          &copy; ${currentYear} National Paralympic Committee of Rwanda &bull; Amahoro National Stadium, Kigali
        </div>
      </div>
    `;

    await mailSetup.transporter.sendMail({
      from: mailSetup.from,
      to: donation.email,
      subject: `Thank You for Supporting NPC Rwanda`,
      html: donorReceiptHtml,
    });
  } catch (err: any) {
    console.error('[Donation] Error sending donation notification email:', err?.message || err);
  }
}

// ─────────────────────────────────────────────────────────────
// Password Reset Email
// ─────────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(email: string, resetUrl: string, name: string) {
  try {
    const mailSetup = await getTransporter();
    if (!mailSetup) throw new Error('SMTP not configured.');

    const currentYear = new Date().getFullYear();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
        <div style="background: #0B2545; padding: 24px; color: #fff; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">Password Reset Request</h2>
          <p style="margin: 6px 0 0; font-size: 13px; color: #FFA000;">National Paralympic Committee of Rwanda</p>
        </div>
        <div style="padding: 28px; color: #1E293B; line-height: 1.6; font-size: 14px;">
          <p>Hello <strong>${name}</strong>,</p>
          <p>We received a request to reset your password for the NPC Rwanda Administrative Dashboard. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background: #0072C6; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">Reset My Password</a>
          </div>
          <p style="font-size: 13px; color: #64748B;">This password reset link will expire in <strong>1 hour</strong>. If you did not request this change, please ignore this email; your account remains secure.</p>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #94A3B8; word-break: break-all;">
            If the button doesn't work, copy and paste this link into your browser:<br />
            <a href="${resetUrl}" style="color: #0072C6;">${resetUrl}</a>
          </div>
        </div>
        <div style="background: #F1F5F9; padding: 12px 24px; font-size: 12px; color: #64748B; text-align: center;">
          &copy; ${currentYear} National Paralympic Committee of Rwanda
        </div>
      </div>
    `;

    await mailSetup.transporter.sendMail({
      from: mailSetup.from,
      to: email,
      subject: `Reset Your Password - NPC Rwanda Admin`,
      html,
    });
    return { success: true };
  } catch (err: any) {
    console.error('[Auth] Error sending password reset email:', err?.message || err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
// Custom Newsletter Broadcast to Subscribers
// ─────────────────────────────────────────────────────────────
export async function sendCustomNewsletter(campaign: { subject: string; contentHtml: string; category?: string }) {
  try {
    const mailSetup = await getTransporter();
    if (!mailSetup) throw new Error('SMTP is not configured.');

    // Fetch active subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { active: true },
      select: { email: true, token: true, categories: true },
    });

    if (subscribers.length === 0) {
      return { success: true, count: 0, message: 'No active subscribers found.' };
    }

    const currentYear = new Date().getFullYear();
    let sentCount = 0;

    for (const sub of subscribers) {
      // Check category match if specified
      if (campaign.category && campaign.category !== 'all') {
        if (!sub.categories.includes(campaign.category)) continue;
      }

      const unsubscribeUrl = sub.token
        ? `https://npcrwanda.org/api/subscribers/unsubscribe?token=${sub.token}`
        : `https://npcrwanda.org/api/subscribers/unsubscribe?email=${encodeURIComponent(sub.email)}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; background: #fff;">
          <div style="background: #0B2545; padding: 24px 32px; color: #fff; text-align: center;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">NPC RWANDA OFFICIAL BULLETIN</h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #FFA000; font-weight: 600;">National Paralympic Committee of Rwanda</p>
          </div>
          <div style="padding: 32px; color: #1E293B; line-height: 1.7; font-size: 15px;">
            ${campaign.contentHtml}
          </div>
          <div style="background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 32px; font-size: 12px; color: #64748B; text-align: center; line-height: 1.5;">
            <p style="margin: 0 0 6px;">You are receiving this email because you subscribed to updates from the National Paralympic Committee of Rwanda.</p>
            <p style="margin: 0;">
              Amahoro National Stadium &bull; BP 2684 Kigali, Rwanda &bull; <a href="${unsubscribeUrl}" style="color: #DC2626; text-decoration: underline;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `;

      try {
        await mailSetup.transporter.sendMail({
          from: mailSetup.from,
          to: sub.email,
          subject: campaign.subject,
          html,
        });
        sentCount++;
      } catch (sendErr) {
        console.warn(`Failed to send newsletter to ${sub.email}:`, sendErr);
      }
    }

    return { success: true, count: sentCount, total: subscribers.length };
  } catch (err: any) {
    console.error('[Newsletter] Broadcast error:', err?.message || err);
    throw err;
  }
}

