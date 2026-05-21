import { z } from 'zod';

export const inviteMemberSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi.').email('Format email tidak valid.'),
  role: z.enum(['ADMIN', 'MEMBER'], {
    error: 'Peran wajib dipilih.',
  }),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
