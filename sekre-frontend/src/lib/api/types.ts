// API Types - Based on Backend OpenAPI Spec

// ==================== Base Types ====================

export interface ApiResponse<T = unknown> {
	success: boolean;
	message?: string;
	data?: T;
	error?: string;
}

export interface ApiError {
	error: string;
	message?: string;
	code?: string;
}

// ==================== Auth Types ====================

export interface User {
	id: string;
	email: string;
	full_name: string;
	created_at: string;
}

export interface Organization {
	id: string;
	name: string;
	subdomain: string;
	subscription_plan: 'FREE' | 'LITE' | 'PRO';
	created_at: string;
}

export interface UserWithOrganization {
	user: User;
	organization: Organization;
}

export interface RegisterRequest {
	organization_name: string;
	subdomain: string;
	email: string;
	password: string;
	full_name: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface AuthResponse {
	user: User;
	organization: Organization;
	role: string;
	tokens: {
		access_token: string;
		refresh_token: string;
	};
}

// ==================== Division Types ====================

export interface Division {
	id: string;
	organization_id: string;
	name: string;
	created_at: string;
}

export interface DivisionMember {
	division_id: string;
	user_id: string;
	division_role: 'HEAD' | 'STAFF';
	user?: User;
}

export interface CreateDivisionRequest {
	name: string;
}

export interface UpdateDivisionRequest {
	name: string;
}

export interface AddDivisionMemberRequest {
	user_id: string;
	division_role: 'HEAD' | 'STAFF';
}

export interface UpdateDivisionMemberRoleRequest {
	division_role: 'HEAD' | 'STAFF';
}

// ==================== Task Types ====================

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
	id: string;
	division_id: string;
	assignee_id: string;
	title: string;
	description?: string;
	status: TaskStatus;
	due_date?: string;
	created_at: string;
	updated_at: string;
	// Populated fields (if backend returns them)
	assignee?: User;
	division?: Division;
}

export interface CreateTaskRequest {
	division_id: string;
	assignee_id: string;
	title: string;
	description?: string;
	due_date?: string;
}

export interface UpdateTaskRequest {
	title?: string;
	description?: string;
	assignee_id?: string;
	due_date?: string;
	status?: TaskStatus;
}

export interface UpdateTaskStatusRequest {
	status: TaskStatus;
}

// ==================== Event Types ====================

export interface Event {
	id: string;
	division_id: string;
	title: string;
	description?: string;
	start_time: string;
	end_time: string;
	location?: string;
	created_at: string;
	// Populated fields
	division?: Division;
}

export interface CreateEventRequest {
	division_id: string;
	title: string;
	description?: string;
	start_time: string;
	end_time: string;
	location?: string;
}

export interface UpdateEventRequest {
	title?: string;
	description?: string;
	start_time?: string;
	end_time?: string;
	location?: string;
}

// ==================== Finance Types ====================

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Transaction {
	id: string;
	division_id: string;
	event_id?: string;
	type: TransactionType;
	amount: number;
	description: string;
	status: TransactionStatus;
	requested_by: string;
	approved_by?: string;
	receipt_url?: string;
	created_at: string;
	updated_at?: string;
	// Populated fields
	division?: Division;
	event?: Event;
	requester?: User;
	approver?: User;
}

export interface CreateTransactionRequest {
	division_id: string;
	event_id?: string;
	type: TransactionType;
	amount: number;
	description: string;
	receipt_url?: string;
}

export interface UpdateTransactionRequest {
	type?: TransactionType;
	amount?: number;
	description?: string;
	receipt_url?: string;
}

export interface FinanceSummary {
	total_income: number;
	total_expense: number;
	balance: number;
	transaction_count: number;
}

// ==================== Filter Types ====================

export interface TaskFilters {
	division_id?: string;
	assignee_id?: string;
	status?: TaskStatus;
}

export interface EventFilters {
	division_id?: string;
	start_date?: string;
	end_date?: string;
}

export interface TransactionFilters {
	division_id?: string;
	type?: TransactionType;
	status?: TransactionStatus;
	start_date?: string;
	end_date?: string;
}
