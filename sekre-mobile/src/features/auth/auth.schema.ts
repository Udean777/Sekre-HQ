import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  organization_name: z.string().min(2, "Minimal 2 karakter"),
  subdomain: z.string().min(2, "Minimal 2 karakter"),
  full_name: z.string().min(2, "Minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Minimal 8 karakter"),
});

export type RegisterForm = z.infer<typeof registerSchema>;
