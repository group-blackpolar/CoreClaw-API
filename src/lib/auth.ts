import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createClient } from "redis";
import { prisma } from "./database.js";

const redis = createClient({ url: process.env.REDIS_URL });
redis.on("error", (err) => console.error("Redis error:", err));
await redis.connect();

const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? "http://localhost:3000,http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secondaryStorage: {
    get: (key) => redis.get(key),
    set: (key, value, ttl) => (ttl ? redis.set(key, value, { EX: ttl }) : redis.set(key, value)),
    delete: async (key) => {
      await redis.del(key);
      return null;
    },
  },
  session: {
    expiresIn: 60 * 60 * 12,      // timeout absoluto: 12 horas
    updateAge: 60 * 30,            // idle: se refresca si hay actividad cada 30 min
  },
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
      role: { type: "string", defaultValue: "USER", input: false },
      adminUniqueId: { type: "string", input: false },
    },
  },
  trustedOrigins,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

export type Session = typeof auth.$Infer.Session;