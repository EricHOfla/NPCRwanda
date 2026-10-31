-- Public sports development, competition, registration and engagement features.
CREATE TABLE "TrainingProgram" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sport" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "schedule" TEXT NOT NULL DEFAULT '',
  "startDate" TEXT NOT NULL DEFAULT '',
  "endDate" TEXT NOT NULL DEFAULT '',
  "eligibility" TEXT NOT NULL DEFAULT '',
  "contactEmail" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TrainingProgram_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TrainingProgram_status_idx" ON "TrainingProgram"("status");
CREATE INDEX "TrainingProgram_sport_idx" ON "TrainingProgram"("sport");

CREATE TABLE "CompetitionResult" (
  "id" TEXT NOT NULL,
  "eventTitle" TEXT NOT NULL,
  "competitionDate" TEXT NOT NULL,
  "athleteName" TEXT NOT NULL,
  "sport" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT '',
  "position" TEXT NOT NULL DEFAULT '',
  "medal" TEXT NOT NULL DEFAULT '',
  "result" TEXT NOT NULL DEFAULT '',
  "notes" TEXT NOT NULL DEFAULT '',
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompetitionResult_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CompetitionResult_published_idx" ON "CompetitionResult"("published");
CREATE INDEX "CompetitionResult_competitionDate_idx" ON "CompetitionResult"("competitionDate");
CREATE INDEX "CompetitionResult_sport_idx" ON "CompetitionResult"("sport");

CREATE TABLE "AthleteEnquiry" (
  "id" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "district" TEXT NOT NULL,
  "sport" TEXT NOT NULL,
  "ageRange" TEXT NOT NULL DEFAULT '',
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'New',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AthleteEnquiry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AthleteEnquiry_status_idx" ON "AthleteEnquiry"("status");
CREATE INDEX "AthleteEnquiry_createdAt_idx" ON "AthleteEnquiry"("createdAt");

CREATE TABLE "EventRegistration" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "eventTitle" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "organization" TEXT NOT NULL DEFAULT '',
  "accessibilityNeeds" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");
CREATE INDEX "EventRegistration_status_idx" ON "EventRegistration"("status");

CREATE TABLE "SponsorInquiry" (
  "id" TEXT NOT NULL,
  "organization" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL DEFAULT '',
  "supportType" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'New',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SponsorInquiry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SponsorInquiry_status_idx" ON "SponsorInquiry"("status");
CREATE INDEX "SponsorInquiry_createdAt_idx" ON "SponsorInquiry"("createdAt");

CREATE TABLE "GalleryItem" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "mediaUrl" TEXT NOT NULL,
  "mediaType" TEXT NOT NULL DEFAULT 'image',
  "category" TEXT NOT NULL DEFAULT 'General',
  "eventDate" TEXT NOT NULL DEFAULT '',
  "published" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "GalleryItem_published_idx" ON "GalleryItem"("published");
CREATE INDEX "GalleryItem_category_idx" ON "GalleryItem"("category");
