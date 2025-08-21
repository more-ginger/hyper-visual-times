<script lang="ts">
	let { selectedPair, selectedIds } = $props();
</script>

<div class="rounded-xl border p-2">
	<div class="flex justify-between border-b">
		<div>{selectedPair[0] ? selectedPair[0] : 'select first node'}</div>
		<div>arrow</div>
		<div>{selectedPair[1] ? selectedPair[1] : 'select another node'}</div>
	</div>
	<div class="p-10 text-center">
		{#each selectedIds as id}
			<div>{id}</div>
		{/each}
	</div>
</div>
