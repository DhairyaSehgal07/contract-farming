import { describe, expect, it } from "vitest";
import { hashOtpCode, verifyOtpHash } from "@/lib/services/otp/hash";

describe("otp hash helpers", () => {
  it("hashes and verifies OTP codes", () => {
    const hash = hashOtpCode("123456");
    expect(verifyOtpHash("123456", hash)).toBe(true);
    expect(verifyOtpHash("654321", hash)).toBe(false);
  });
});
