import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["STUDENT"]).default("STUDENT"),
});

export const issuerApplicationSchema = z.object({
  fullName: z.string().min(2, "Applicant name required"),
  email: z.string().email("Invalid applicant email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  institutionName: z.string().min(3, "Institution name required"),
  institutionCode: z
    .string()
    .min(2, "Institution code required (e.g. MIT, HARVARD)")
    .toUpperCase(),
  officialEmail: z.string().email("Invalid official contact email"),
  websiteUrl: z.string().url("Valid institution website URL required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
