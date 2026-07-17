-- DropForeignKey
ALTER TABLE "Nilai" DROP CONSTRAINT "Nilai_mapelId_fkey";

-- DropForeignKey
ALTER TABLE "Nilai" DROP CONSTRAINT "Nilai_userId_fkey";

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "MataPelajaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;
