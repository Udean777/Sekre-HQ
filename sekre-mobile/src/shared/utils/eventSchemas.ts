import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(2, 'Judul minimal 2 karakter.').max(200, 'Judul maksimal 200 karakter.'),
  description: z.string().max(2000, 'Deskripsi maksimal 2000 karakter.').optional(),
  location: z.string().max(200, 'Lokasi maksimal 200 karakter.').optional(),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi.'),
  endDate: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
