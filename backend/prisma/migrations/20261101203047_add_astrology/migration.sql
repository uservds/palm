-- CreateTable
CREATE TABLE "NatalChart" (
    "id" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthTime" TEXT,
    "timeKnown" BOOLEAN NOT NULL DEFAULT true,
    "birthPlace" TEXT NOT NULL,
    "birthLat" DOUBLE PRECISION,
    "birthLng" DOUBLE PRECISION,
    "timezone" TEXT,
    "positions" JSONB,
    "calculatedAt" TIMESTAMP(3),
    "calcError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "NatalChart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingDateRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "partner1ChartId" TEXT NOT NULL,
    "partner2ChartId" TEXT NOT NULL,
    "eventCity" TEXT NOT NULL,
    "eventLat" DOUBLE PRECISION,
    "eventLng" DOUBLE PRECISION,
    "eventTimezone" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WeddingDateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingDateCandidate" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "candidateDate" TIMESTAMP(3) NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "passedFilters" BOOLEAN NOT NULL,
    "venusRetrograde" BOOLEAN NOT NULL,
    "mercuryRetrograde" BOOLEAN NOT NULL,
    "moonPhase" TEXT NOT NULL,
    "angularConflicts" JSONB NOT NULL,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingDateCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyHoroscope" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "natalChartId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "transitData" JSONB NOT NULL,
    "sentChannels" JSONB,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyHoroscope_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NatalChart_userId_idx" ON "NatalChart"("userId");

-- CreateIndex
CREATE INDEX "WeddingDateRequest_userId_idx" ON "WeddingDateRequest"("userId");

-- CreateIndex
CREATE INDEX "WeddingDateRequest_status_idx" ON "WeddingDateRequest"("status");

-- CreateIndex
CREATE INDEX "WeddingDateCandidate_requestId_idx" ON "WeddingDateCandidate"("requestId");

-- CreateIndex
CREATE INDEX "WeddingDateCandidate_requestId_rank_idx" ON "WeddingDateCandidate"("requestId", "rank");

-- CreateIndex
CREATE INDEX "DailyHoroscope_userId_idx" ON "DailyHoroscope"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyHoroscope_userId_date_key" ON "DailyHoroscope"("userId", "date");

-- AddForeignKey
ALTER TABLE "NatalChart" ADD CONSTRAINT "NatalChart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingDateRequest" ADD CONSTRAINT "WeddingDateRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingDateRequest" ADD CONSTRAINT "WeddingDateRequest_partner1ChartId_fkey" FOREIGN KEY ("partner1ChartId") REFERENCES "NatalChart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingDateRequest" ADD CONSTRAINT "WeddingDateRequest_partner2ChartId_fkey" FOREIGN KEY ("partner2ChartId") REFERENCES "NatalChart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingDateCandidate" ADD CONSTRAINT "WeddingDateCandidate_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "WeddingDateRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyHoroscope" ADD CONSTRAINT "DailyHoroscope_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyHoroscope" ADD CONSTRAINT "DailyHoroscope_natalChartId_fkey" FOREIGN KEY ("natalChartId") REFERENCES "NatalChart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
