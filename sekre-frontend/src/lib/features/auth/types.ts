export interface User {
	id: string;
	email: string;
	full_name: string;
	created_at: string;
	updated_at: string;
}

export interface Organization {
	id: string;
	name: string;
	subdomain: string;
	subscription_plan: string;
	created_at: string;
	updated_at: string;
}

export interface TokenPair {
	access_token: string;
	refresh_token: string;
}

export interface AuthResponse {
	user: User;
	organization: Organization;
	role: string;
	tokens: TokenPair;
}

export interface RegisterRequest {
	organization_name: string;
	subdomain: string;
	full_name: string;
	email: string;
	password: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface UserWithOrganization {
	user: User;
	organization: Organization;
	role: string;
}
