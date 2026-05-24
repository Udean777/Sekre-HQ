import { z } from 'zod';
import { CURRENCY_CODES } from '@shared/constants/currencies';

export const createTransactionSchema = z.object({
  divisionId: z.string().min(1, 'Divisi wajib dipilih.'),
  eventId: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE'], {
    error: 'Tipe transaksi wajib dipilih.',
  }),
  /**
   * amountRupiah — nilai yang diinput user dalam unit mata uang (bukan sen).
   * Konversi ke sen (× 100) dilakukan saat submit ke backend.
   */
  amountRupiah: z
    .number({ error: 'Nominal wajib diisi.' })
    .int('Nominal harus bilangan bulat.')
    .positive('Nominal harus lebih dari 0.'),
  currency: z
    .string()
    .refine(val => CURRENCY_CODES.includes(val), { message: 'Mata uang tidak valid.' })
    .default('IDR'),
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
