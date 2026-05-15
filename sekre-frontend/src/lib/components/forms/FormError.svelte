<script lang="ts">
  import { AlertCircle } from "lucide-svelte";

  interface Props {
    id?: string;
    message: string;
    class?: string;
  }

  let { id, message, class: className = "" }: Props = $props();
</script>

<div
  {id}
  class="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 {className}"
  role="alert"
>
  <AlertCircle class="h-4 w-4 shrink-0 mt-0.5" />
  <span>{message}</span>
</div>
