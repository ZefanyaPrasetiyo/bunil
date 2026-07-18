/*
  Warnings:

  - The values [BC] on the enum `Jurusan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Jurusan_new" AS ENUM ('DKV', 'RPL', 'ANIMASI', 'TKJ', 'PSPT', 'TE');
ALTER TABLE "user" ALTER COLUMN "jurusan" TYPE "Jurusan_new" USING ("jurusan"::text::"Jurusan_new");
ALTER TYPE "Jurusan" RENAME TO "Jurusan_old";
ALTER TYPE "Jurusan_new" RENAME TO "Jurusan";
DROP TYPE "public"."Jurusan_old";
COMMIT;
