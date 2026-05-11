<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/ui/Card.svelte";
  import Badge from "$lib/components/ui/Badge.svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Dashboard - Sekre</title>
</svelte:head>

<div class="space-y-6">
  <!-- Welcome section -->
  <div>
    <h1 class="text-2xl font-bold text-gray-900">
      Welcome back, {data.user.full_name}!
    </h1>
    <p class="mt-1 text-sm text-gray-500">
      Here's what's happening with your organization today.
    </p>
  </div>

  <!-- Summary cards -->
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Divisions card -->
    <Card>
      <div class="flex items-center">
        <div class="shrink-0">
          <svg
            class="h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">
              Total Divisions
            </dt>
            <dd class="text-2xl font-semibold text-gray-900">-</dd>
          </dl>
        </div>
      </div>
    </Card>

    <!-- Tasks card -->
    <Card>
      <div class="flex items-center">
        <div class="shrink-0">
          <svg
            class="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">
              Active Tasks
            </dt>
            <dd class="text-2xl font-semibold text-gray-900">-</dd>
          </dl>
        </div>
      </div>
    </Card>

    <!-- Events card -->
    <Card>
      <div class="flex items-center">
        <div class="shrink-0">
          <svg
            class="h-8 w-8 text-purple-600"
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
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">
              Upcoming Events
            </dt>
            <dd class="text-2xl font-semibold text-gray-900">-</dd>
          </dl>
        </div>
      </div>
    </Card>

    <!-- Finance card -->
    <Card>
      <div class="flex items-center">
        <div class="shrink-0">
          <svg
            class="h-8 w-8 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">Balance</dt>
            <dd class="text-2xl font-semibold text-gray-900">-</dd>
          </dl>
        </div>
      </div>
    </Card>
  </div>

  <!-- Quick actions -->
  <Card title="Quick Actions">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <a
        href="/app/divisions"
        class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
      >
        <div class="shrink-0">
          <svg
            class="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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
          <svg
            class="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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
          <svg
            class="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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
          <svg
            class="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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

  <!-- Getting started -->
  <Card title="Getting Started">
    <div class="prose prose-sm max-w-none">
      <p class="text-gray-600">
        Welcome to Sekre! Here are some steps to get you started:
      </p>
      <ol class="list-decimal list-inside space-y-2 text-gray-600">
        <li>Create your first division to organize your team</li>
        <li>Add tasks to track your work and assign them to team members</li>
        <li>Schedule events to keep everyone informed</li>
        <li>Track your finances with income and expense records</li>
      </ol>
    </div>
  </Card>
</div>
