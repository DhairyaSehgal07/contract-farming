import prisma from "@/lib/prisma";
import { hashOtpCode, verifyOtpHash } from "@/lib/services/otp/hash";
import type { OtpProvider, SendOtpContext } from "@/lib/services/otp/types";

const OTP_TTL_MS = 10 * 60 * 1000;

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeMobileNumber(mobileNumber: string) {
  return mobileNumber.trim();
}

export function createMockOtpProvider(): OtpProvider {
  return {
    async sendOtp(context: SendOtpContext) {
      const mobileNumber = normalizeMobileNumber(context.mobileNumber);
      const code = generateOtpCode();
      const expiresAt = new Date(Date.now() + OTP_TTL_MS);

      await prisma.otpChallenge.deleteMany({
        where: {
          purpose: context.purpose,
          referenceId: context.referenceId,
        },
      });

      await prisma.otpChallenge.create({
        data: {
          purpose: context.purpose,
          referenceId: context.referenceId,
          mobileNumber,
          codeHash: hashOtpCode(code),
          expiresAt,
        },
      });

      if (process.env.NODE_ENV === "development") {
        console.info(
          `[mock-otp] ${context.purpose} for ${mobileNumber}: ${code}`,
        );
      }

      return {
        expiresAt,
        // TODO: remove once real SMS OTP is wired — mock provider only
        devOtp: code,
      };
    },

    async verifyOtp(context: SendOtpContext, code: string) {
      const challenge = await prisma.otpChallenge.findFirst({
        where: {
          purpose: context.purpose,
          referenceId: context.referenceId,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!challenge) {
        return false;
      }

      if (challenge.expiresAt.getTime() < Date.now()) {
        return false;
      }

      const mobileNumber = normalizeMobileNumber(context.mobileNumber);
      if (challenge.mobileNumber !== mobileNumber) {
        return false;
      }

      if (!verifyOtpHash(code.trim(), challenge.codeHash)) {
        return false;
      }

      await prisma.otpChallenge.deleteMany({
        where: {
          purpose: context.purpose,
          referenceId: context.referenceId,
        },
      });

      return true;
    },
  };
}
