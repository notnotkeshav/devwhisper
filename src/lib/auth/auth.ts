import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { getDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { env } from "@/lib/env";

export const auth = betterAuth({
  database: env.DATABASE_URL
    ? drizzleAdapter(getDb(), {
        provider: "pg",
        schema: {
          user: schema.users,
          session: schema.sessions,
          account: schema.accounts,
          verification: schema.verifications
        }
      })
    : undefined,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  socialProviders:
    env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET
          }
        }
      : undefined,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL
});
