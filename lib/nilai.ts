import prisma from "./prisma";

type CreateNilaiInput = {
  nilai: number;
  userId: string;
  mapelId: string;
};

type UpdateNilaiInput = Partial<CreateNilaiInput>;

export async function getNilais() {
  return prisma.nilai.findMany({
    include: {
      user: true,
      mapel: true,
    },
  });
}

export async function getNilaiById(id: string) {
  return prisma.nilai.findUnique({
    where: { id },
    include: {
      user: true,
      mapel: true,
    },
  });
}

export async function createNilai(data: CreateNilaiInput) {
  return prisma.nilai.create({
    data: {
      nilai: data.nilai,
      userId: data.userId,
      mapelId: data.mapelId,
    },
    include: {
      user: true,
      mapel: true,
    },
  });
}

export async function updateNilai(id: string, data: UpdateNilaiInput) {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as UpdateNilaiInput;

  return prisma.nilai.update({
    where: { id },
    data: cleanData,
    include: {
      user: true,
      mapel: true,
    },
  });
}

export async function deleteNilai(id: string) {
  return prisma.nilai.delete({
    where: { id },
  });
}
