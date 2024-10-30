/*
  Warnings:

  - You are about to drop the column `script` on the `Variable` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Variable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL DEFAULT 'selector',
    "key" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Variable" ("createdAt", "id", "key", "type", "updatedAt") SELECT "createdAt", "id", "key", "type", "updatedAt" FROM "Variable";
DROP TABLE "Variable";
ALTER TABLE "new_Variable" RENAME TO "Variable";
CREATE UNIQUE INDEX "Variable_key_key" ON "Variable"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
