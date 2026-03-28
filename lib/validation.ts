import { z } from "zod";

const optionalText = z
  .union([z.string().trim(), z.literal(""), z.undefined()])
  .transform((value) => {
    const normalized = typeof value === "string" ? value.trim() : "";
    return normalized || undefined;
  });

export const grievanceSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(15).max(2000),
  category: optionalText,
  name: optionalText,
  department: optionalText,
  rollNumber: optionalText,
  isAnonymous: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === "true")
    .optional(),
  attachment: z
    .union([z.string().trim(), z.literal(""), z.undefined()])
    .transform((value) => (typeof value === "string" && value.trim() ? value.trim() : undefined)),
});

export const aiSettingsSchema = z.object({
  provider: z.enum(["groq"]),
  model: z.string().min(2),
  apiKey: z.string().min(10)
});

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(6).max(100),
  department: optionalText,
  rollNumber: optionalText,
});

export const adminCreateUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  role: z.enum(["student", "department", "admin"]),
  department: optionalText,
  rollNumber: optionalText,
});

export const adminUpdateUserSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(2).max(100).optional(),
  role: z.enum(["student", "department", "admin"]).optional(),
  department: optionalText,
  rollNumber: optionalText,
});

