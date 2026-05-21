import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().min(1, 'Nama wajib diisi.').max(100, 'Nama maksimal 100 karakter.'),
  email: z.string().min(1, 'Email wajib diisi.').email('Format email tidak valid.'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi.'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter.'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi.'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok.',
    path: ['confirmPassword'],
  })
  .refine(data => data.newPassword !== data.currentPassword, {
    message: 'Password baru harus berbeda dari password saat ini.',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const organizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama organisasi wajib diisi.')
    .max(100, 'Nama organisasi maksimal 100 karakter.'),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;
