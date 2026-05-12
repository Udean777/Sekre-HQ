<script lang="ts">
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	let { data }: { data: LayoutData } = $props();

	const tabs = [
		{ label: 'Profile', href: '/app/settings/profile', icon: 'user' },
		{ label: 'Security', href: '/app/settings/security', icon: 'lock' },
		{ label: 'Organization', href: '/app/settings/organization', icon: 'building' }
	];
</script>

<div class="settings-container">
	<div class="settings-header">
		<h1>Settings</h1>
		<p class="text-muted">Manage your account and organization settings</p>
	</div>

	<div class="settings-tabs">
		{#each tabs as tab}
			<a
				href={tab.href}
				class="tab"
				class:active={$page.url.pathname === tab.href}
			>
				{#if tab.icon === 'user'}
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
						<circle cx="12" cy="7" r="4"></circle>
					</svg>
				{:else if tab.icon === 'lock'}
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
						<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
					</svg>
				{:else if tab.icon === 'building'}
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
						<path d="M9 22v-4h6v4"></path>
						<path d="M8 6h.01"></path>
						<path d="M16 6h.01"></path>
						<path d="M12 6h.01"></path>
						<path d="M12 10h.01"></path>
						<path d="M12 14h.01"></path>
						<path d="M16 10h.01"></path>
						<path d="M16 14h.01"></path>
						<path d="M8 10h.01"></path>
						<path d="M8 14h.01"></path>
					</svg>
				{/if}
				<span>{tab.label}</span>
			</a>
		{/each}
	</div>

	<div class="settings-content">
		<slot />
	</div>
</div>

<style>
	.settings-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
	}

	.settings-header {
		margin-bottom: 2rem;
	}

	.settings-header h1 {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	.text-muted {
		color: var(--text-secondary);
		font-size: 0.95rem;
	}

	.settings-tabs {
		display: flex;
		gap: 0.5rem;
		border-bottom: 2px solid var(--border-color);
		margin-bottom: 2rem;
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		text-decoration: none;
		color: var(--text-secondary);
		font-weight: 500;
		border-bottom: 2px solid transparent;
		margin-bottom: -2px;
		transition: all 0.2s;
	}

	.tab:hover {
		color: var(--text-primary);
		background-color: var(--hover-bg);
	}

	.tab.active {
		color: var(--primary-color);
		border-bottom-color: var(--primary-color);
	}

	.tab svg {
		flex-shrink: 0;
	}

	.settings-content {
		background: white;
		border-radius: 8px;
		padding: 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 768px) {
		.settings-container {
			padding: 1rem;
		}

		.settings-tabs {
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}

		.tab span {
			display: none;
		}

		.tab {
			padding: 0.75rem;
		}

		.settings-content {
			padding: 1.5rem;
		}
	}
</style>
