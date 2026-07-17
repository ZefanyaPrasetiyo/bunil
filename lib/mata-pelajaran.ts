import prisma from "./prisma";

type CreateMataPelajaranInput = {
  nama: string;
};

type UpdateMataPelajaranInput = Partial<CreateMataPelajaranInput>;

export async function getMataPelajarans(page = 1, limit = 10) {
  const currentPage = Math.max(1, Number(page) || 1);
  const currentLimit = Math.max(1, Number(limit) || 10);
  const skip = (currentPage - 1) * currentLimit;

  const [mataPelajarans, totalItems] = await prisma.$transaction([
    prisma.mataPelajaran.findMany({
      orderBy: { nama: "asc" },
      skip,
      take: currentLimit,
    }),
    prisma.mataPelajaran.count(),
  ]);

  return {
    data: mataPelajarans,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      totalItems,
      totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / currentLimit),
    },
  };
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
