-- CreateEnum
CREATE TYPE "StatusType" AS ENUM ('CREATED', 'IN_PROGRESS', 'QUESTION_OPEN', 'QUESTION_CLOSED', 'FINISHED', 'CANCELED');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "StatusType" NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_quizId_idx" ON "Session"("quizId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
