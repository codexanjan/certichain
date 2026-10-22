import { z } from "zod";

export const issueCertificateSchema = z.object({
  studentName: z.string().min(2, "Student full name is required"),
  studentIdentifier: z.string().min(2, "Student identifier / roll number is required"),
  studentEmail: z.string().email("Valid student email is required"),
  title: z.string().min(3, "Certificate or Award title is required"),
  degree: z.string().min(2, "Degree or Program name is required"),
  department: z.string().optional(),
  cgpaOrGrade: z.string().optional(),
  issueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid issue date is required",
  }),
  expiryDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Valid expiry date required",
    }),
});

export const revokeCertificateSchema = z.object({
  reason: z.string().min(5, "Revocation reason must be at least 5 characters"),
});
