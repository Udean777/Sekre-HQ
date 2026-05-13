<script lang="ts">
	/**
	 * Import Members Modal Component
	 * Bulk import members from Excel file
	 */
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { getApiUrl } from '$lib/api/client';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onSuccess: (result: any) => void;
	}

	let { isOpen, onClose, onSuccess }: Props = $props();

  // State
  let selectedFile = $state<File | null>(null);
  let isSubmitting = $state(false);
  let errorMessage = $state("");
  let fileInputElement: HTMLInputElement;

  function resetForm() {
    selectedFile = null;
    errorMessage = "";
    if (fileInputElement) {
      fileInputElement.value = "";
    }
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (
        !validTypes.includes(file.type) &&
        !file.name.endsWith(".xlsx") &&
        !file.name.endsWith(".xls")
      ) {
        errorMessage = "Please select a valid Excel file (.xlsx or .xls)";
        target.value = "";
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        errorMessage = "File size must be less than 5MB";
        target.value = "";
        return;
      }

      selectedFile = file;
      errorMessage = "";
    }
  }

	async function handleSubmit() {
		if (!selectedFile) {
			errorMessage = 'Please select a file';
			return;
		}

		isSubmitting = true;
		errorMessage = '';

		try {
			const formData = new FormData();
			formData.append('file', selectedFile); // selectedFile is guaranteed not null here

			// Use local SvelteKit endpoint (handles auth server-side)
			const response = await fetch('/api/members/bulk-import', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const error = await response.json().catch(() => ({ error: 'Upload failed' }));
				throw new Error(error.error || error.message || 'Upload failed');
			}

			const data = await response.json();
			onSuccess(data.data);
			handleClose();
		} catch (error: any) {
			errorMessage = error.message || 'Failed to import members';
		} finally {
			isSubmitting = false;
		}
	}

	function downloadTemplate() {
		window.open(getApiUrl('members/template'), '_blank');
	}
</script>

<Modal {isOpen} onClose={handleClose} title="Import Members from Excel">
  <form
    onsubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}
  >
    <div class="space-y-4">
      <!-- Download Template -->
      <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div class="flex items-start">
          <svg
            class="h-5 w-5 text-blue-600 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div class="ml-3 flex-1">
            <p class="text-sm text-blue-800 font-medium">
              Download Template First
            </p>
            <p class="text-sm text-blue-700 mt-1">
              Use our Excel template to ensure your data is formatted correctly.
            </p>
            <button
              type="button"
              onclick={downloadTemplate}
              class="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Download Template
            </button>
          </div>
        </div>
      </div>

      <!-- File Upload -->
      <div>
        <label for="file" class="block text-sm font-medium text-gray-700 mb-1">
          Select Excel File <span class="text-red-500">*</span>
        </label>
        <input
          bind:this={fileInputElement}
          type="file"
          id="file"
          accept=".xlsx,.xls"
          onchange={handleFileSelect}
          disabled={isSubmitting}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        {#if selectedFile}
          <p class="mt-1 text-sm text-gray-600">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(
              2,
            )} KB)
          </p>
        {/if}
      </div>

      <!-- Instructions -->
      <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
        <p class="text-sm font-medium text-gray-900 mb-2">
          Excel Format Requirements:
        </p>
        <ul class="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Columns: Email, Full Name, Role, Division, Division Role</li>
          <li>Role must be: OWNER, ADMIN, or MEMBER</li>
          <li>Division Role must be: HEAD or STAFF</li>
          <li>Only one HEAD per division</li>
          <li>Maximum 10 members per division</li>
          <li>Division names must match existing divisions</li>
        </ul>
      </div>

      <!-- Warning -->
      <Alert variant="warning">
        <p class="text-sm">
          <strong>Important:</strong> Temporary passwords will be generated for all
          members. Make sure to save the result after import.
        </p>
      </Alert>

      <!-- Error Message -->
      {#if errorMessage}
        <Alert variant="error" message={errorMessage} dismissible />
      {/if}

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onclick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !selectedFile}
        >
          {isSubmitting ? "Importing..." : "Import Members"}
        </Button>
      </div>
    </div>
  </form>
</Modal>
