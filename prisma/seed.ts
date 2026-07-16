import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, Jurusan } from "@/app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Seeding database...");

  // ===========================
  // Mata Pelajaran
  // ===========================

  const matematika = await prisma.mataPelajaran.create({
    data: {
      nama: "Matematika",
    },
  });

  const indonesia = await prisma.mataPelajaran.create({
    data: {
      nama: "Bahasa Indonesia",
    },
  });

  const inggris = await prisma.mataPelajaran.create({
    data: {
      nama: "Bahasa Inggris",
    },
  });

  // ===========================
  // User
  // ===========================

  const budi = await prisma.user.create({
    data: {
      username: "Budi",
      password: "SPMB001",
      jurusan: Jurusan.RPL,
      role: Role.USER,
    },
  });

  const andi = await prisma.user.create({
    data: {
      username: "Andi",
      password: "SPMB002",
      jurusan: Jurusan.DKV,
      role: Role.USER,
    },
  });

  const admin = await prisma.user.create({
    data: {
      username: "Administrator",
      password: "admin123",
      role: Role.ADMIN,
    },
  });

  // ===========================
  // Nilai
  // ===========================

  await prisma.nilai.createMany({
    data: [
      {
        userId: budi.id,
        mapelId: matematika.id,
        nilai: 90,
      },
      {
        userId: budi.id,
        mapelId: indonesia.id,
        nilai: 88,
      },
      {
        userId: andi.id,
        mapelId: inggris.id,
        nilai: 95,
      },
    ],
  });

  console.log("✅ Seed selesai");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });