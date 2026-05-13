<script lang="ts">
	/**
	 * Import Result Modal Component
	 * Shows the result of bulk import with passwords
	 */
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	interface Props {
		isOpen: boolean;
		result: any;
		onClose: () => void;
	}

	let { isOpen, result, onClose }: Props = $props();

	function copyToClipboard() {
		if (!result) return;

		let text = 'Member Import Results\n\n';
		text += `Total: ${result.total_rows}\n`;
		text += `Success: ${result.success_count}\n`;
		text += `Failed: ${result.failure_count}\n\n`;

		if (result.created_members && result.created_members.length > 0) {
			text += 'Created Members (with temporary passwords):\n';
			text += '='.repeat(50) + '\n\n';
			result.created_members.forEach((member: any) => {
				text += `Email: ${member.email}\n`;
				text += `Name: ${member.full_name}\n`;
				text += `Password: ${member.temporary_password}\n`;
				if (member.division) {
					text += `Division: ${member.division}\n`;
				}
				text += '\n';
			});
		}

		if (result.errors && result.errors.length > 0) {
			text += '\nErrors:\n';
			text += '='.repeat(50) + '\n\n';
			result.errors.forEach((error: any) => {
				text += `Row ${error.row}: ${error.email} - ${error.message}\n`;
			});
		}

		navigator.clipboard.writeText(text);
		alert('Results copied to clipboard!');
	}

	function downloadAsText() {
		if (!result) return;

		let text = 'Member Import Results\n\n';
		text += `Total: ${result.total_rows}\n`;
		text += `Success: ${result.success_count}\n`;
		text += `Failed: ${result.failure_count}\n\n`;

		if (result.created_members && result.created_members.length > 0) {
			text += 'Created Members (with temporary passwords):\n';
			text += '='.repeat(50) + '\n\n';
			result.created_members.forEach((member: any) => {
				text += `Email: ${member.email}\n`;
				text += `Name: ${member.full_name}\n`;
				text += `Password: ${member.temporary_password}\n`;
				if (member.division) {
					text += `Division: ${member.division}\n`;
				}
				text += '\n';
			});
		}

		if (result.errors && result.errors.length > 0) {
			text += '\nErrors:\n';
			text += '='.repeat(50) + '\n\n';
			result.errors.forEach((error: any) => {
				text += `Row ${error.row}: ${error.email} - ${error.message}\n`;
			});
		}

		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `import-result-${new Date().toISOString().split('T')[0]}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<Modal {isOpen} onClose={onClose} title="Import Results">
	<div class="space-y-4">
		{#if result}
			<!-- Summary -->
			<div class="grid grid-cols-3 gap-4">
				<div class="bg-gray-50 rounded-lg p-4 text-center">
					<p class="text-sm text-gray-600">Total</p>
					<p class="text-2xl font-bold text-gray-900">{result.total_rows}</p>
				</div>
				<div class="bg-green-50 rounded-lg p-4 text-center">
					<p class="text-sm text-green-600">Success</p>
					<p class="text-2xl font-bold text-green-900">{result.success_count}</p>
				</div>
				<div class="bg-red-50 rounded-lg p-4 text-center">
					<p class="text-sm text-red-600">Failed</p>
					<p class="text-2xl font-bold text-red-900">{result.failure_count}</p>
				</div>
			</div>

			<!-- Warning to save passwords -->
			{#if result.created_members && result.created_members.length > 0}
				<Alert variant="warning">
					<p class="text-sm">
						<strong>Important:</strong> Save these temporary passwords! They won't be shown again.
					</p>
				</Alert>

				<!-- Created Members -->
				<div>
					<h3 class="text-sm font-medium text-gray-900 mb-2">
						Created Members ({result.created_members.length})
					</h3>
					<div class="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
						<table class="min-w-full divide-y divide-gray-200">
							<thead class="bg-gray-50 sticky top-0">
								<tr>
									<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
										Email
									</th>
									<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
										Name
									</th>
									<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
										Password
									</th>
									<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
										Division
									</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								{#each result.created_members as member}
									<tr>
										<td class="px-4 py-2 text-sm text-gray-900">{member.email}</td>
										<td class="px-4 py-2 text-sm text-gray-900">{member.full_name}</td>
										<td class="px-4 py-2 text-sm font-mono text-blue-600">
											{member.temporary_password}
										</td>
										<td class="px-4 py-2 text-sm text-gray-500">
											{member.division || '-'}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			<!-- Errors -->
			{#if result.errors && result.errors.length > 0}
				<div>
					<h3 class="text-sm font-medium text-red-900 mb-2">Errors ({result.errors.length})</h3>
					<div class="max-h-48 overflow-y-auto border border-red-200 rounded-md bg-red-50 p-3">
						<ul class="space-y-2">
							{#each result.errors as error}
								<li class="text-sm text-red-800">
									<strong>Row {error.row}:</strong>
									{error.email} - {error.message}
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/if}

			<!-- Actions -->
			<div class="flex justify-between items-center pt-4 border-t">
				<div class="flex gap-2">
					<Button type="button" variant="secondary" onclick={copyToClipboard}>
						Copy to Clipboard
					</Button>
					<Button type="button" variant="secondary" onclick={downloadAsText}>
						Download as Text
					</Button>
				</div>
				<Button type="button" variant="primary" onclick={onClose}> Close </Button>
			</div>
		{/if}
	</div>
</Modal>
