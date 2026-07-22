import { create } from "zustand";
import { User, Organization } from "@/shared/types";
import { storage } from "@/shared/lib/storage";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  organization: Organization | null;
  role: string | null;

  // Actions
  login: (
    authData: { user: User; organization: Organization; role: string },
    access: string,
    refresh: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  setAuthRestored: (authData: {
    user: User;
    organization: Organization;
    role: string;
  }) => void;
  updateUser: (data: Partial<User>) => void;
  updateOrganization: (data: Partial<Organization>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  organization: null,
  role: null,

  login: async (authData, access, refresh) => {
    await storage.setToken("access_token", access);
    await storage.setToken("refresh_token", refresh);

    set({
      isAuthenticated: true,
      user: authData.user,
      organization: authData.organization,
      role: authData.role,
    });
  },

  logout: async () => {
    await storage.deleteToken("access_token");
    await storage.deleteToken("refresh_token");

    set({
      isAuthenticated: false,
      user: null,
      organization: null,
      role: null,
    });
  },

  setAuthRestored: (authData) => {
    set({
      isAuthenticated: true,
      user: authData.user,
      organization: authData.organization,
      role: authData.role,
    });
  },

  updateUser: (data) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },

  updateOrganization: (data) => {
    set((state) => ({
      organization: state.organization
        ? { ...state.organization, ...data }
        : null,
    }));
  },
}));
