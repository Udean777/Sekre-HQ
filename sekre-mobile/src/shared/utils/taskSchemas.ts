import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string({ required_error: 'Judul wajib diisi.' })
    .min(1, 'Judul wajib diisi.')
    .max(200, 'Judul maksimal 200 karakter.'),
  description: z.string().max(2000, 'Deskripsi maksimal 2000 karakter.').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
    required_error: 'Prioritas wajib dipilih.',
  }),
  dueDate: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
