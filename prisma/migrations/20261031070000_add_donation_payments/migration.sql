-- CreateTable
CREATE TABLE "DonationPayment" (
  "id" TEXT NOT NULL,
  "txRef" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'RWF',
  "supportType" TEXT NOT NULL,
  "frequency" TEXT NOT NULL DEFAULT 'One-time',
  "anonymous" BOOLEAN NOT NULL DEFAULT false,
  "paymentMethod" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "provider" TEXT NOT NULL DEFAULT 'FLUTTERWAVE',
  "providerId" BIGINT,
  "providerRef" TEXT,
  "checkoutUrl" TEXT,
  "failureReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  CONSTRAINT "DonationPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DonationPayment_txRef_key" ON "DonationPayment"("txRef");
CREATE INDEX "DonationPayment_status_idx" ON "DonationPayment"("status");
CREATE INDEX "DonationPayment_createdAt_idx" ON "DonationPayment"("createdAt");
CREATE INDEX "DonationPayment_email_idx" ON "DonationPayment"("email");
