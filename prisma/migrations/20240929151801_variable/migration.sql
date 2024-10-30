/*
  Warnings:

  - You are about to drop the column `templateId` on the `Variable` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Variable` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Value" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idVariable" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Value_idVariable_fkey" FOREIGN KEY ("idVariable") REFERENCES "Variable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Variable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Variable" ("createdAt", "id", "key", "updatedAt") SELECT "createdAt", "id", "key", "updatedAt" FROM "Variable";
DROP TABLE "Variable";
ALTER TABLE "new_Variable" RENAME TO "Variable";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
