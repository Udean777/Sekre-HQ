import { apiClient } from '$lib/core/api';
import type {
	Division,
	DivisionWithMembers,
	CreateDivisionRequest,
	UpdateDivisionRequest,
	AddMemberRequest,
	DivisionMember
} from './types';

export const divisionService = {
	async create(data: CreateDivisionRequest): Promise<Division> {
		const response = await apiClient('/divisions', {
			method: 'POST',
			body: JSON.stringify(data)
		});
		return response.data;
	},

	async list(): Promise<Division[]> {
		const response = await apiClient('/divisions', {
			method: 'GET'
		});
		return response.data;
	},

	async getById(id: string): Promise<DivisionWithMembers> {
		const response = await apiClient(`/divisions/${id}`, {
			method: 'GET'
		});
		return response.data;
	},

	async update(id: string, data: UpdateDivisionRequest): Promise<Division> {
		const response = await apiClient(`/divisions/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
		return response.data;
	},

	async delete(id: string): Promise<void> {
		await apiClient(`/divisions/${id}`, {
			method: 'DELETE'
		});
	},

	async addMember(divisionId: string, data: AddMemberRequest): Promise<void> {
		await apiClient(`/divisions/${divisionId}/members`, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	},

	async removeMember(divisionId: string, userId: string): Promise<void> {
		await apiClient(`/divisions/${divisionId}/members/${userId}`, {
			method: 'DELETE'
		});
	},

	async updateMemberRole(divisionId: string, userId: string, role: 'HEAD' | 'STAFF'): Promise<void> {
		await apiClient(`/divisions/${divisionId}/members/${userId}`, {
			method: 'PATCH',
			body: JSON.stringify({ role })
		});
	},

	async getMembers(divisionId: string): Promise<DivisionMember[]> {
		const response = await apiClient(`/divisions/${divisionId}/members`, {
			method: 'GET'
		});
		return response.data;
	}
};
