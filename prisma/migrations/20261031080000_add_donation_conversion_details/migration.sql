ALTER TABLE "DonationPayment"
  ADD COLUMN "donorAmount" INTEGER,
  ADD COLUMN "donorCurrency" TEXT,
  ADD COLUMN "exchangeRate" DOUBLE PRECISION,
  ADD COLUMN "exchangeRateDate" TEXT;
