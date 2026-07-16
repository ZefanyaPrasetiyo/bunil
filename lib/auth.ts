import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { username } from "better-auth/plugins";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),

    emailAndPassword: {
        enabled: false,
        
    },
    plugins: [
        username()
    ],
    session: {
        deferSessionRefresh: true,
        expiresIn: 60 * 60 * 7,
        updateAge: 60 * 60 * 7,
    },

    secret: process.env.BETTER_AUTH_SECRET!,
});