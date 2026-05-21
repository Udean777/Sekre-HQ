import { z } from 'zod';

export const createTransactionSchema = z.object({
  divisionId: z.string().min(1, 'Divisi wajib dipilih.'),
  eventId: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE'], {
    error: 'Tipe transaksi wajib dipilih.',
  }),
  amountCents: z
    .number({ error: 'Nominal wajib diisi.' })
    .int('Nominal harus bilangan bulat.')
    .positive('Nominal harus lebih dari 0.'),
  currency: z.string().length(3, 'Kode mata uang harus 3 karakter.').optional(),
  description: z
    .string()
    .min(1, 'Deskripsi wajib diisi.')
    .max(500, 'Deskripsi maksimal 500 karakter.'),
  receiptUrl: z.string().url('URL bukti tidak valid.').optional().or(z.literal('')),
});

export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = createTransactionSchema.partial().extend({
  description: z
    .string()
    .min(1, 'Deskripsi wajib diisi.')
    .max(500, 'Deskripsi maksimal 500 karakter.')
    .optional(),
});

export type UpdateTransactionFormValues = z.infer<typeof updateTransactionSchema>;
