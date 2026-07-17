import prisma from "./prisma";
import bcrypt from "bcryptjs";
import type { Jurusan, Role } from "../app/generated/prisma/client";

type CreateUserInput = {
  no_spmb?: string;
  nama: string;
  username: string;
  password?: string;
  jurusan?: Jurusan | null;
  role: Role;
};

type UpdateUserInput = Partial<CreateUserInput>;

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { nama: "asc" },
    include: {
      nilai: true,
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(data: CreateUserInput) {
  const hashedPassword = data.password
    ? await bcrypt.hash(data.password, 10)
    : undefined;

  return prisma.user.create({
    data: {
      no_spmb: data.no_spmb,
      nama: data.nama,
      username: data.username,
      password: hashedPassword,
      jurusan: data.jurusan,
      role: data.role,
    },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const cleanData = {
    ...data,
  };

  if (cleanData.password) {
    cleanData.password = await bcrypt.hash(cleanData.password, 10);
  }

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