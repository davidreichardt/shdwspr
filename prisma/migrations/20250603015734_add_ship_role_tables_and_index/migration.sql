/*
  Warnings:

  - You are about to drop the column `role` on the `Ship` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ShipRole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ShipToRole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shipId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    CONSTRAINT "ShipToRole_shipId_fkey" FOREIGN KEY ("shipId") REFERENCES "Ship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ShipToRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ShipRole" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ship" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "scu" INTEGER NOT NULL
);
INSERT INTO "new_Ship" ("id", "manufacturer", "name", "scu", "size") SELECT "id", "manufacturer", "name", "scu", "size" FROM "Ship";
DROP TABLE "Ship";
ALTER TABLE "new_Ship" RENAME TO "Ship";
CREATE UNIQUE INDEX "Ship_name_key" ON "Ship"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ShipRole_name_key" ON "ShipRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShipToRole_shipId_roleId_key" ON "ShipToRole"("shipId", "roleId");

-- CreateIndex
CREATE INDEX "Hangar_userId_shipId_idx" ON "Hangar"("userId", "shipId");
