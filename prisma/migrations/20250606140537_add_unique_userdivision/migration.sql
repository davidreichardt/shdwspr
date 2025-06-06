/*
  Warnings:

  - A unique constraint covering the columns `[userId,divisionId]` on the table `UserDivision` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserDivision_userId_divisionId_key" ON "UserDivision"("userId", "divisionId");
