import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  organization_name: z.string().min(3, 'Nama organisasi minimal 3 karakter'),
  subdomain: z.string().min(3, 'Subdomain minimal 3 karakter').regex(/^[a-z0-9-]+$/, 'Subdomain hanya boleh berisi huruf kecil, angka, dan strip'),
  full_name: z.string().min(3, 'Nama pemilik minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
