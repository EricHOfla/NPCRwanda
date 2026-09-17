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

    const label = categoryLabels[payload.category] || 'Official Update';
    const actionText = payload.category === 'careers' 
      ? 'View Position & Apply' 
      : payload.category === 'events'
      ? 'View Event Details'
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
              <td style="background: #0072C6; height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
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
                    <td align="left" style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #0072C6;">
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
                    <td align="center" bgcolor="#0072C6" style="border-radius: 6px;">
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
