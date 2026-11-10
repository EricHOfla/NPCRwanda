# NPC Rwanda — Production Configuration Guide

This guide explains what must be configured before the NPC Rwanda website can operate correctly in production, where to get each value, where to enter it, and how to test it.

Official website: https://npcrwanda.org  
Production server directory: `/var/www/NPCRwanda`  
Environment file: `/var/www/NPCRwanda/.env`

> **Important:** This is a private production system. Never publish, email, or commit your real `.env` file. Do not paste passwords, API secrets, private keys, or webhook hashes into GitHub or chat.

---

## 1. Before you start

You need access to:

- The NPC Rwanda production VPS (SSH access).
- The production PostgreSQL database and its credentials.
- The Cloudinary account used for website media.
- The SMTP email account for system emails.
- The Flutterwave merchant account, if online donations are being enabled.
- The domain and HTTPS configuration for `npcrwanda.org`.

Make sure the website is already deployed and that you know how to access its admin dashboard.

## 2. Create or update the production environment file

Connect to the VPS:

```bash
ssh YOUR_SERVER_USER@YOUR_SERVER_IP
cd /var/www/NPCRwanda
```

Check whether the production environment file already exists:

```bash
ls -la .env
```

If it does not exist, create it from the example:

```bash
cp .env.example .env
nano .env
```

If it already exists, **do not replace it with the example**. Open the existing file and carefully add or update only the required values:

```bash
nano .env
```

The following sections explain each variable.

## 3. Application settings

Example:

```env
NODE_ENV="production"
PORT="3000"
PUBLIC_APP_URL="https://npcrwanda.org"
NEXT_PUBLIC_PUBLIC_APP_URL="https://npcrwanda.org"
```

- `NODE_ENV`: keep this as `production` on the live server.
- `PORT`: use the port configured for the running application and reverse proxy. The example uses `3000`; do not change it unless your server is configured for another port.
- `PUBLIC_APP_URL`: the public website's HTTPS address.
- `NEXT_PUBLIC_PUBLIC_APP_URL`: compatibility setting for public-facing code. Keep it aligned with the website address.

Do not put private credentials in variables beginning with `NEXT_PUBLIC_`; values with this prefix may be exposed to visitors' browsers.

## 4. PostgreSQL database

Example:

```env
DATABASE_URL="postgresql://DB_USER:DB_PASSWORD@DB_HOST:5432/DB_NAME?schema=public"
```

Where to get the values:

- `DB_USER`: PostgreSQL username created for this application.
- `DB_PASSWORD`: password for that database user.
- `DB_HOST`: database host. Use the correct private/local host if PostgreSQL runs on the same VPS.
- `DB_NAME`: the production database name.
- `5432`: the usual PostgreSQL port; use the actual configured port if different.

If the password contains characters such as `@`, `#`, `/`, `?`, or `:`, URL-encode those characters before putting the password in the connection URL.

**Important:** Use the production database, not a development or test database. Keep a current database backup before any schema migration.

## 5. Authentication secret

Example:

```env
JWT_SECRET="PASTE_A_NEW_RANDOM_SECRET_HERE"
```

Generate a strong secret on the VPS:

```bash
openssl rand -base64 48
```

Copy the generated value into `JWT_SECRET`. Do not use an example value or a short password.

Changing this value can invalidate existing login sessions, so coordinate a change and expect users to sign in again.

## 6. Cloudinary — images and media

Cloudinary stores and serves website media uploaded through the platform.

In your Cloudinary account, open the account dashboard and copy the account credentials.

Configure:

```env
CLOUDINARY_CLOUD_NAME="YOUR_CLOUD_NAME"
CLOUDINARY_API_KEY="YOUR_API_KEY"
CLOUDINARY_API_SECRET="YOUR_API_SECRET"
CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
```

Replace the placeholders with the values from your Cloudinary account. Keep the API secret private. If the application does not require the combined URL for a particular integration, the individual credentials are still the primary settings documented for the website.

**Credential safety:** If Cloudinary credentials have ever been committed to a public or shared repository, rotate the API secret in Cloudinary and update the production environment with the new value. Do not rely on old credentials.

## 7. SMTP — system email

SMTP is needed for the website to send system emails, including verified donation receipts.

Get the SMTP details from your email hosting provider. For a mailbox such as `notifications@npcrwanda.org`, ask the provider for its SMTP hostname, port, username, password or app password, and encryption requirements.

Example for a provider using implicit TLS on port 465:

```env
SMTP_HOST="YOUR_SMTP_HOST"
SMTP_PORT="465"
SMTP_USER="notifications@npcrwanda.org"
SMTP_PASS="YOUR_MAILBOX_OR_APP_PASSWORD"
SMTP_FROM="NPC Rwanda <notifications@npcrwanda.org>"
SMTP_SECURE="true"
```

For a provider using STARTTLS on port 587, use the provider's required settings, commonly:

```env
SMTP_PORT="587"
SMTP_SECURE="false"
```

Use the exact values supplied by your provider. Do not assume every email host uses the same settings.

**Admin setting priority:** The application's admin System Settings may take priority over environment SMTP settings. If email does not work after configuring `.env`, review the email/SMTP configuration in the admin dashboard and make sure it contains the correct current values.

After configuration, test email delivery using a feature that sends a real system email. Check the recipient inbox, spam folder, and server/application logs.

## 8. Flutterwave — online donations

Only configure this section if NPC Rwanda is ready to accept online donations and its Flutterwave merchant account is approved for the required payment methods.

### 8.1 Prepare the Flutterwave account

1. Sign in to the official Flutterwave dashboard.
2. Complete the merchant/business verification and settlement requirements.
3. Check that the required payment methods are enabled for the merchant account, including Rwanda mobile money and card payments where available.
4. Start with test credentials. Do not switch to live credentials until the merchant account and payment methods are approved and test transactions have been completed.

Get the keys from the Flutterwave dashboard's API keys/settings area.

### 8.2 Add the credentials

For test mode, use the test keys supplied by Flutterwave:

```env
FLW_PUBLIC_KEY="YOUR_FLUTTERWAVE_TEST_PUBLIC_KEY"
FLW_SECRET_KEY="YOUR_FLUTTERWAVE_TEST_SECRET_KEY"
FLW_SECRET_HASH="YOUR_RANDOM_WEBHOOK_SECRET"
```

- `FLW_PUBLIC_KEY`: Flutterwave public key.
- `FLW_SECRET_KEY`: Flutterwave secret key. Keep it server-side and private.
- `FLW_SECRET_HASH`: a strong secret value that you create and also enter in the Flutterwave webhook configuration. The two values must match exactly.

Generate a webhook secret value if needed:

```bash
openssl rand -hex 32
```

Do not use the generated example or share the value publicly.

### 8.3 Configure the webhook

In the Flutterwave dashboard, configure the webhook URL as:

```text
https://npcrwanda.org/api/donations/webhook
```

Set the webhook secret hash to exactly the same value as `FLW_SECRET_HASH` in the production `.env` file. Enable the payment completion event required by the integration (the application handles the `charge.completed` event).

The webhook allows the application to receive a payment event. The application must still verify the transaction with Flutterwave before treating a donation as successful. A browser redirect alone is not proof of payment.

### 8.4 USD donations paid by Rwanda mobile money

The website requires a current USD-to-RWF rate for USD donations paid through Rwanda mobile money.

Example:

```env
USD_RWF_MOBILE_MONEY_RATE="RATE_IN_RWF_FOR_ONE_USD"
USD_RWF_MOBILE_MONEY_RATE_DATE="YYYY-MM-DD"
```

For example, if the approved rate you are using is 1 USD = 1,450 RWF, enter `1450` as the rate and the date on which it was confirmed. This is an example only, not a recommendation of today's exchange rate.

The application rejects a missing rate or a rate date that is in the future or more than 7 days old. Assign someone to check and update the rate regularly. Confirm the rate and any fees with the finance team before accepting payments.

### 8.5 Switch from test to live

After successful testing and approval:

1. Obtain the live keys from Flutterwave.
2. Replace the test public and secret keys with the live keys.
3. Confirm the webhook secret hash configured in Flutterwave matches the production `FLW_SECRET_HASH`.
4. Confirm the live webhook URL is correct.
5. Save the environment file and rebuild/restart the application as described in Section 11.
6. Make a controlled live test only if approved by the finance team, then verify the transaction in both Flutterwave and the NPC Rwanda admin dashboard.

Never mix a test public key with a live secret key, or the reverse.

## 9. Migration and seed safeguards

Keep these values as follows for normal production operation:

```env
RUN_PRISMA_MIGRATIONS="false"
ALLOW_DESTRUCTIVE_SEED="false"
```

- `RUN_PRISMA_MIGRATIONS`: migrations are disabled by default in the build process. Only enable this deliberately when a reviewed migration is intended to run against the database.
- `ALLOW_DESTRUCTIVE_SEED`: keep false in production. Do not enable destructive seed operations against the live database.

Before a production migration, review the migration, back up the database, and arrange a maintenance window if required. Do not run development seed scripts against production data.

## 10. Complete environment variable checklist

| Variable | Required purpose | Where to get it |
|---|---|---|
| `NODE_ENV` | Production runtime | Set to `production` |
| `PORT` | Application listening port | Confirm VPS/PM2/reverse proxy configuration |
| `PUBLIC_APP_URL` | Public website URL | NPC Rwanda domain |
| `NEXT_PUBLIC_PUBLIC_APP_URL` | Public URL compatibility setting | NPC Rwanda domain |
| `DATABASE_URL` | PostgreSQL connection | VPS/database administrator |
| `JWT_SECRET` | Login/session signing | Generate securely on VPS |
| `CLOUDINARY_CLOUD_NAME` | Media account name | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Media API key | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Media API secret | Cloudinary dashboard |
| `CLOUDINARY_URL` | Combined Cloudinary connection | Construct from Cloudinary credentials if needed |
| `SMTP_HOST` | Outgoing mail server | Email provider |
| `SMTP_PORT` | SMTP port | Email provider |
| `SMTP_USER` | SMTP account | Email provider |
| `SMTP_PASS` | SMTP password/app password | Email provider |
| `SMTP_FROM` | Sender identity | Approved NPC Rwanda mailbox |
| `SMTP_SECURE` | SMTP encryption mode | Email provider |
| `FLW_PUBLIC_KEY` | Donation checkout public key | Flutterwave dashboard |
| `FLW_SECRET_KEY` | Server-side payment verification | Flutterwave dashboard |
| `FLW_SECRET_HASH` | Webhook verification secret | Generate it and configure same value in Flutterwave |
| `USD_RWF_MOBILE_MONEY_RATE` | USD-to-RWF conversion for mobile money | Finance-approved current rate |
| `USD_RWF_MOBILE_MONEY_RATE_DATE` | Date of conversion rate | Date rate was confirmed |
| `RUN_PRISMA_MIGRATIONS` | Build-time migration safeguard | Keep false unless a migration is planned |
| `ALLOW_DESTRUCTIVE_SEED` | Destructive seed safeguard | Keep false in production |

Some integrations are optional depending on whether the corresponding feature is being used. Flutterwave variables are required for online donation payments; SMTP values are required for outgoing email; Cloudinary credentials are required for media uploads. Keep all configured values accurate even if a feature is temporarily disabled.

## 11. Create the donation payment logs table

The donation payment history feature stores its events in a new append-only database table. Apply the supplied additive SQL migration once before deploying the new application code.

On the VPS, from the project directory:

```bash
cd /var/www/NPCRwanda
set -a
. ./.env
set +a
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/manual-migrations/20261110_donation_payment_logs.sql
```

This migration creates only the `DonationPaymentLog` table and its indexes. It does not alter or delete existing donation records.

If the `psql` command is unavailable, install the PostgreSQL client package for your Ubuntu version or ask the database administrator to run the SQL file against the production database. Do not enable `RUN_PRISMA_MIGRATIONS` just for this table; the project intentionally keeps automatic production migrations disabled by default.

After the migration succeeds, continue with the build and restart steps below.

## 12. Save, build, and restart the website

After editing `.env`, save the file and exit the editor.

Check that the file exists and has restricted permissions:

```bash
cd /var/www/NPCRwanda
chmod 600 .env
```

Do not print the contents of `.env` into a public terminal log or send them to anyone.

Deploy the latest committed code and build:

```bash
git pull --ff-only origin main
npm run build
```

Only if the build completes successfully, restart the application:

```bash
pm2 restart npcrwanda --update-env
pm2 status
```

If the build fails, do not restart into an unbuilt release. Review the error first and correct the issue.

## 13. Production verification checklist

After restart, verify each service separately:

### Website
- [ ] Open https://npcrwanda.org.
- [ ] Confirm the website loads over HTTPS.
- [ ] Check important public pages on desktop and mobile.
- [ ] Sign in to the admin dashboard and confirm authorized users can access their permitted sections.

### Database
- [ ] Confirm the website can load database-backed content.
- [ ] Confirm admin changes save and remain after refreshing.
- [ ] Confirm no database connection errors appear in application logs.

### Media
- [ ] Upload a test image through the authorized admin interface.
- [ ] Confirm the image displays on the public website.
- [ ] Confirm the upload does not expose private Cloudinary credentials.

### Email
- [ ] Trigger an expected system email using a test workflow.
- [ ] Confirm it arrives at the intended address.
- [ ] Check spam/junk and application logs if it does not arrive.

### Donations
- [ ] Test card checkout using Flutterwave test mode.
- [ ] Test Rwanda mobile money using test mode and only where the merchant account supports it.
- [ ] Test the USD mobile-money conversion with a valid, current rate.
- [ ] Confirm an unsuccessful or cancelled payment is not recorded as successful.
- [ ] Confirm a successful payment is verified and appears in the admin donations area.
- [ ] Confirm the donor receipt email is sent after verified success.
- [ ] Confirm the Flutterwave webhook reaches the website and is accepted only with the correct secret hash.

Do not use real donor funds for testing. Follow Flutterwave's test-mode instructions.

## 14. Troubleshooting

**Website does not start after restart**
- Check `pm2 status`.
- Review application logs with `pm2 logs npcrwanda --lines 100`.
- Check the build output and confirm the configured port matches the reverse proxy.

**Database connection error**
- Check the database host, database name, username, password, and port in `DATABASE_URL`.
- Confirm PostgreSQL is running and accepts connections from the application server.
- Check whether special characters in the password were URL-encoded.

**Image upload fails**
- Recheck Cloudinary cloud name, API key, and API secret.
- Confirm the credentials belong to the intended Cloudinary account.
- Rotate any credential that may have been exposed.

**Email is not delivered**
- Confirm SMTP hostname, port, username, password, and encryption mode with the email provider.
- Check the admin System Settings because saved SMTP settings may take priority over `.env`.
- Check provider restrictions, spam folders, and application logs.

**Donation checkout fails**
- Confirm the correct Flutterwave key pair is being used (test with test, live with live).
- Confirm the merchant account is approved for the selected payment method.
- Check that the webhook URL and secret hash match.
- For USD mobile money, confirm the exchange rate exists and its date is not older than seven days.

**Payment appears in Flutterwave but not in the admin dashboard**
- Check application logs and webhook delivery history in Flutterwave.
- Confirm the transaction verification request succeeds.
- Do not manually mark an unverified payment as successful.

## 15. Operational security and maintenance

- Restrict VPS and admin access to authorized staff.
- Keep production secrets only on the server or in a trusted secret manager.
- Never commit `.env` or paste its contents into issue trackers.
- Back up PostgreSQL before planned migrations and on a regular schedule.
- Rotate credentials if they are exposed or a staff member with access leaves.
- Keep Flutterwave keys in the correct environment (test or live).
- Review the USD/RWF rate at least weekly if USD mobile-money donations are enabled.
- Keep a record of who is responsible for SMTP, Cloudinary, Flutterwave, database backups, and exchange-rate updates.

---

**Configuration ownership:** NPC Rwanda should keep an authorized person responsible for each external account and for safely maintaining the production environment. This guide documents the configuration process; it does not mean that external accounts, payment approvals, email delivery, or live transactions have already been verified.
