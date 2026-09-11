/*
  Warnings:

  - Added the required column `problemId` to the `Submissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "SubmissionStatus" ADD VALUE 'WrongAnswer';

-- AlterTable
ALTER TABLE "Submissions" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "problemId" TEXT NOT NULL,
ADD COLUMN     "runtime" DOUBLE PRECISION,
ADD COLUMN     "testCasesPassed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "testCasesTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "testResults" JSONB;

-- CreateTable
CREATE TABLE "Problems" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "companies" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "templates" JSONB NOT NULL,
    "testCases" JSONB NOT NULL,

    CONSTRAINT "Problems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Submissions" ADD CONSTRAINT "Submissions_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
