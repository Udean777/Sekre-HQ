import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Judul tugas harus diisi"),
  description: z.string().optional(),
  division_id: z.string().min(1, "Divisi harus dipilih"),
  assignee_id: z.string().optional(),
  due_date: z.string().optional(),
  status: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
