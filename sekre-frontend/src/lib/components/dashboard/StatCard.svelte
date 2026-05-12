<script lang="ts">
  /**
   * StatCard Component
   * Displays a statistic card with icon
   * Following SvelteKit 5 best practices with runes
   */
  import { getStatIcon, getStatColor } from "$lib/services/dashboard.service";

  interface Props {
    title: string;
    value: string | number;
    type: string;
    href?: string;
  }

  let { title, value, type, href }: Props = $props();

  const icon = $derived(getStatIcon(type));
  const color = $derived(getStatColor(type));
</script>

{#if href}
  <a
    {href}
    class="block bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-sm transition-all"
  >
    <div class="flex items-center">
      <div
        class="shrink-0 p-3 rounded-full"
        class:bg-blue-100={color === "blue"}
        class:bg-green-100={color === "green"}
        class:bg-purple-100={color === "purple"}
        class:bg-yellow-100={color === "yellow"}
      >
        <svg
          class="h-6 w-6"
          class:text-blue-600={color === "blue"}
          class:text-green-600={color === "green"}
          class:text-purple-600={color === "purple"}
          class:text-yellow-600={color === "yellow"}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d={icon}
          />
        </svg>
      </div>
      <div class="ml-5 w-0 flex-1">
        <dl>
          <dt class="text-sm font-medium text-gray-500 truncate">
            {title}
          </dt>
          <dd class="text-2xl font-semibold text-gray-900">
            {value}
          </dd>
        </dl>
      </div>
    </div>
  </a>
{:else}
  <div class="bg-white border border-gray-200 rounded-lg p-6">
    <div class="flex items-center">
      <div
        class="shrink-0 p-3 rounded-full"
        class:bg-blue-100={color === "blue"}
        class:bg-green-100={color === "green"}
        class:bg-purple-100={color === "purple"}
        class:bg-yellow-100={color === "yellow"}
      >
        <svg
          class="h-6 w-6"
          class:text-blue-600={color === "blue"}
          class:text-green-600={color === "green"}
          class:text-purple-600={color === "purple"}
          class:text-yellow-600={color === "yellow"}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d={icon}
          />
        </svg>
      </div>
      <div class="ml-5 w-0 flex-1">
        <dl>
          <dt class="text-sm font-medium text-gray-500 truncate">
            {title}
          </dt>
          <dd class="text-2xl font-semibold text-gray-900">
            {value}
          </dd>
        </dl>
      </div>
    </div>
  </div>
{/if}
