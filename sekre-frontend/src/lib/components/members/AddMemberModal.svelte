<script lang="ts">
	/**
	 * Add Member Modal Component
	 * Form for adding a single new member
	 */
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	interface Props {
		isOpen: boolean;
		divisions: any[];
		onClose: () => void;
		onSuccess: (result: any) => void;
	}

	let { isOpen, divisions, onClose, onSuccess }: Props = $props();

  // Form state
  let email = $state("");
  let fullName = $state("");
  let role = $state("MEMBER");
  let divisionId = $state("");
  let divisionRole = $state("STAFF");
  let isSubmitting = $state(false);
  let errorMessage = $state("");

  function resetForm() {
    email = "";
    fullName = "";
    role = "MEMBER";
    divisionId = "";
    divisionRole = "STAFF";
    errorMessage = "";
  }

  function handleClose() {
    resetForm();
    onClose();
  }

	async function handleSubmit() {
		isSubmitting = true;
		errorMessage = '';

		try {
			const payload: any = {
				email,
				full_name: fullName,
				role
			};

			if (divisionId) {
				payload.division_id = divisionId;
				payload.division_role = divisionRole;
			}

			// Use local SvelteKit endpoint (handles auth server-side)
			const response = await fetch('/api/members/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				const error = await response.json().catch(() => ({ error: 'Failed to create member' }));
				throw new Error(error.error || error.message || 'Failed to create member');
			}

			const data = await response.json();
			onSuccess(data.data);
			handleClose();
		} catch (error: any) {
			errorMessage = error.message || 'Failed to create member';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Modal {isOpen} onClose={handleClose} title="Add New Member">
  <form
    onsubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}
  >
    <div class="space-y-4">
      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email <span class="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          bind:value={email}
          required
          disabled={isSubmitting}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="member@himti.org"
        />
      </div>

      <!-- Full Name -->
      <div>
        <label
          for="fullName"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="fullName"
          bind:value={fullName}
          required
          disabled={isSubmitting}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="John Doe"
        />
      </div>

      <!-- Organization Role -->
      <div>
        <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
          Organization Role <span class="text-red-500">*</span>
        </label>
        <select
          id="role"
          bind:value={role}
          disabled={isSubmitting}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
          <option value="OWNER">Owner</option>
        </select>
        <p class="mt-1 text-xs text-gray-500">
          {#if role === "OWNER"}
            Full access to all organization features
          {:else if role === "ADMIN"}
            Can manage members and divisions
          {:else}
            Basic member access
          {/if}
        </p>
      </div>

      <!-- Division (Optional) -->
      <div>
        <label
          for="division"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Division (Optional)
        </label>
        <select
          id="division"
          bind:value={divisionId}
          disabled={isSubmitting}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">No division</option>
          {#each divisions as division}
            <option value={division.id}>{division.name}</option>
          {/each}
        </select>
      </div>

      <!-- Division Role (if division selected) -->
      {#if divisionId}
        <div>
          <label
            for="divisionRole"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Division Role <span class="text-red-500">*</span>
          </label>
          <select
            id="divisionRole"
            bind:value={divisionRole}
            disabled={isSubmitting}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="STAFF">Staff</option>
            <option value="HEAD">Head</option>
          </select>
          <p class="mt-1 text-xs text-gray-500">
            {divisionRole === "HEAD"
              ? "Division leader (only one per division)"
              : "Regular division member"}
          </p>
        </div>
      {/if}

      <!-- Info Alert -->
      <Alert variant="info">
        <p class="text-sm">
          A temporary password will be generated. The member must reset it on
          first login.
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
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Member"}
        </Button>
      </div>
    </div>
  </form>
</Modal>
