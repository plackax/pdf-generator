/*
  Warnings:

  - A unique constraint covering the columns `[idVariable,value]` on the table `Value` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Value_idVariable_value_key" ON "Value"("idVariable", "value");
