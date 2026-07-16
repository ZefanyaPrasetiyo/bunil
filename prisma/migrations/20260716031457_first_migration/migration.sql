-- CreateEnum
CREATE TYPE "Jurusan" AS ENUM ('DKV', 'RPL', 'ANIMASI', 'TKJ', 'BC', 'TE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "no_spmb" TEXT,
    "nama" TEXT NOT NULL,
    "jurusan" "Jurusan",
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MataPelajaran" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "latihan" TEXT[],

    CONSTRAINT "MataPelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Latihan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nilai" INTEGER[],

    CONSTRAINT "Latihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nilai" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mapelId" TEXT NOT NULL,

    CONSTRAINT "Nilai_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "MataPelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
