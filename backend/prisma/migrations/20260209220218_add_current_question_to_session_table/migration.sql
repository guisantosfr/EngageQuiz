/*
  Warnings:

  - The values [QUESTION_OPEN,QUESTION_CLOSED] on the enum `StatusType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusType_new" AS ENUM ('CREATED', 'IN_PROGRESS', 'FINISHED', 'CANCELED');
ALTER TABLE "Session" ALTER COLUMN "status" TYPE "StatusType_new" USING ("status"::text::"StatusType_new");
ALTER TYPE "StatusType" RENAME TO "StatusType_old";
ALTER TYPE "StatusType_new" RENAME TO "StatusType";
DROP TYPE "public"."StatusType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "currentQuestionIndex" INTEGER;
