// backend/src/totp.ts
import crypto from "crypto";

/**
 * RFC 6238 Time-Based One-Time Password (TOTP) implementation
 * Built using Node crypto without heavy external dependencies.
 */

// Base32 character set (RFC 4648)
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateBase32Secret(byteLength = 20): string {
  const buffer = crypto.randomBytes(byteLength);
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i]!;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(input: string): Buffer {
  const cleanInput = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleanInput.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleanInput[i]!);
    if (val === -1) continue;

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generate 6-digit TOTP code for a given timestamp counter.
 */
export function generateTOTPCode(secret: string, timestampMs = Date.now(), timeStepSec = 30): string {
  const key = base32Decode(secret);
  const counter = Math.floor(timestampMs / 1000 / timeStepSec);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac("sha1", key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1]! & 0x0f;
  const codeInt =
    ((digest[offset]! & 0x7f) << 24) |
    ((digest[offset + 1]! & 0xff) << 16) |
    ((digest[offset + 2]! & 0xff) << 8) |
    (digest[offset + 3]! & 0xff);

  const code = (codeInt % 1_000_000).toString().padStart(6, "0");
  return code;
}

/**
 * Verify a 6-digit TOTP code with time-window drift tolerance (±1 step).
 */
export function verifyTOTPCode(
  secret: string,
  token: string,
  timestampMs = Date.now(),
  timeStepSec = 30,
  window = 1
): boolean {
  if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) {
    return false;
  }

  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const testTime = timestampMs + errorWindow * timeStepSec * 1000;
    const generated = generateTOTPCode(secret, testTime, timeStepSec);
    if (crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(token))) {
      return true;
    }
  }

  return false;
}

/**
 * Generate cryptographic backup codes (e.g. "A1B2-C3D4").
 */
export function generateBackupCodes(count = 8): { rawCodes: string[]; hashedCodes: string[] } {
  const rawCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const part1 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const part2 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const code = `${part1}-${part2}`;
    const hash = crypto.createHash("sha256").update(code).digest("hex");

    rawCodes.push(code);
    hashedCodes.push(hash);
  }

  return { rawCodes, hashedCodes };
}

/**
 * Construct standard `otpauth://` URI for QR code scanning in Google Authenticator / Authy.
 */
export function getOTPAuthURI(secret: string, accountName: string, issuer = "CodeArena"): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
