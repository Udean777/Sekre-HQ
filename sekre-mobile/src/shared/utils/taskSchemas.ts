import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi.').max(200, 'Judul maksimal 200 karakter.'),
  description: z.string().max(2000, 'Deskripsi maksimal 2000 karakter.').optional(),
  divisionId: z.string().min(1, 'Divisi wajib dipilih.'),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.date().nullable().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
