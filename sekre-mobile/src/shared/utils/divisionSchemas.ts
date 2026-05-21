import { z } from 'zod';

export const divisionSchema = z.object({
  name: z
    .string()
    .min(2, 'Nama divisi minimal 2 karakter.')
    .max(100, 'Nama divisi maksimal 100 karakter.'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter.').optional(),
});

export type DivisionFormValues = z.infer<typeof divisionSchema>;
