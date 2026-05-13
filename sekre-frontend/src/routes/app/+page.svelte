<script lang="ts">
	/**
	 * Dashboard Page
	 * Main dashboard with real data
	 * Following SvelteKit 5 best practices with runes
	 */
	import type { PageData } from './$types';
	import StatCard from '$lib/components/dashboard/StatCard.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { getGreeting } from '$lib/services/dashboard.service';
	import { formatCurrency } from '$lib/services/finance.service';
	import { formatEventDate } from '$lib/services/event.service';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const greeting = $derived(getGreeting());
</script>

<svelte:head>
	<title>Dashboard - Sekre</title>
</svelte:head>

<div class="space-y-6">
	<!-- Welcome section -->
	<div>
		<h1 class="text-2xl font-bold text-gray-900">
			{greeting}, {data.user.full_name}!
		</h1>
		<p class="mt-1 text-sm text-gray-500">
			Here's what's happening with your organization today.
		</p>
	</div>

	<!-- Error message -->
	{#if data.error}
		<Alert variant="error" message={data.error} dismissible />
	{/if}

	<!-- Summary cards -->
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
		<StatCard
			title="Total Divisions"
			value={data.stats.divisions_count}
			type="divisions"
			href="/app/divisions"
		/>

		<StatCard
			title="Active Tasks"
			value={data.stats.active_tasks_count}
			type="tasks"
			href="/app/tasks"
		/>

		<StatCard
			title="Upcoming Events"
			value={data.stats.upcoming_events_count}
			type="events"
			href="/app/events"
		/>

		<StatCard
			title="Balance"
			value={formatCurrency(data.stats.balance)}
			type="finance"
			href="/app/finance"
		/>
	</div>

	<!-- Financial Overview -->
	<Card title="Financial Overview">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div>
				<p class="text-sm text-gray-600">Total Income</p>
				<p class="text-xl font-semibold text-green-600 mt-1">
					{formatCurrency(data.stats.total_income)}
				</p>
			</div>
			<div>
				<p class="text-sm text-gray-600">Total Expense</p>
				<p class="text-xl font-semibold text-red-600 mt-1">
					{formatCurrency(data.stats.total_expense)}
				</p>
			</div>
			<div>
				<p class="text-sm text-gray-600">Net Balance</p>
				<p
					class="text-xl font-semibold mt-1"
					class:text-green-600={data.stats.balance >= 0}
					class:text-red-600={data.stats.balance < 0}
				>
					{formatCurrency(data.stats.balance)}
				</p>
			</div>
		</div>
	</Card>

	<!-- Recent Activity -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Recent Tasks -->
		<Card title="Recent Tasks">
			{#if data.recentTasks.length > 0}
				<div class="space-y-3">
					{#each data.recentTasks as taskWithAssignee}
						<a
							href="/app/tasks"
							class="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
						>
							<div class="flex items-start justify-between">
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-gray-900 truncate">
										{taskWithAssignee.task.title}
									</p>
									<p class="text-xs text-gray-500 mt-1">
										Status: {taskWithAssignee.task.status}
									</p>
								</div>
								<span
									class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ml-2"
									class:bg-gray-100={taskWithAssignee.task.status === 'TODO'}
									class:text-gray-800={taskWithAssignee.task.status === 'TODO'}
									class:bg-blue-100={taskWithAssignee.task.status === 'IN_PROGRESS'}
									class:text-blue-800={taskWithAssignee.task.status === 'IN_PROGRESS'}
									class:bg-green-100={taskWithAssignee.task.status === 'DONE'}
									class:text-green-800={taskWithAssignee.task.status === 'DONE'}
								>
									{taskWithAssignee.task.status}
								</span>
							</div>
						</a>
					{/each}
				</div>
				<div class="mt-4 pt-4 border-t border-gray-200">
					<a href="/app/tasks" class="text-sm font-medium text-blue-600 hover:text-blue-500">
						View all tasks →
					</a>
				</div>
			{:else}
				<p class="text-sm text-gray-500">No tasks yet</p>
			{/if}
		</Card>

		<!-- Recent Events -->
		<Card title="Recent Events">
			{#if data.recentEvents.length > 0}
				<div class="space-y-3">
					{#each data.recentEvents as event}
						<a href="/app/events" class="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
							<div class="flex items-start justify-between">
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-gray-900 truncate">
										{event.title}
									</p>
									<p class="text-xs text-gray-500 mt-1">
										{formatEventDate(new Date(event.start_time), new Date(event.end_time))}
									</p>
								</div>
								<svg
									class="h-5 w-5 text-gray-400 ml-2"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
							</div>
						</a>
					{/each}
				</div>
				<div class="mt-4 pt-4 border-t border-gray-200">
					<a href="/app/events" class="text-sm font-medium text-blue-600 hover:text-blue-500">
						View all events →
					</a>
				</div>
			{:else}
				<p class="text-sm text-gray-500">No events yet</p>
			{/if}
		</Card>
	</div>

	<!-- Quick Actions -->
	<Card title="Quick Actions">
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<a
				href="/app/divisions"
				class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
			>
				<div class="shrink-0">
					<svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</div>
				<div class="flex-1 min-w-0">
					<span class="absolute inset-0" aria-hidden="true"></span>
					<p class="text-sm font-medium text-gray-900">New Division</p>
					<p class="text-sm text-gray-500 truncate">Create a new division</p>
				</div>
			</a>

			<a
				href="/app/tasks"
				class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
			>
				<div class="shrink-0">
					<svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</div>
				<div class="flex-1 min-w-0">
					<span class="absolute inset-0" aria-hidden="true"></span>
					<p class="text-sm font-medium text-gray-900">New Task</p>
					<p class="text-sm text-gray-500 truncate">Create a new task</p>
				</div>
			</a>

			<a
				href="/app/events"
				class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
			>
				<div class="shrink-0">
					<svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</div>
				<div class="flex-1 min-w-0">
					<span class="absolute inset-0" aria-hidden="true"></span>
					<p class="text-sm font-medium text-gray-900">New Event</p>
					<p class="text-sm text-gray-500 truncate">Schedule a new event</p>
				</div>
			</a>

			<a
				href="/app/finance"
				class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
			>
				<div class="shrink-0">
					<svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</div>
				<div class="flex-1 min-w-0">
					<span class="absolute inset-0" aria-hidden="true"></span>
					<p class="text-sm font-medium text-gray-900">New Transaction</p>
					<p class="text-sm text-gray-500 truncate">Record a transaction</p>
				</div>
			</a>
		</div>
	</Card>
</div>
