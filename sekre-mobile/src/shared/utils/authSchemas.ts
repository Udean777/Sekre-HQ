import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email wajib diisi.' })
    .min(1, 'Email wajib diisi.')
    .email('Format email tidak valid.'),
  password: z
    .string({ required_error: 'Kata sandi wajib diisi.' })
    .min(8, 'Kata sandi minimal 8 karakter.'),
});

export const registerSchema = z.object({
  orgName: z
    .string({ required_error: 'Nama organisasi wajib diisi.' })
    .min(2, 'Nama organisasi minimal 2 karakter.')
    .max(100, 'Nama organisasi maksimal 100 karakter.'),
  subdomain: z
    .string({ required_error: 'Subdomain wajib diisi.' })
    .min(3, 'Subdomain minimal 3 karakter.')
    .max(50, 'Subdomain maksimal 50 karakter.')
    .regex(/^[a-z0-9-]+$/, 'Subdomain hanya boleh huruf kecil, angka, dan tanda hubung.'),
  fullName: z
    .string({ required_error: 'Nama lengkap wajib diisi.' })
    .min(2, 'Nama lengkap minimal 2 karakter.')
    .max(100, 'Nama lengkap maksimal 100 karakter.'),
  email: z
    .string({ required_error: 'Email wajib diisi.' })
    .min(1, 'Email wajib diisi.')
    .email('Format email tidak valid.'),
  password: z
    .string({ required_error: 'Kata sandi wajib diisi.' })
    .min(8, 'Kata sandi minimal 8 karakter.')
    .max(100, 'Kata sandi maksimal 100 karakter.'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: 'Kata sandi saat ini wajib diisi.' })
      .min(1, 'Kata sandi saat ini wajib diisi.'),
    newPassword: z
      .string({ required_error: 'Kata sandi baru wajib diisi.' })
      .min(8, 'Kata sandi baru minimal 8 karakter.')
      .max(100, 'Kata sandi baru maksimal 100 karakter.'),
    confirmPassword: z
      .string({ required_error: 'Konfirmasi kata sandi wajib diisi.' })
      .min(1, 'Konfirmasi kata sandi wajib diisi.'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
