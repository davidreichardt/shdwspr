-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "systemRole" TEXT NOT NULL DEFAULT 'USER'
);
INSERT INTO "new_User" ("avatar", "createdAt", "discordHandle", "discordId", "id", "preferredName", "rank", "rsiHandle", "systemRole", "updatedAt") SELECT "avatar", "createdAt", "discordHandle", "discordId", "id", "preferredName", "rank", "rsiHandle", "systemRole", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_rsiHandle_key" ON "User"("rsiHandle");
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
CREATE UNIQUE INDEX "User_discordHandle_key" ON "User"("discordHandle");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
