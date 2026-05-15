<script lang="ts">
  /**
   * Members Page
   * Organization members management
   */
  import type { PageData } from "./$types";
  import Button from "$lib/components/ui/Button.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import Alert from "$lib/components/ui/Alert.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import Toast from "$lib/components/ui/Toast.svelte";
  import AddMemberModal from "$lib/components/members/AddMemberModal.svelte";
  import ImportMembersModal from "$lib/components/members/ImportMembersModal.svelte";
  import ImportResultModal from "$lib/components/members/ImportResultModal.svelte";
  import { fetchApi } from "$lib/api/client";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // State
  let isEditModalOpen = $state(false);
  let isRemoveModalOpen = $state(false);
  let isAddMemberModalOpen = $state(false);
  let isImportModalOpen = $state(false);
  let isImportResultModalOpen = $state(false);
  let selectedMember = $state<any>(null);
  let selectedRole = $state("MEMBER");
  let isSubmitting = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");
  let importResult = $state<any>(null);
  let toastMessage = $state("");
  let toastType = $state<"success" | "error" | "info" | "warning">("info");
  let showToast = $state(false);

  // Get role badge color
  function getRoleBadgeColor(role: string): string {
    const colors: Record<string, string> = {
      OWNER: "bg-purple-100 text-purple-800",
      ADMIN: "bg-blue-100 text-blue-800",
      MEMBER: "bg-gray-100 text-gray-800",
      HEAD: "bg-green-100 text-green-800",
      STAFF: "bg-yellow-100 text-yellow-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  }

  function openEditModal(member: any) {
    selectedMember = member;
    selectedRole = member.role || "MEMBER";
    isEditModalOpen = true;
  }

  function closeEditModal() {
    isEditModalOpen = false;
    selectedMember = null;
    selectedRole = "MEMBER";
  }

  function openRemoveModal(member: any) {
    selectedMember = member;
    isRemoveModalOpen = true;
  }

  function closeRemoveModal() {
    isRemoveModalOpen = false;
    selectedMember = null;
  }

  async function handleUpdateRole() {
    if (!selectedMember) return;

    isSubmitting = true;
    errorMessage = "";

    try {
      await fetchApi(
        `members/${selectedMember.user?.id || selectedMember.user_id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: selectedRole }),
        },
      );

      successMessage = "Member role updated successfully";
      closeEditModal();
      // Reload page to refresh data
      window.location.reload();
    } catch (error: any) {
      errorMessage = error.message || "Failed to update member role";
    } finally {
      isSubmitting = false;
    }
  }

  async function handleRemoveMember() {
    if (!selectedMember) return;

    isSubmitting = true;
    errorMessage = "";

    try {
      await fetchApi(
        `members/${selectedMember.user?.id || selectedMember.user_id}`,
        {
          method: "DELETE",
        },
      );

      successMessage = "Member removed successfully";
      closeRemoveModal();
      // Reload page to refresh data
      window.location.reload();
    } catch (error: any) {
      errorMessage = error.message || "Failed to remove member";
    } finally {
      isSubmitting = false;
    }
  }

  function showToastMessage(
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
  ) {
    toastMessage = message;
    toastType = type;
    showToast = true;
  }

  function handleAddMemberSuccess(result: any) {
    showToastMessage(
      `Member created successfully! Temporary password: ${result.temporary_password}`,
      "success",
    );
    setTimeout(() => window.location.reload(), 2000);
  }

  function handleImportSuccess(result: any) {
    importResult = result;
    isImportResultModalOpen = true;
    showToastMessage(
      `Import completed: ${result.success_count} success, ${result.failure_count} failed`,
      result.failure_count > 0 ? "warning" : "success",
    );
  }
</script>

<svelte:head>
  <title>Members - Sekre</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Organization Members</h1>
      <p class="mt-1 text-sm text-gray-500">
        Manage your organization's team members and their roles
      </p>
    </div>
    <div class="flex gap-2">
      <Button variant="secondary" onclick={() => (isImportModalOpen = true)}>
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
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        Import Excel
      </Button>
      <Button variant="primary" onclick={() => (isAddMemberModalOpen = true)}>
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
  </div>

  <!-- Success message -->
  {#if successMessage}
    <Alert variant="success" message={successMessage} dismissible />
  {/if}

  <!-- Error message -->
  {#if errorMessage}
    <Alert variant="error" message={errorMessage} dismissible />
  {/if}

  <!-- Info message -->
  {#if data.error}
    <Alert variant="error" message={data.error} dismissible />
  {/if}

  <!-- Members List -->
  {#if data.members.length > 0}
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        {#each data.members as member}
          <li>
            <div class="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center min-w-0 flex-1">
                  <!-- Avatar -->
                  <div class="shrink-0">
                    <div
                      class="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg"
                    >
                      {member.user?.full_name?.charAt(0) || "U"}
                    </div>
                  </div>

                  <!-- Member Info -->
                  <div class="ml-4 min-w-0 flex-1">
                    <div class="flex items-center gap-3">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {member.user?.full_name || "Unknown User"}
                      </p>
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getRoleBadgeColor(
                          member.division_role || member.role || 'MEMBER',
                        )}"
                      >
                        {member.division_role || member.role || "MEMBER"}
                      </span>
                    </div>
                    <p class="mt-1 text-sm text-gray-500 truncate">
                      {member.user?.email || "No email"}
                    </p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="ml-4 shrink-0 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onclick={() => openEditModal(member)}
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onclick={() => openRemoveModal(member)}
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </div>

    <!-- Stats -->
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Total Members</p>
          <p class="text-2xl font-semibold text-gray-900">
            {data.members.length}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Total Divisions</p>
          <p class="text-2xl font-semibold text-gray-900">
            {data.divisions.length}
          </p>
        </div>
      </div>
    </div>
  {:else}
    <EmptyState
      title="No members yet"
      description="Start by adding members to your divisions."
    >
      <Button
        variant="primary"
        onclick={() => (window.location.href = "/app/divisions")}
      >
        Go to Divisions
      </Button>
    </EmptyState>
  {/if}
</div>

<!-- Edit Role Modal -->
<Modal
  isOpen={isEditModalOpen}
  onClose={closeEditModal}
  title="Edit Member Role"
>
  <div class="space-y-4">
    {#if selectedMember}
      <!-- Member Info -->
      <div class="p-3 bg-gray-50 rounded-md">
        <div class="flex items-center gap-3">
          <div
            class="shrink-0 h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold"
          >
            {selectedMember.user?.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">
              {selectedMember.user?.full_name || "Unknown User"}
            </p>
            <p class="text-xs text-gray-500">
              {selectedMember.user?.email || "No email"}
            </p>
          </div>
        </div>
      </div>

      <!-- Role Selection -->
      <div>
        <label
          for="edit-role"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Organization Role <span class="text-red-500">*</span>
        </label>
        <select
          id="edit-role"
          bind:value={selectedRole}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Member</option>
        </select>
        <p class="mt-1 text-xs text-gray-500">
          {#if selectedRole === "OWNER"}
            Full access to all organization features and settings
          {:else if selectedRole === "ADMIN"}
            Can manage members, divisions, and organization settings
          {:else}
            Basic access to assigned divisions and tasks
          {/if}
        </p>
      </div>

      <!-- Error message -->
      {#if errorMessage}
        <Alert variant="error" message={errorMessage} dismissible />
      {/if}
    {/if}

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4">
      <Button
        type="button"
        variant="secondary"
        onclick={closeEditModal}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="primary"
        onclick={handleUpdateRole}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Updating..." : "Update Role"}
      </Button>
    </div>
  </div>
</Modal>

<!-- Remove Member Modal -->
<Modal
  isOpen={isRemoveModalOpen}
  onClose={closeRemoveModal}
  title="Remove Member"
>
  <div class="space-y-4">
    {#if selectedMember}
      <!-- Warning -->
      <Alert variant="warning">
        <p class="text-sm">
          <strong>Warning:</strong> This action cannot be undone. The member will
          lose access to all organization resources.
        </p>
      </Alert>

      <!-- Member Info -->
      <div class="p-3 bg-gray-50 rounded-md">
        <div class="flex items-center gap-3">
          <div
            class="shrink-0 h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold"
          >
            {selectedMember.user?.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">
              {selectedMember.user?.full_name || "Unknown User"}
            </p>
            <p class="text-xs text-gray-500">
              {selectedMember.user?.email || "No email"}
            </p>
          </div>
        </div>
      </div>

      <p class="text-sm text-gray-600">
        Are you sure you want to remove this member from the organization?
      </p>

      <!-- Error message -->
      {#if errorMessage}
        <Alert variant="error" message={errorMessage} dismissible />
      {/if}
    {/if}

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4">
      <Button
        type="button"
        variant="secondary"
        onclick={closeRemoveModal}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="danger"
        onclick={handleRemoveMember}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Removing..." : "Remove Member"}
      </Button>
    </div>
  </div>
</Modal>

<!-- Add Member Modal -->
<AddMemberModal
  isOpen={isAddMemberModalOpen}
  divisions={data.divisions}
  onClose={() => (isAddMemberModalOpen = false)}
  onSuccess={handleAddMemberSuccess}
/>

<!-- Import Members Modal -->
<ImportMembersModal
  isOpen={isImportModalOpen}
  onClose={() => (isImportModalOpen = false)}
  onSuccess={handleImportSuccess}
/>

<!-- Import Result Modal -->
<ImportResultModal
  isOpen={isImportResultModalOpen}
  result={importResult}
  onClose={() => {
    isImportResultModalOpen = false;
    setTimeout(() => window.location.reload(), 500);
  }}
/>

<!-- Toast Notification -->
<!-- TODO: Refactor to use toastStore instead of props -->
<!--
{#if showToast}
  <Toast
    message={toastMessage}
    type={toastType}
    onClose={() => (showToast = false)}
  />
{/if}
-->
