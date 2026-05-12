<script lang="ts">
  /**
   * Events Page
   * Main page for event management
   * Following SvelteKit 5 best practices with runes
   */
  import type { PageData, ActionData } from "./$types";
  import Button from "$lib/components/ui/Button.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import Alert from "$lib/components/ui/Alert.svelte";
  import EventCard from "$lib/features/events/EventCard.svelte";
  import EventForm from "$lib/features/events/EventForm.svelte";
  import {
    groupEventsByStatus,
    sortEventsByStartTime,
  } from "$lib/services/event.service";
  import { enhance } from "$app/forms";
  import type { Event } from "$lib/api/types/event.types";

  interface Props {
    data: PageData;
    form?: ActionData;
  }

  let { data, form }: Props = $props();

  // Modal state
  let isCreateModalOpen = $state(false);
  let isEditModalOpen = $state(false);
  let selectedEvent = $state<Event | null>(null);
  let isSubmitting = $state(false);

  // Filter state
  let selectedDivision = $derived(data.filters.division_id || "");

  // Group events by status
  const groupedEvents = $derived(groupEventsByStatus(data.events));

  function openCreateModal() {
    isCreateModalOpen = true;
  }

  function closeCreateModal() {
    isCreateModalOpen = false;
  }

  function openEditModal(event: Event) {
    selectedEvent = event;
    isEditModalOpen = true;
  }

  function closeEditModal() {
    isEditModalOpen = false;
    selectedEvent = null;
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (selectedDivision) params.set("division_id", selectedDivision);

    const query = params.toString();
    window.location.href = `/app/events${query ? "?" + query : ""}`;
  }

  function clearFilters() {
    selectedDivision = "";
    window.location.href = "/app/events";
  }
</script>

<svelte:head>
  <title>Events - Sekre</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Events</h1>
      <p class="mt-1 text-sm text-gray-500">
        Schedule and manage your organization's events
      </p>
    </div>
    <Button variant="primary" onclick={openCreateModal}>
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
      New Event
    </Button>
  </div>

  <!-- Error message from form action -->
  {#if form?.error}
    <Alert variant="error" message={form.error} dismissible />
  {/if}

  <!-- Error message from page load -->
  {#if data.error}
    <Alert variant="error" message={data.error} dismissible />
  {/if}

  <!-- Filters -->
  <div class="bg-white border border-gray-200 rounded-lg p-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Division filter -->
      <div>
        <label
          for="division-filter"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Division
        </label>
        <select
          id="division-filter"
          bind:value={selectedDivision}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Divisions</option>
          {#each data.divisions as division}
            <option value={division.id}>{division.name}</option>
          {/each}
        </select>
      </div>

      <!-- Filter actions -->
      <div class="flex items-end gap-2 md:col-span-2">
        <div class="flex-1">
          <Button variant="primary" onclick={applyFilters}>Apply</Button>
        </div>
        <Button variant="secondary" onclick={clearFilters}>Clear</Button>
      </div>
    </div>
  </div>

  <!-- Events by status -->
  {#if data.events.length > 0}
    <div class="space-y-8">
      <!-- Ongoing Events -->
      {#if groupedEvents.ongoing.length > 0}
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Ongoing Events ({groupedEvents.ongoing.length})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each sortEventsByStartTime(groupedEvents.ongoing) as event (event.id)}
              <EventCard {event} onclick={() => openEditModal(event)} />
            {/each}
          </div>
        </div>
      {/if}

      <!-- Upcoming Events -->
      {#if groupedEvents.upcoming.length > 0}
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Events ({groupedEvents.upcoming.length})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each sortEventsByStartTime(groupedEvents.upcoming) as event (event.id)}
              <EventCard {event} onclick={() => openEditModal(event)} />
            {/each}
          </div>
        </div>
      {/if}

      <!-- Past Events -->
      {#if groupedEvents.past.length > 0}
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Past Events ({groupedEvents.past.length})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each sortEventsByStartTime(groupedEvents.past).reverse() as event (event.id)}
              <EventCard {event} onclick={() => openEditModal(event)} />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <EmptyState
      title="No events yet"
      description="Get started by creating your first event to keep your team informed."
    >
      {#snippet action()}
        <Button variant="primary" onclick={openCreateModal}>Create Event</Button
        >
      {/snippet}
    </EmptyState>
  {/if}
</div>

<!-- Create Event Modal -->
<Modal
  isOpen={isCreateModalOpen}
  onClose={closeCreateModal}
  title="Create New Event"
>
  <form
    method="POST"
    action="?/create"
    onsubmit={(e) => {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const division_id = formData.get("division_id") as string;
      const start_time = formData.get("start_time") as string;
      const end_time = formData.get("end_time") as string;

      if (!title?.trim() || !division_id || !start_time || !end_time) {
        e.preventDefault();
        return;
      }
    }}
    use:enhance={() => {
      isSubmitting = true;
      return async ({ result, update }) => {
        isSubmitting = false;

        if (result.type === "success") {
          closeCreateModal();
          await update();
        } else if (result.type === "failure") {
          await update();
        }
      };
    }}
  >
    <EventForm
      divisions={data.divisions}
      oncancel={closeCreateModal}
      loading={isSubmitting}
    />
  </form>
</Modal>

<!-- Edit Event Modal -->
{#if selectedEvent}
  <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Event">
    <form
      method="POST"
      action="?/update"
      onsubmit={(e) => {
        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const start_time = formData.get("start_time") as string;
        const end_time = formData.get("end_time") as string;

        if (!title?.trim() || !start_time || !end_time) {
          e.preventDefault();
          return;
        }
      }}
      use:enhance={() => {
        isSubmitting = true;
        return async ({ result, update }) => {
          isSubmitting = false;

          if (result.type === "success") {
            closeEditModal();
            await update();
          } else if (result.type === "failure") {
            await update();
          }
        };
      }}
    >
      <input type="hidden" name="event_id" value={selectedEvent.id} />
      <EventForm
        event={selectedEvent}
        divisions={data.divisions}
        oncancel={closeEditModal}
        loading={isSubmitting}
      />
    </form>

    <!-- Delete button -->
    <form
      method="POST"
      action="?/delete"
      use:enhance={() => {
        return async ({ result, update }) => {
          if (result.type === "success") {
            closeEditModal();
            await update();
          } else if (result.type === "failure") {
            await update();
          }
        };
      }}
      class="mt-4 pt-4 border-t border-gray-200"
    >
      <input type="hidden" name="event_id" value={selectedEvent.id} />
      <Button
        type="submit"
        variant="danger"
        onclick={() => {
          if (!confirm("Are you sure you want to delete this event?")) {
            return false;
          }
        }}
      >
        Delete Event
      </Button>
    </form>
  </Modal>
{/if}
