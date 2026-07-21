import * as z from "zod";

export const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    new_password: z.string().min(8, "Kata sandi baru minimal 8 karakter"),
    confirm_password: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirm_password"],
  });

export type PasswordFormData = z.infer<typeof passwordSchema>;

export const profileSchema = z.object({
  full_name: z.string().min(3, "Nama harus minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
