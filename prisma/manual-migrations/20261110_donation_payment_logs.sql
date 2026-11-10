-- NPC Rwanda donation payment event log table
-- Safe additive migration: creates a new table and indexes only.
CREATE TABLE IF NOT EXISTS "DonationPaymentLog" (
  "id" TEXT PRIMARY KEY,
  "donationPaymentId" TEXT,
  "txRef" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "DonationPaymentLog_txRef_createdAt_idx"
  ON "DonationPaymentLog"("txRef", "createdAt");
CREATE INDEX IF NOT EXISTS "DonationPaymentLog_event_createdAt_idx"
  ON "DonationPaymentLog"("event", "createdAt");
CREATE INDEX IF NOT EXISTS "DonationPaymentLog_status_createdAt_idx"
  ON "DonationPaymentLog"("status", "createdAt");
