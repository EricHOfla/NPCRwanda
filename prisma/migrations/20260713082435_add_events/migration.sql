-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "endDate" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'National',
    "status" TEXT NOT NULL DEFAULT 'Upcoming',
    "img" TEXT NOT NULL DEFAULT 'sports-hero.jpg',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_featured_idx" ON "Event"("featured");
