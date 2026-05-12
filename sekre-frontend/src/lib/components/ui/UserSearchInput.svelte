<script lang="ts">
	/**
	 * UserSearchInput Component
	 * Autocomplete input for searching and selecting users
	 */
	import { onMount } from 'svelte';
	import { fetchApi } from '$lib/api/client';

	interface User {
		id: string;
		email: string;
		full_name: string;
	}

	interface Props {
		value?: string;
		onSelect: (user: User) => void;
		placeholder?: string;
		disabled?: boolean;
		excludeUserIds?: string[];
	}

	let {
		value = $bindable(''),
		onSelect,
		placeholder = 'Search users by name or email...',
		disabled = false,
		excludeUserIds = []
	}: Props = $props();

	let searchQuery = $state('');
	let users = $state<User[]>([]);
	let isLoading = $state(false);
	let isOpen = $state(false);
	let selectedIndex = $state(-1);
	let inputElement: HTMLInputElement;
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Search users with debounce
	async function searchUsers(query: string) {
		if (!query || query.length < 2) {
			users = [];
			isOpen = false;
			return;
		}

		isLoading = true;
		try {
			const response = await fetchApi<User[]>(`users/search?q=${encodeURIComponent(query)}`);
			// Filter out excluded users
			users = (response.data || []).filter(
				(user: User) => !excludeUserIds.includes(user.id)
			);
			isOpen = users.length > 0;
		} catch (error) {
			console.error('Failed to search users:', error);
			users = [];
		} finally {
			isLoading = false;
		}
	}

	// Handle input change with debounce
	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			searchUsers(searchQuery);
		}, 300);
	}

	// Handle user selection
	function selectUser(user: User) {
		value = user.id;
		searchQuery = user.full_name;
		isOpen = false;
		users = [];
		onSelect(user);
	}

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (!isOpen) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, users.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				break;
			case 'Enter':
				event.preventDefault();
				if (selectedIndex >= 0 && selectedIndex < users.length) {
					selectUser(users[selectedIndex]);
				}
				break;
			case 'Escape':
				isOpen = false;
				selectedIndex = -1;
				break;
		}
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.user-search-container')) {
			isOpen = false;
			selectedIndex = -1;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
			clearTimeout(debounceTimer);
		};
	});
</script>

<div class="user-search-container relative">
	<div class="relative">
		<input
			bind:this={inputElement}
			type="text"
			value={searchQuery}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onfocus={() => {
				if (users.length > 0) isOpen = true;
			}}
			{placeholder}
			{disabled}
			class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
			autocomplete="off"
		/>

		<!-- Loading spinner -->
		{#if isLoading}
			<div class="absolute right-3 top-1/2 -translate-y-1/2">
				<svg
					class="animate-spin h-5 w-5 text-gray-400"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
			</div>
		{:else if searchQuery}
			<!-- Clear button -->
			<button
				type="button"
				onclick={() => {
					searchQuery = '';
					value = '';
					users = [];
					isOpen = false;
					inputElement?.focus();
				}}
				class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
				aria-label="Clear search"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		{/if}
	</div>

	<!-- Dropdown -->
	{#if isOpen && users.length > 0}
		<div
			class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
		>
			<ul class="py-1">
				{#each users as user, index}
					<li>
						<button
							type="button"
							onclick={() => selectUser(user)}
							class="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none {selectedIndex ===
							index
								? 'bg-gray-100'
								: ''}"
						>
							<div class="flex items-center gap-3">
								<!-- Avatar -->
								<div
									class="shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm"
								>
									{user.full_name.charAt(0).toUpperCase()}
								</div>

								<!-- User info -->
								<div class="min-w-0 flex-1">
									<p class="text-sm font-medium text-gray-900 truncate">
										{user.full_name}
									</p>
									<p class="text-xs text-gray-500 truncate">{user.email}</p>
								</div>
							</div>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- No results message -->
	{#if !isLoading && searchQuery.length >= 2 && users.length === 0 && isOpen}
		<div
			class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4"
		>
			<p class="text-sm text-gray-500 text-center">No users found</p>
		</div>
	{/if}
</div>
