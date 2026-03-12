import crypto from "crypto";

const ALGO = "aes-256-gcm";

export const encrypt = (plain: string) => {
  const key = Buffer.from(process.env.ENCRYPTION_KEY ?? "", "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decrypt = (payload: string) => {
  const key = Buffer.from(process.env.ENCRYPTION_KEY ?? "", "hex");
  const [ivHex, tagHex, dataHex] = payload.split(":");
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
};
