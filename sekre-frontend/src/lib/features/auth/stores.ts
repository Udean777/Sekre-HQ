import { writable, derived } from 'svelte/store';
import type { User, Organization } from './types';
import { authService } from './services';

interface AuthState {
	user: User | null;
	organization: Organization | null;
	role: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

const initialState: AuthState = {
	user: null,
	organization: null,
	role: null,
	isAuthenticated: false,
	isLoading: true
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,
		
		async init() {
			const token = authService.getAccessToken();
			if (!token) {
				update(state => ({ ...state, isLoading: false }));
				return;
			}

			try {
				const data = await authService.getMe();
				update(state => ({
					...state,
					user: data.user,
					organization: data.organization,
					role: data.role,
					isAuthenticated: true,
					isLoading: false
				}));
			} catch (error) {
				authService.clearTokens();
				update(state => ({ ...state, isLoading: false }));
			}
		},

		setAuth(user: User, organization: Organization, role: string) {
			update(state => ({
				...state,
				user,
				organization,
				role,
				isAuthenticated: true,
				isLoading: false
			}));
		},

		logout() {
			authService.clearTokens();
			set(initialState);
		},

		reset() {
			set(initialState);
		}
	};
}

export const authStore = createAuthStore();

// Derived stores
export const isAuthenticated = derived(authStore, $auth => $auth.isAuthenticated);
export const currentUser = derived(authStore, $auth => $auth.user);
export const currentOrganization = derived(authStore, $auth => $auth.organization);
export const userRole = derived(authStore, $auth => $auth.role);
