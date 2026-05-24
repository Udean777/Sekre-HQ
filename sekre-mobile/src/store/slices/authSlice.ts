import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@store/index';

// ─── Types ────────────────────────────────────────────────────────────────────

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

/**
 * Discriminated union — eliminasi null checks di seluruh codebase.
 *
 * Sebelum: `state.auth.isAuthenticated && state.auth.user?.email`
 * Sesudah: `state.auth.status === 'authenticated' && state.auth.user.email`
 *
 * Keuntungan:
 * - TypeScript narrow otomatis setelah check `status`
 * - Tidak ada `user: null` saat authenticated atau sebaliknya
 * - Lebih mudah di-test (setiap state adalah object yang valid)
 */
export type AuthState =
  | { status: 'unauthenticated' }
  | {
      status: 'authenticated';
      user: AuthUser;
      organization: AuthOrganization;
      role: OrgRole;
    };

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  initialState: { status: 'unauthenticated' } as AuthState,
  reducers: {
    setSession: (
      _state,
      action: PayloadAction<{
        user: AuthUser;
        organization: AuthOrganization;
        role: OrgRole;
      }>,
    ): AuthState => ({
      status: 'authenticated',
      user: action.payload.user,
      organization: action.payload.organization,
      role: action.payload.role,
    }),

    updateUser: (state, action: PayloadAction<Partial<AuthUser>>): AuthState => {
      if (state.status !== 'authenticated') return state;
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    },

    updateOrganization: (state, action: PayloadAction<Partial<AuthOrganization>>): AuthState => {
      if (state.status !== 'authenticated') return state;
      return {
        ...state,
        organization: { ...state.organization, ...action.payload },
      };
    },

    clearSession: (): AuthState => ({ status: 'unauthenticated' }),
  },
});

export const { setSession, updateUser, updateOrganization, clearSession } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

const selectAuth = (state: RootState): AuthState => state.auth;

export const selectIsAuthenticated = createSelector(
  selectAuth,
  auth => auth.status === 'authenticated',
);

export const selectAuthUser = createSelector(selectAuth, auth =>
  auth.status === 'authenticated' ? auth.user : null,
);

export const selectAuthOrganization = createSelector(selectAuth, auth =>
  auth.status === 'authenticated' ? auth.organization : null,
);

export const selectAuthRole = createSelector(selectAuth, auth =>
  auth.status === 'authenticated' ? auth.role : null,
);

export const selectMustResetPassword = createSelector(selectAuth, auth =>
  auth.status === 'authenticated' ? auth.user.mustResetPassword : false,
);

/**
 * selectCanManage — true jika role OWNER atau ADMIN.
 * Dipakai di semua screens untuk guard create/edit/delete actions.
 * Memoized supaya tidak re-render saat state lain berubah.
 */
export const selectCanManage = createSelector(
  selectAuthRole,
  role => role === 'OWNER' || role === 'ADMIN',
);
