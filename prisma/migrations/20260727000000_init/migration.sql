CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'GENERATED');

CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "cafeName" TEXT NOT NULL,
    "visitedAt" DATE NOT NULL,
    "area" TEXT NOT NULL,
    "cafeType" JSONB NOT NULL,
    "basic" JSONB NOT NULL,
    "access" JSONB NOT NULL,
    "exterior" JSONB NOT NULL,
    "space" JSONB NOT NULL,
    "atmosphere" JSONB NOT NULL,
    "menuOverview" JSONB NOT NULL,
    "orderedItems" JSONB NOT NULL,
    "usability" JSONB NOT NULL,
    "service" JSONB NOT NULL,
    "photo" JSONB NOT NULL,
    "conclusion" JSONB NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "titleOptions" JSONB,
    "selectedTitle" TEXT,
    "summary" TEXT,
    "body" TEXT,
    "tags" JSONB,
    "photoPlan" JSONB,
    "warnings" JSONB,
    "aiModel" TEXT,
    "promptVersion" TEXT,
    "generationCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "succeeded" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Review_visitedAt_idx" ON "Review"("visitedAt");
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");
CREATE INDEX "Review_cafeName_idx" ON "Review"("cafeName");
CREATE INDEX "LoginAttempt_ipHash_createdAt_idx" ON "LoginAttempt"("ipHash", "createdAt");
