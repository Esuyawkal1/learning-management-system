import crypto from "node:crypto";

const EMAIL_VERIFICATION_TTL_MS = 10 * 60 * 1000;

export const createEmailVerificationCode = () => {
  const code = crypto.randomInt(100000, 1000000).toString();

  return {
    code,
    hashedCode: hashEmailVerificationCode(code),
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
  };
};

export const hashEmailVerificationCode = (code) => {
  return crypto
    .createHash("sha256")
    .update(String(code || "").trim())
    .digest("hex");
};
