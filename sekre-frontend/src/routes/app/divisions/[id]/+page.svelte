<script lang="ts">
  /**
   * Division Detail Page
   * Shows division details with tabs for members, tasks, events, transactions
   * Following SvelteKit 5 best practices with runes
   */
  import type { PageData, ActionData } from "./$types";
  import Button from "$lib/components/ui/Button.svelte";
  import Badge from "$lib/components/ui/Badge.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Alert from "$lib/components/ui/Alert.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import UserSearchInput from "$lib/components/ui/UserSearchInput.svelte";
  import TaskCard from "$lib/features/tasks/TaskCard.svelte";
  import EventCard from "$lib/features/events/EventCard.svelte";
  import TransactionCard from "$lib/features/finance/TransactionCard.svelte";
  import { sortTasksByDueDate } from "$lib/services/task.service";
  import { sortEventsByStartTime } from "$lib/services/event.service";
  import { sortTransactionsByDate } from "$lib/services/finance.service";
  import { enhance } from "$app/forms";

  interface Props {
    data: PageData;
    form?: ActionData;
  }

  let { data, form }: Props = $props();

  // Tab state
  let activeTab = $state<"members" | "tasks" | "events" | "transactions">(
    "members",
  );

  // Modal state
  let isAddMemberModalOpen = $state(false);
  let isSubmitting = $state(false);
  let selectedUser = $state<{
    id: string;
    full_name: string;
    email: string;
  } | null>(null);
  let selectedRole = $state("STAFF");

  // Get existing member IDs to exclude from search
  let existingMemberIds = $derived(
    data.members.map((m) => m.user?.id || m.user_id),
  );

  function setActiveTab(tab: typeof activeTab) {
    activeTab = tab;
  }

  function openAddMemberModal() {
    selectedUser = null;
    selectedRole = "STAFF";
    isAddMemberModalOpen = true;
  }

  function closeAddMemberModal() {
    isAddMemberModalOpen = false;
    selectedUser = null;
    selectedRole = "STAFF";
  }

  function handleUserSelect(user: {
    id: string;
    full_name: string;
    email: string;
  }) {
    selectedUser = user;
  }
</script>

<svelte:head>
  <title>{data.division.name} - Sekre</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <div class="flex items-center gap-3">
        <a
          href="/app/divisions"
          class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          aria-label="Back to divisions"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </a>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {data.division.name}
        </h1>
      </div>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Division details and management
      </p>
    </div>
  </div>

  <!-- Error message -->
  {#if form?.error}
    <Alert variant="error" message={form.error} dismissible />
  {/if}

  <!-- Stats -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card>
      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">Members</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {data.members.length}
        </p>
      </div>
    </Card>
    <Card>
      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">Tasks</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {data.tasks.length}
        </p>
      </div>
    </Card>
    <Card>
      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">Events</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {data.events.length}
        </p>
      </div>
    </Card>
    <Card>
      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {data.transactions.length}
        </p>
      </div>
    </Card>
  </div>

  <!-- Tabs -->
  <div class="border-b border-gray-200 dark:border-gray-700">
    <nav class="-mb-px flex space-x-8">
      <button
        type="button"
        onclick={() => setActiveTab("members")}
        class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
        class:border-blue-500={activeTab === "members"}
        class:text-blue-600={activeTab === "members"}
        class:dark:text-blue-400={activeTab === "members"}
        class:border-transparent={activeTab !== "members"}
        class:text-gray-500={activeTab !== "members"}
        class:dark:text-gray-400={activeTab !== "members"}
        class:hover:text-gray-700={activeTab !== "members"}
        class:dark:hover:text-gray-300={activeTab !== "members"}
        class:hover:border-gray-300={activeTab !== "members"}
        class:dark:hover:border-gray-600={activeTab !== "members"}
      >
        Members ({data.members.length})
      </button>

      <button
        type="button"
        onclick={() => setActiveTab("tasks")}
        class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
        class:border-blue-500={activeTab === "tasks"}
        class:text-blue-600={activeTab === "tasks"}
        class:dark:text-blue-400={activeTab === "tasks"}
        class:border-transparent={activeTab !== "tasks"}
        class:text-gray-500={activeTab !== "tasks"}
        class:dark:text-gray-400={activeTab !== "tasks"}
        class:hover:text-gray-700={activeTab !== "tasks"}
        class:dark:hover:text-gray-300={activeTab !== "tasks"}
        class:hover:border-gray-300={activeTab !== "tasks"}
        class:dark:hover:border-gray-600={activeTab !== "tasks"}
      >
        Tasks ({data.tasks.length})
      </button>

      <button
        type="button"
        onclick={() => setActiveTab("events")}
        class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
        class:border-blue-500={activeTab === "events"}
        class:text-blue-600={activeTab === "events"}
        class:dark:text-blue-400={activeTab === "events"}
        class:border-transparent={activeTab !== "events"}
        class:text-gray-500={activeTab !== "events"}
        class:dark:text-gray-400={activeTab !== "events"}
        class:hover:text-gray-700={activeTab !== "events"}
        class:dark:hover:text-gray-300={activeTab !== "events"}
        class:hover:border-gray-300={activeTab !== "events"}
        class:dark:hover:border-gray-600={activeTab !== "events"}
      >
        Events ({data.events.length})
      </button>

      <button
        type="button"
        onclick={() => setActiveTab("transactions")}
        class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
        class:border-blue-500={activeTab === "transactions"}
        class:text-blue-600={activeTab === "transactions"}
        class:dark:text-blue-400={activeTab === "transactions"}
        class:border-transparent={activeTab !== "transactions"}
        class:text-gray-500={activeTab !== "transactions"}
        class:dark:text-gray-400={activeTab !== "transactions"}
        class:hover:text-gray-700={activeTab !== "transactions"}
        class:dark:hover:text-gray-300={activeTab !== "transactions"}
        class:hover:border-gray-300={activeTab !== "transactions"}
        class:dark:hover:border-gray-600={activeTab !== "transactions"}
      >
        Transactions ({data.transactions.length})
      </button>
    </nav>
  </div>

  <!-- Tab Content -->
  <div class="mt-6">
    {#if activeTab === "members"}
      <div class="space-y-4">
        <!-- Add Member Button -->
        <div class="flex start">
          <Button variant="primary" onclick={openAddMemberModal}>
            <svg
              class="h-5 w-5 mr-2"
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
            Add Member
          </Button>
        </div>

        {#if data.members.length > 0}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each data.members as member}
              <Card>
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {member.user?.full_name || "Unknown"}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {member.user?.email || ""}
                    </p>
                    <Badge
                      size="sm"
                      class="mt-2"
                      color={member.division_role === "HEAD" ? "blue" : "gray"}
                    >
                      {member.division_role}
                    </Badge>
                  </div>
                </div>
              </Card>
            {/each}
          </div>
        {:else}
          <Card>
            <p class="text-center text-gray-500 dark:text-gray-400 py-8">
              No members yet
            </p>
          </Card>
        {/if}
      </div>
    {:else if activeTab === "tasks"}
      <div class="space-y-4">
        {#if data.tasks.length > 0}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each sortTasksByDueDate(data.tasks) as task}
              <TaskCard
                {task}
                onclick={() => (window.location.href = "/app/tasks")}
              />
            {/each}
          </div>
        {:else}
          <Card>
            <p class="text-center text-gray-500 dark:text-gray-400 py-8">
              No tasks yet
            </p>
          </Card>
        {/if}
      </div>
    {:else if activeTab === "events"}
      <div class="space-y-4">
        {#if data.events.length > 0}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each sortEventsByStartTime(data.events) as event}
              <EventCard
                {event}
                onclick={() => (window.location.href = "/app/events")}
              />
            {/each}
          </div>
        {:else}
          <Card>
            <p class="text-center text-gray-500 dark:text-gray-400 py-8">
              No events yet
            </p>
          </Card>
        {/if}
      </div>
    {:else if activeTab === "transactions"}
      <div class="space-y-4">
        {#if data.transactions.length > 0}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each sortTransactionsByDate(data.transactions) as transaction}
              <TransactionCard
                {transaction}
                onclick={() => (window.location.href = "/app/finance")}
              />
            {/each}
          </div>
        {:else}
          <Card>
            <p class="text-center text-gray-500 dark:text-gray-400 py-8">
              No transactions yet
            </p>
          </Card>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- Add Member Modal -->
<Modal
  isOpen={isAddMemberModalOpen}
  onClose={closeAddMemberModal}
  title="Add Member to Division"
>
  <form
    method="POST"
    action="?/addMember"
    use:enhance={() => {
      isSubmitting = true;
      return async ({ result, update }) => {
        isSubmitting = false;
        if (result.type === "success") {
          closeAddMemberModal();
          await update();
        } else if (result.type === "failure") {
          await update();
        }
      };
    }}
  >
    <div class="space-y-4">
      <!-- User Search -->
      <div>
        <label
          for="user-search-input"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Select User <span class="text-red-500">*</span>
        </label>
        <div id="user-search-input">
          <UserSearchInput
            onSelect={handleUserSelect}
            placeholder="Search by name or email..."
            disabled={isSubmitting}
            excludeUserIds={existingMemberIds}
          />
        </div>
        {#if selectedUser}
          <input type="hidden" name="user_id" value={selectedUser.id} />
          <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div class="flex items-center gap-3">
              <div
                class="shrink-0 h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold"
              >
                {selectedUser.full_name.charAt(0).toUpperCase()}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedUser.full_name}
                </p>
                <p class="text-xs text-gray-600">{selectedUser.email}</p>
              </div>
              <button
                type="button"
                onclick={() => (selectedUser = null)}
                class="text-gray-400 hover:text-gray-600"
                aria-label="Remove selected user"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        {:else}
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Start typing to search for users in your organization
          </p>
        {/if}
      </div>

      <!-- Role Selection -->
      <div>
        <label
          for="role"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Role <span class="text-red-500">*</span>
        </label>
        <select
          id="role"
          name="role"
          bind:value={selectedRole}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="HEAD">Head</option>
          <option value="STAFF">Staff</option>
        </select>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {selectedRole === "HEAD"
            ? "Heads can manage division members and settings"
            : "Staff members can view and participate in division activities"}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex justify-start items-start gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onclick={closeAddMemberModal}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !selectedUser}
        >
          {isSubmitting ? "Adding..." : "Add Member"}
        </Button>
      </div>
    </div>
  </form>
</Modal>
