<script lang="ts">
  /**
   * EventForm Component
   * Form for creating and editing events
   * Following SvelteKit 5 best practices with runes
   */
  import Button from "$lib/components/ui/Button.svelte";
  import {
    validateEventForm,
    toDatetimeLocal,
  } from "$lib/services/event.service";
  import type { Event } from "$lib/api/types/event.types";
  import type { Division } from "$lib/api/types";

  interface Props {
    event?: Event;
    divisions: Division[];
    oncancel: () => void;
    loading?: boolean;
  }

  let { event, divisions, oncancel, loading = false }: Props = $props();

  // Form state
  let formData = $derived({
    title: event?.title || "",
    description: event?.description || "",
    division_id: event?.division_id || "",
    start_time: event?.start_time ? toDatetimeLocal(event.start_time) : "",
    end_time: event?.end_time ? toDatetimeLocal(event.end_time) : "",
    location: event?.location || "",
  });

  let errors = $state<Record<string, string>>({});

  const isEditMode = $derived(!!event);
</script>

<div class="space-y-4">
  <!-- Title -->
  <div>
    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
      Title <span class="text-red-500">*</span>
    </label>
    <input
      type="text"
      id="title"
      name="title"
      bind:value={formData.title}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      class:border-red-500={errors.title}
      placeholder="Enter event title"
      maxlength="500"
      required
    />
    {#if errors.title}
      <p class="mt-1 text-sm text-red-600">{errors.title}</p>
    {/if}
  </div>

  <!-- Description -->
  <div>
    <label
      for="description"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      Description
    </label>
    <textarea
      id="description"
      name="description"
      bind:value={formData.description}
      rows="3"
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter event description"
    ></textarea>
  </div>

  <!-- Division -->
  <div>
    <label
      for="division_id"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      Division <span class="text-red-500">*</span>
    </label>
    <select
      id="division_id"
      name="division_id"
      bind:value={formData.division_id}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      class:border-red-500={errors.division_id}
      disabled={isEditMode}
      required
    >
      <option value="">Select division</option>
      {#each divisions as division}
        <option value={division.id}>{division.name}</option>
      {/each}
    </select>
    {#if errors.division_id}
      <p class="mt-1 text-sm text-red-600">{errors.division_id}</p>
    {/if}
  </div>

  <!-- Start Time -->
  <div>
    <label
      for="start_time"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      Start Time <span class="text-red-500">*</span>
    </label>
    <input
      type="datetime-local"
      id="start_time"
      name="start_time"
      bind:value={formData.start_time}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      class:border-red-500={errors.start_time}
      required
    />
    {#if errors.start_time}
      <p class="mt-1 text-sm text-red-600">{errors.start_time}</p>
    {/if}
  </div>

  <!-- End Time -->
  <div>
    <label for="end_time" class="block text-sm font-medium text-gray-700 mb-1">
      End Time <span class="text-red-500">*</span>
    </label>
    <input
      type="datetime-local"
      id="end_time"
      name="end_time"
      bind:value={formData.end_time}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      class:border-red-500={errors.end_time}
      required
    />
    {#if errors.end_time}
      <p class="mt-1 text-sm text-red-600">{errors.end_time}</p>
    {/if}
  </div>

  <!-- Location -->
  <div>
    <label for="location" class="block text-sm font-medium text-gray-700 mb-1">
      Location
    </label>
    <input
      type="text"
      id="location"
      name="location"
      bind:value={formData.location}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter event location"
      maxlength="500"
    />
  </div>

  <!-- Actions -->
  <div class="flex justify-end gap-3 pt-4">
    <Button
      type="button"
      variant="secondary"
      onclick={oncancel}
      disabled={loading}
    >
      Cancel
    </Button>
    <Button type="submit" variant="primary" disabled={loading}>
      {loading ? "Saving..." : isEditMode ? "Update Event" : "Create Event"}
    </Button>
  </div>
</div>
