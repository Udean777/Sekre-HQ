import { z } from "zod";

export const divisionSchema = z.object({
  name: z.string().min(3, "Nama divisi minimal 3 karakter"),
  description: z.string().optional(),
});

export type DivisionFormData = z.infer<typeof divisionSchema>;

export interface Division {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedDivisions {
  data: Division[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface UserWithRole {
  user: User;
  division_role: "HEAD" | "STAFF";
  joined_at: string;
}

export interface DivisionWithMembers {
  division: Division;
  members: UserWithRole[];
}
