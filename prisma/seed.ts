import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, Jurusan } from "@/app/generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function createUser(data: {
  username: string;
  password: string;
  role: Role;
  jurusan?: Jurusan;
  no_spmb?: string;
  nama?: string;
}) {
  const hash = await bcrypt.hash(data.password, 10);
  console.log("===========", hash)

  const user = await prisma.user.create({
    data: {
      username: data.username,
      no_spmb: data.no_spmb,
      nama: data.nama,
      jurusan: data.jurusan,
      role: data.role,
      password: hash,
    },
  });

  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: data.username,
      providerId: "credential",
      userId: user.id,
      password: hash,
    },
  });

  return user;
}
async function main() {
  console.log("🌱 Seeding database...");

  const [matematika, indonesia, inggris] = await Promise.all([
    prisma.mataPelajaran.create({
      data: { nama: "Matematika" },
    }),
    prisma.mataPelajaran.create({
      data: { nama: "Bahasa Indonesia" },
    }),
    prisma.mataPelajaran.create({
      data: { nama: "Bahasa Inggris" },
    }),
  ]);

  const admin = await createUser({
    username: "jepan",
    password: "jepan2903",
    role: Role.ADMIN,
    nama: "Administrator",
  });

  const budi = await createUser({
    username: "budi",
    password: "SPMB001",
    role: Role.USER,
    nama: "Budi",
    no_spmb: "SPMB001",
    jurusan: Jurusan.RPL,
  });

  const andi = await createUser({
    username: "andi",
    password: "SPMB002",
    role: Role.USER,
    nama: "Andi",
    no_spmb: "SPMB002",
    jurusan: Jurusan.DKV,
  });

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
    console.log("🎉 Seed berhasil");
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });