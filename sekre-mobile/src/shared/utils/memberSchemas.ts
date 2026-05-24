import { z } from 'zod';

export const inviteMemberSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi.').email('Format email tidak valid.'),
  fullName: z
    .string()
    .min(2, 'Nama lengkap minimal 2 karakter.')
    .max(100, 'Nama lengkap maksimal 100 karakter.'),
  role: z.enum(['ADMIN', 'MEMBER'], {
    error: 'Peran wajib dipilih.',
  }),
  divisionId: z.string().optional(),
  divisionRole: z.enum(['HEAD', 'STAFF']).optional(),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

export const editMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER'], {
    error: 'Peran wajib dipilih.',
  }),
});

export type EditMemberFormValues = z.infer<typeof editMemberSchema>;
