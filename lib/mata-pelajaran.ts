import prisma from "./prisma";

type CreateMataPelajaranInput = {
  nama: string;
};

type UpdateMataPelajaranInput = Partial<CreateMataPelajaranInput>;

export async function getMataPelajarans() {
  return prisma.mataPelajaran.findMany({
    orderBy: { nama: "asc" },
  });
}

export async function getMataPelajaranById(id: string) {
  return prisma.mataPelajaran.findUnique({
    where: { id },
  });
}

export async function createMataPelajaran(data: CreateMataPelajaranInput) {
  return prisma.mataPelajaran.create({
    data: {
      nama: data.nama,
    },
  });
}

export async function updateMataPelajaran(id: string, data: UpdateMataPelajaranInput) {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as UpdateMataPelajaranInput;

  return prisma.mataPelajaran.update({
    where: { id },
    data: cleanData,
  });
}

export async function deleteMataPelajaran(id: string) {
  return prisma.mataPelajaran.delete({
    where: { id },
  });
}
