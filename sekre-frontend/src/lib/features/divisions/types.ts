import type { User } from '$lib/features/auth/types';

export interface Division {
	id: string;
	organization_id: string;
	name: string;
	description: string;
	created_at: string;
	updated_at: string;
}

export interface DivisionMember {
	user: User;
	division_role: 'HEAD' | 'STAFF';
	joined_at: string;
}

export interface DivisionWithMembers {
	division: Division;
	members: DivisionMember[];
}

export interface CreateDivisionRequest {
	name: string;
	description?: string;
}

export interface UpdateDivisionRequest {
	name: string;
	description?: string;
}

export interface AddMemberRequest {
	user_id: string;
	role: 'HEAD' | 'STAFF';
}
