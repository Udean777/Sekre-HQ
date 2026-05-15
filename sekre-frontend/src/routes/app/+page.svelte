<script lang="ts">
  import type { PageData } from "./$types";
  import { Card, EmptyState, Badge } from "$lib/components/ui";
  import {
    StatCard,
    RecentTaskItem,
    RecentEventItem,
    QuickActionCard,
  } from "$lib/components/dashboard";
  import { Plus, CheckSquare, Calendar, DollarSign } from "lucide-svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  const greeting = $derived(getGreeting());
</script>

<svelte:head>
  <title>Dashboard - Sekre</title>
</svelte:head>

<div class="space-y-6">
  <!-- Welcome section -->
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      {greeting}{#if data.user}, {data.user.full_name}{/if}!
    </h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      Here's what's happening with your organization today.
    </p>
  </div>

  <!-- Error message -->
  {#if data.error}
    <Card padding="md">
      <div class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
        <p class="text-sm text-red-800 dark:text-red-200">
          {data.error}
        </p>
      </div>
    </Card>
  {/if}

  <!-- Summary cards -->
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard
      title="Active Tasks"
      value={data.stats.activeTasks}
      type="tasks"
      href="/app/tasks"
    />

    <StatCard
      title="Upcoming Events"
      value={data.stats.upcomingEvents}
      type="events"
      href="/app/events"
    />

    <StatCard title="Total Tasks" value={data.stats.totalTasks} type="tasks" />

    <StatCard
      title="Total Events"
      value={data.stats.totalEvents}
      type="events"
    />
  </div>

  <!-- Recent Activity -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Recent Tasks -->
    <Card title="Recent Tasks">
      {#if data.recentTasks.length > 0}
        <div class="space-y-2">
          {#each data.recentTasks as task}
            <RecentTaskItem {task} />
          {/each}
        </div>
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href="/app/tasks"
            class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            View all tasks →
          </a>
        </div>
      {:else}
        <EmptyState
          title="No tasks yet"
          description="Create your first task to get started"
          icon={CheckSquare}
        />
      {/if}
    </Card>

    <!-- Recent Events -->
    <Card title="Recent Events">
      {#if data.recentEvents.length > 0}
        <div class="space-y-2">
          {#each data.recentEvents as event}
            <RecentEventItem {event} />
          {/each}
        </div>
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href="/app/events"
            class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            View all events →
          </a>
        </div>
      {:else}
        <EmptyState
          title="No events yet"
          description="Schedule your first event to get started"
          icon={Calendar}
        />
      {/if}
    </Card>
  </div>

  <!-- Quick Actions -->
  <Card title="Quick Actions">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <QuickActionCard
        title="New Task"
        description="Create a new task"
        href="/app/tasks"
        icon={Plus}
      />

      <QuickActionCard
        title="New Event"
        description="Schedule a new event"
        href="/app/events"
        icon={Plus}
      />

      <QuickActionCard
        title="New Transaction"
        description="Record a transaction"
        href="/app/finance"
        icon={Plus}
      />
    </div>
  </Card>
</div>
