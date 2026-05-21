import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type SubscriptionPlan = 'FREE' | 'LITE' | 'PRO';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  mustResetPassword: boolean;
}

export interface AuthOrganization {
  id: string;
  name: string;
  subdomain: string;
  subscriptionPlan: SubscriptionPlan;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  organization: AuthOrganization | null;
  role: OrgRole | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  organization: null,
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        organization: AuthOrganization;
        role: OrgRole;
      }>,
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.organization = action.payload.organization;
      state.role = action.payload.role;
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateOrganization: (
      state,
      action: PayloadAction<Partial<AuthOrganization>>,
    ) => {
      if (state.organization) {
        state.organization = { ...state.organization, ...action.payload };
      }
    },
    clearSession: state => {
      state.isAuthenticated = false;
      state.user = null;
      state.organization = null;
      state.role = null;
    },
  },
});

export const { setSession, updateUser, updateOrganization, clearSession } =
  authSlice.actions;
export default authSlice.reducer;
