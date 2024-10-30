/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Variable` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Variable_key_key" ON "Variable"("key");
