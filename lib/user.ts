import prisma from "./prisma";
import bcrypt from "bcryptjs";
import type { Jurusan, Role } from "../app/generated/prisma/client";

type CreateUserInput = {
  username: string;
  password: string;
  name?: string | null;
  jurusan?: Jurusan | null;
  role: Role;
};

type UpdateUserInput = Partial<CreateUserInput>;

export async function getUsers(page = 1, limit = 10) {
  const currentPage = Math.max(1, Number(page) || 1);
  const currentLimit = Math.max(1, Number(limit) || 10);
  const skip = (currentPage - 1) * currentLimit;

  const [users, totalItems] = await prisma.$transaction([
    prisma.user.findMany({
      orderBy: { username: "asc" },
      include: {
        nilai: true,
      },
      skip,
      take: currentLimit,
    }),
    prisma.user.count(),
  ]);

  return {
    data: users,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      totalItems,
      totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / currentLimit),
    },
  } satisfies {
    data: typeof users;
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(data: CreateUserInput) {
  const username = data.username.trim().toLowerCase();
  const hashedPassword = data.password
    ? await bcrypt.hash(data.password, 10)
    : "";

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username,
        password: hashedPassword,
        name: data.name,
        jurusan: data.jurusan,
        role: data.role,
      },
    });

    await tx.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: username,
        providerId: "credential",
        userId: user.id,
        password: hashedPassword,
      },
    });

    return user;
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const cleanData = { ...data };

  if (cleanData.username) {
    cleanData.username = cleanData.username.trim().toLowerCase();
  }

  if (cleanData.password) {
    cleanData.password = await bcrypt.hash(cleanData.password, 10);
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({ where: { id }, data: cleanData });

    if (cleanData.password || cleanData.username) {
      await tx.account.updateMany({
        where: { userId: id, providerId: "credential" },
        data: {
          ...(cleanData.password ? { password: cleanData.password } : {}),
          ...(cleanData.username ? { accountId: cleanData.username } : {}),
        },
      });
    }

    return user;
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}
