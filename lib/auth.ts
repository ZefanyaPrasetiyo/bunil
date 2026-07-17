import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { username } from "better-auth/plugins";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => {
        return bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return bcrypt.compare(password, hash);
      },
    },
  },

  plugins: [
    username({
      usernameValidator: (value) => /^[\p{L}0-9_. ]+$/u.test(value.trim()),
    }),
  ],

  // Daftarkan field custom supaya ikut ke session.user
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
        input: false, // cegah user set role sendiri lewat sign-up
      },
      jurusan: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },

  logger: {
    level: "debug",
  },

  session: {
    deferSessionRefresh: true,
    expiresIn: 60 * 60 * 7,
    updateAge: 60 * 60 * 7,
  },

  secret: process.env.BETTER_AUTH_SECRET!,
});