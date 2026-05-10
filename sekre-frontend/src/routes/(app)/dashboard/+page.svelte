<script lang="ts">
	import { currentUser, currentOrganization, userRole } from '$lib/features/auth/stores';
</script>

<svelte:head>
	<title>Dashboard - Sekre</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
		<p class="mt-2 text-gray-600">Welcome back, {$currentUser?.full_name}!</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Total Tasks</p>
					<p class="text-2xl font-bold text-gray-900">0</p>
				</div>
				<div class="p-3 bg-blue-100 rounded-full">
					<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Upcoming Events</p>
					<p class="text-2xl font-bold text-gray-900">0</p>
				</div>
				<div class="p-3 bg-green-100 rounded-full">
					<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Total Balance</p>
					<p class="text-2xl font-bold text-gray-900">Rp 0</p>
				</div>
				<div class="p-3 bg-yellow-100 rounded-full">
					<svg
						class="w-6 h-6 text-yellow-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Active Divisions</p>
					<p class="text-2xl font-bold text-gray-900">0</p>
				</div>
				<div class="p-3 bg-purple-100 rounded-full">
					<svg
						class="w-6 h-6 text-purple-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
				</div>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="bg-white rounded-lg shadow p-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<a
				href="/tasks"
				class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition"
			>
				<div class="p-2 bg-blue-100 rounded-lg mr-4">
					<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</div>
				<div>
					<p class="font-medium text-gray-900">Create Task</p>
					<p class="text-sm text-gray-500">Add a new task</p>
				</div>
			</a>

			<a
				href="/events"
				class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition"
			>
				<div class="p-2 bg-green-100 rounded-lg mr-4">
					<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</div>
				<div>
					<p class="font-medium text-gray-900">Schedule Event</p>
					<p class="text-sm text-gray-500">Add a new event</p>
				</div>
			</a>

			<a
				href="/finance"
				class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-500 hover:shadow-md transition"
			>
				<div class="p-2 bg-yellow-100 rounded-lg mr-4">
					<svg
						class="w-6 h-6 text-yellow-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</div>
				<div>
					<p class="font-medium text-gray-900">Record Transaction</p>
					<p class="text-sm text-gray-500">Add income/expense</p>
				</div>
			</a>
		</div>
	</div>

	<!-- Organization Info -->
	<div class="bg-white rounded-lg shadow p-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">Organization Info</h2>
		<div class="space-y-3">
			<div class="flex justify-between">
				<span class="text-gray-600">Organization:</span>
				<span class="font-medium text-gray-900">{$currentOrganization?.name}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-600">Subdomain:</span>
				<span class="font-medium text-gray-900">{$currentOrganization?.subdomain}.sekre.app</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-600">Plan:</span>
				<span
					class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
				>
					{$currentOrganization?.subscription_plan}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-600">Your Role:</span>
				<span class="font-medium text-gray-900">{$userRole}</span>
			</div>
		</div>
	</div>
</div>

<style>
	/* Add any custom styles here */
</style>
