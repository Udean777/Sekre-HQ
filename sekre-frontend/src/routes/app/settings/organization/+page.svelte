<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isSubmitting = $state(false);
	let showDeleteModal = $state(false);
	let deleteConfirmation = $state('');
	let isDeleting = $state(false);

	let canEdit = $derived(data.role && ['OWNER', 'ADMIN'].includes(data.role));
	let canDelete = $derived(data.role === 'OWNER');

	async function handleDelete() {
		if (deleteConfirmation !== data.organization.name) {
			return;
		}

		isDeleting = true;

		try {
			const response = await fetch('/api/v1/organizations/me', {
				method: 'DELETE',
				credentials: 'include'
			});

			if (response.ok) {
				// Redirect to logout after successful deletion
				await goto('/logout');
			} else {
				const data = await response.json();
				alert(data.message || 'Failed to delete organization');
			}
		} catch (error) {
			alert('Failed to delete organization');
		} finally {
			isDeleting = false;
			showDeleteModal = false;
		}
	}
</script>

<div class="organization-settings">
	<h2>Organization Settings</h2>
	<p class="description">Manage your organization information</p>

	{#if !canEdit}
		<div class="alert alert-warning">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
				<line x1="12" y1="9" x2="12" y2="13"></line>
				<line x1="12" y1="17" x2="12.01" y2="17"></line>
			</svg>
			<span>Only organization owners and admins can modify these settings.</span>
		</div>
	{/if}

	<form method="POST" action="?/update" use:enhance={() => {
		isSubmitting = true;
		return async ({ update }) => {
			await update();
			isSubmitting = false;
		};
	}}>
		<div class="form-group">
			<label for="name">Organization Name</label>
			<input
				type="text"
				id="name"
				name="name"
				value={data.organization.name}
				required
				maxlength="100"
				disabled={!canEdit || isSubmitting}
			/>
			<small>The name of your organization as it appears throughout the application</small>
		</div>

		<div class="form-group">
			<label>Subscription Plan</label>
			<input
				type="text"
				value={data.organization.subscription_plan}
				disabled
				readonly
			/>
			<small>Contact support to change your subscription plan</small>
		</div>

		{#if form?.success}
			<div class="alert alert-success">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
					<polyline points="22 4 12 14.01 9 11.01"></polyline>
				</svg>
				<span>{form.message}</span>
			</div>
		{/if}

		{#if form?.error}
			<div class="alert alert-error">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="8" x2="12" y2="12"></line>
					<line x1="12" y1="16" x2="12.01" y2="16"></line>
				</svg>
				<span>{form.error}</span>
			</div>
		{/if}

		{#if canEdit}
			<div class="form-actions">
				<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
					{#if isSubmitting}
						Saving...
					{:else}
						Save Changes
					{/if}
				</button>
			</div>
		{/if}
	</form>

	{#if canDelete}
		<div class="danger-zone">
			<h3>Danger Zone</h3>
			<p>Once you delete your organization, there is no going back. Please be certain.</p>
			<button type="button" class="btn btn-danger" on:click={() => showDeleteModal = true}>
				Delete Organization
			</button>
		</div>
	{/if}
</div>

{#if showDeleteModal}
	<div class="modal-overlay" on:click={() => showDeleteModal = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h3>Delete Organization</h3>
				<button class="close-btn" on:click={() => showDeleteModal = false}>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>

			<div class="modal-body">
				<div class="warning-box">
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
						<line x1="12" y1="9" x2="12" y2="13"></line>
						<line x1="12" y1="17" x2="12.01" y2="17"></line>
					</svg>
					<h4>This action cannot be undone</h4>
				</div>

				<p>This will permanently delete the <strong>{data.organization.name}</strong> organization and all of its data, including:</p>
				<ul>
					<li>All divisions and members</li>
					<li>All tasks and events</li>
					<li>All finance records</li>
					<li>All audit logs</li>
				</ul>

				<div class="form-group">
					<label for="delete_confirmation">
						Type <strong>{data.organization.name}</strong> to confirm:
					</label>
					<input
						type="text"
						id="delete_confirmation"
						bind:value={deleteConfirmation}
						placeholder="Organization name"
						disabled={isDeleting}
					/>
				</div>
			</div>

			<div class="modal-footer">
				<button
					type="button"
					class="btn btn-secondary"
					on:click={() => showDeleteModal = false}
					disabled={isDeleting}
				>
					Cancel
				</button>
				<button
					type="button"
					class="btn btn-danger"
					on:click={handleDelete}
					disabled={deleteConfirmation !== data.organization.name || isDeleting}
				>
					{#if isDeleting}
						Deleting...
					{:else}
						Delete Organization
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.organization-settings h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	.description {
		color: var(--text-secondary);
		margin-bottom: 2rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	.form-group input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-group input:disabled {
		background-color: var(--disabled-bg);
		cursor: not-allowed;
	}

	.form-group input[readonly] {
		background-color: var(--disabled-bg);
	}

	.form-group small {
		display: block;
		margin-top: 0.25rem;
		color: var(--text-secondary);
		font-size: 0.875rem;
	}

	.alert {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
	}

	.alert-success {
		background-color: #d1fae5;
		color: #065f46;
		border: 1px solid #6ee7b7;
	}

	.alert-warning {
		background-color: #fef3c7;
		color: #92400e;
		border: 1px solid #fcd34d;
	}

	.alert-error {
		background-color: #fee2e2;
		color: #991b1b;
		border: 1px solid #fca5a5;
	}

	.alert svg {
		flex-shrink: 0;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		padding-top: 1rem;
		border-top: 1px solid var(--border-color);
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background-color: var(--primary-color);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: var(--primary-hover);
	}

	.btn-secondary {
		background-color: #e5e7eb;
		color: #374151;
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: #d1d5db;
	}

	.btn-danger {
		background-color: #dc2626;
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background-color: #b91c1c;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.danger-zone {
		margin-top: 3rem;
		padding: 1.5rem;
		border: 2px solid #fca5a5;
		border-radius: 8px;
		background-color: #fef2f2;
	}

	.danger-zone h3 {
		color: #991b1b;
		font-size: 1.25rem;
		margin-bottom: 0.5rem;
	}

	.danger-zone p {
		color: #7f1d1d;
		margin-bottom: 1rem;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		background: white;
		border-radius: 8px;
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid var(--border-color);
	}

	.modal-header h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-secondary);
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: var(--text-primary);
	}

	.modal-body {
		padding: 1.5rem;
	}

	.warning-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 1.5rem;
		background-color: #fef2f2;
		border-radius: 8px;
		margin-bottom: 1.5rem;
	}

	.warning-box svg {
		color: #dc2626;
		margin-bottom: 0.75rem;
	}

	.warning-box h4 {
		color: #991b1b;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.modal-body p {
		margin-bottom: 1rem;
		color: var(--text-primary);
	}

	.modal-body ul {
		margin-bottom: 1.5rem;
		padding-left: 1.5rem;
		color: var(--text-secondary);
	}

	.modal-body ul li {
		margin-bottom: 0.5rem;
	}

	.modal-footer {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		padding: 1.5rem;
		border-top: 1px solid var(--border-color);
	}
</style>
