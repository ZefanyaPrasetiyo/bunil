import prisma from "./prisma";
import type { Jurusan, Role } from "../app/generated/prisma/client";

type CreateUserInput = {
  no_spmb?: string;
  nama: string;
  password?: string;
  jurusan?: Jurusan | null;
  role: Role;
};

type User = {
  no_spmb?: string;
  nama: string;
  password?: string;
  jurusan?: Jurusan | null;
  role: Role;
};


type UpdateUserInput = Partial<CreateUserInput>;

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { nama: "asc" },
    include: {
      nilai: true
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(data: CreateUserInput) {
  return prisma.user.create({
    data: {
      no_spmb: data.no_spmb,
      nama: data.nama,
      password: data.password,
      jurusan: data.jurusan,
      role: data.role,
    },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as UpdateUserInput;

  return prisma.user.update({
    where: { id },
    data: cleanData,
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}
