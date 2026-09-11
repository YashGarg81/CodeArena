-- AlterEnum
ALTER TYPE "SubmissionStatus" ADD VALUE 'TLE';

-- AlterTable
ALTER TABLE "Submissions" ALTER COLUMN "status" SET DEFAULT 'Processing';
