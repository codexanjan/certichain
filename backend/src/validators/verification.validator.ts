import { z } from "zod";

export const verifyCertificateIdSchema = z.object({
  certificateId: z.string().min(5, "Valid certificate identifier is required"),
});
