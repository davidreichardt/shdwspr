/*
  Warnings:

  - You are about to drop the column `answers` on the `Application` table. All the data in the column will be lost.
  - Added the required column `data` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "reviewedById" INTEGER,
    "notes" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Application_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("archived", "id", "notes", "reviewedAt", "reviewedById", "status", "submittedAt", "userId") SELECT "archived", "id", "notes", "reviewedAt", "reviewedById", "status", "submittedAt", "userId" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rsiHandle" TEXT,
    "discordId" TEXT NOT NULL,
    "discordHandle" TEXT NOT NULL,
    "showDiscordHandle" BOOLEAN NOT NULL DEFAULT false,
    "preferredName" TEXT,
    "rank" TEXT NOT NULL DEFAULT 'RECRUIT',
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "systemRole" TEXT NOT NULL DEFAULT 'USER',
    "isMember" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("avatar", "createdAt", "discordHandle", "discordId", "id", "preferredName", "rank", "rsiHandle", "showDiscordHandle", "systemRole", "updatedAt") SELECT "avatar", "createdAt", "discordHandle", "discordId", "id", "preferredName", "rank", "rsiHandle", "showDiscordHandle", "systemRole", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_rsiHandle_key" ON "User"("rsiHandle");
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
CREATE UNIQUE INDEX "User_discordHandle_key" ON "User"("discordHandle");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
