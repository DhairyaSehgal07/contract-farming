import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { ac, authRoles } from "@/components/auth/permissions";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      stationId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    adminPlugin({
      ac,
      roles: authRoles,
      defaultRole: "USER",
      impersonationSessionDuration: 60 * 60 * 8,
    }),
    nextCookies(),
  ],
});
