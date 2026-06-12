import { create } from 'zustand';

import { UserEntity } from '@/domain/entities/user.entity';
import { OrganizationEntity } from '@/domain/entities/organization.entity';

interface AuthState {
  isAuthenticated: boolean;
  user: UserEntity | null;
  organization: OrganizationEntity | null;
  role: string | null;
  isLoading: boolean;
  login: (user: UserEntity, organization: OrganizationEntity, role: string) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  organization: null,
  role: null,
  isLoading: true, // secara default true sampai kita mengecek token di storage
  login: (user, organization, role) => set({ isAuthenticated: true, user, organization, role }),
  logout: () => set({ isAuthenticated: false, user: null, organization: null, role: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));
