import { z } from "zod";

export const transactionSchema = z.object({
  division_id: z.string().min(1, { message: "Divisi wajib dipilih" }),
  event_id: z.string().optional().nullable(),
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z
    .string()
    .min(1, { message: "Jumlah wajib diisi" })
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: "Jumlah tidak valid (hanya angka positif)",
    }),
  currency: z.string().optional(),
  description: z.string().min(3, { message: "Deskripsi terlalu singkat" }),
  receipt_url: z
    .string()
    .url({ message: "URL struk tidak valid" })
    .optional()
    .or(z.literal("")),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
