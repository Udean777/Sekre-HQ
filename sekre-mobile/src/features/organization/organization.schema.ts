import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(3, "Nama organisasi minimal 3 karakter"),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;
