import { createHash, timingSafeEqual } from "node:crypto";

export function hashOtpCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export function verifyOtpHash(code: string, codeHash: string) {
  const digest = Buffer.from(hashOtpCode(code), "hex");
  const expected = Buffer.from(codeHash, "hex");

  if (digest.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(digest, expected);
}
