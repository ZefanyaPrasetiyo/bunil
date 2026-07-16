/*
  Warnings:

  - You are about to drop the column `latihan` on the `MataPelajaran` table. All the data in the column will be lost.
  - You are about to drop the `Latihan` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Kelamin" AS ENUM ('Laki', 'Perempuan');

-- AlterTable
ALTER TABLE "MataPelajaran" DROP COLUMN "latihan";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;

-- DropTable
DROP TABLE "Latihan";
