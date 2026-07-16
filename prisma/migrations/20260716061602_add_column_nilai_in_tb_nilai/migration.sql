/*
  Warnings:

  - Added the required column `nilai` to the `Nilai` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Nilai" ADD COLUMN     "nilai" DOUBLE PRECISION NOT NULL;
