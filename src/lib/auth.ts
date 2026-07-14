import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./database.js";

// CORS_ORIGINS / TRUSTED_ORIGINS: lista separada por comas en .env.
// Así, cuando agregues un dominio nuevo (ej. portfolios.blackpolar.org)
// no hay que tocar código, solo la variable de entorno.
const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? "http://localhost:3000,http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectURL: process.env.GOOGLE_REDIRECT_URL || "http://localhost:4000/api/auth/callback/google",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        input: false, // el usuario no puede setear su propio rol
      },
      adminUniqueId: {
        type: "string",
        input: false, // se establece solo para admins
      },
    },
  },
  trustedOrigins,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

export type Session = typeof auth.$Infer.Session;
