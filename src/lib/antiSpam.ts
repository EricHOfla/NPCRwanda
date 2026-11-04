/**
 * Anti-Spam and Bot Protection Utility for Public Forms
 * Protects: /api/contacts, /api/volunteers, /api/donations, /api/subscribers
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipSubmissionTracker = new Map<string, RateLimitRecord>();

// Clean up tracker every 15 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipSubmissionTracker.entries()) {
      if (now > record.resetAt) {
        ipSubmissionTracker.delete(ip);
      }
    }
  }, 15 * 60 * 1000);
}

/**
 * Checks if an IP has exceeded rate limit.
 * Defaults to max 6 submissions per 10 minutes per IP.
 */
export function isRateLimited(ip: string, maxCount: number = 6, windowMinutes: number = 10): boolean {
  if (!ip || ip === 'unknown') return false;

  const now = Date.now();
  const record = ipSubmissionTracker.get(ip);

  if (!record || now > record.resetAt) {
    ipSubmissionTracker.set(ip, {
      count: 1,
      resetAt: now + windowMinutes * 60 * 1000,
    });
    return false;
  }

  record.count += 1;
  return record.count > maxCount;
}

/**
 * Extracts client IP safely from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  return 'unknown';
}

/**
 * Validates bot indicators:
 * 1. Honeypot field (must be empty)
 * 2. Form submission time (must take at least 1.5s for human typing)
 * 3. Bot pattern matching (suspicious spam domains or strings)
 */
export function validateAntiSpam(body: {
  website_url?: string;
  hp_field?: string;
  _ts?: number | string;
  email?: string;
  name?: string;
  message?: string;
}): { isSpam: boolean; reason?: string } {
  // 1. Honeypot check: If bot filled either invisible trap field
  if (body.website_url && body.website_url.trim() !== '') {
    return { isSpam: true, reason: 'honeypot_triggered' };
  }
  if (body.hp_field && body.hp_field.trim() !== '') {
    return { isSpam: true, reason: 'honeypot_field_triggered' };
  }

  // 2. Submission speed check: Real humans take > 1.5 seconds to fill any form
  if (body._ts) {
    const submittedAt = Number(body._ts);
    if (!isNaN(submittedAt)) {
      const elapsed = Date.now() - submittedAt;
      if (elapsed < 1500) {
        return { isSpam: true, reason: 'submitted_too_fast' };
      }
    }
  }

  // 3. Known bot dummy emails or generic spam domains
  if (body.email) {
    const emailLower = body.email.toLowerCase().trim();
    const spamDomains = [
      '@example.com',
      '@test.com',
      '@sample.com',
      '@dummy.com',
      '@mailinator.com',
      '@guerrillamail.com',
      '@10minutemail.com',
      '@tempmail.com',
      '@dispostable.com',
      '@yopmail.com',
      '@trashmail.com',
    ];
    if (spamDomains.some((d) => emailLower.endsWith(d))) {
      return { isSpam: true, reason: 'known_disposable_domain' };
    }
  }

  // 4. Excessive spam keyword pattern (SEO/casino/crypto spam links)
  const textToCheck = `${body.name || ''} ${body.message || ''}`.toLowerCase();
  const spamKeywords = [
    'casino online',
    'viagra',
    'cialis',
    'crypto giveaway',
    'telegram bot',
    'seo backlink',
    'buy followers',
    'porn',
    ' adult dating',
  ];
  if (spamKeywords.some((kw) => textToCheck.includes(kw))) {
    return { isSpam: true, reason: 'spam_keywords' };
  }

  return { isSpam: false };
}
