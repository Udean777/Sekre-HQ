<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);
	let isSubmitting = $state(false);
</script>

<div class="security-settings">
	<h2>Security Settings</h2>
	<p class="description">Manage your password and security preferences</p>

	<form method="POST" use:enhance={() => {
		isSubmitting = true;
		return async ({ update }) => {
			await update();
			isSubmitting = false;
			// Clear form on success
			if (form?.success) {
				const formElement = document.querySelector('form');
				formElement?.reset();
			}
		};
	}}>
		<div class="form-group">
			<label for="current_password">Current Password</label>
			<div class="password-input">
				<input
					type={showCurrentPassword ? 'text' : 'password'}
					id="current_password"
					name="current_password"
					required
					disabled={isSubmitting}
				/>
				<button
					type="button"
					class="toggle-password"
					on:click={() => showCurrentPassword = !showCurrentPassword}
					disabled={isSubmitting}
				>
					{#if showCurrentPassword}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
							<line x1="1" y1="1" x2="23" y2="23"></line>
						</svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
							<circle cx="12" cy="12" r="3"></circle>
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<div class="form-group">
			<label for="new_password">New Password</label>
			<div class="password-input">
				<input
					type={showNewPassword ? 'text' : 'password'}
					id="new_password"
					name="new_password"
					minlength="8"
					required
					disabled={isSubmitting}
				/>
				<button
					type="button"
					class="toggle-password"
					on:click={() => showNewPassword = !showNewPassword}
					disabled={isSubmitting}
				>
					{#if showNewPassword}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
							<line x1="1" y1="1" x2="23" y2="23"></line>
						</svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
							<circle cx="12" cy="12" r="3"></circle>
						</svg>
					{/if}
				</button>
			</div>
			<small>Minimum 8 characters</small>
		</div>

		<div class="form-group">
			<label for="confirm_password">Confirm New Password</label>
			<div class="password-input">
				<input
					type={showConfirmPassword ? 'text' : 'password'}
					id="confirm_password"
					name="confirm_password"
					minlength="8"
					required
					disabled={isSubmitting}
				/>
				<button
					type="button"
					class="toggle-password"
					on:click={() => showConfirmPassword = !showConfirmPassword}
					disabled={isSubmitting}
				>
					{#if showConfirmPassword}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
							<line x1="1" y1="1" x2="23" y2="23"></line>
						</svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
							<circle cx="12" cy="12" r="3"></circle>
						</svg>
					{/if}
				</button>
			</div>
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

		<div class="form-actions">
			<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
				{#if isSubmitting}
					Changing Password...
				{:else}
					Change Password
				{/if}
			</button>
		</div>
	</form>
</div>

<style>
	.security-settings h2 {
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

	.password-input {
		position: relative;
		display: flex;
		align-items: center;
	}

	.password-input input {
		width: 100%;
		padding: 0.75rem;
		padding-right: 3rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.password-input input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.password-input input:disabled {
		background-color: var(--disabled-bg);
		cursor: not-allowed;
	}

	.toggle-password {
		position: absolute;
		right: 0.75rem;
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

	.toggle-password:hover:not(:disabled) {
		color: var(--text-primary);
	}

	.toggle-password:disabled {
		cursor: not-allowed;
		opacity: 0.5;
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

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
