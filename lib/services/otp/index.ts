import { createMockOtpProvider } from "@/lib/services/otp/mock-provider";
import type { OtpProvider } from "@/lib/services/otp/types";

let provider: OtpProvider | null = null;

export function getOtpProvider(): OtpProvider {
  provider ??= createMockOtpProvider();
  return provider;
}

export type {
  OtpProvider,
  OtpPurpose,
  SendOtpContext,
  SendOtpResult,
} from "@/lib/services/otp/types";
