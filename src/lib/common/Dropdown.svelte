<script lang="ts">
	let { availableFilter, selected = $bindable() } = $props();
	let mirrorEl: HTMLElement | null = $state(null);
	let selectEl: HTMLSelectElement | null = $state(null);
	function resizeSelect() {
		if (mirrorEl !== null && selectEl !== null && selected) {
			mirrorEl.textContent = selected;
			selectEl.style.width = mirrorEl.offsetWidth + 30 + 'px';
		}
	}

	$effect(() => {
		resizeSelect();
		selected;
	});
</script>

<div class="select-wrapper">
	<select
		bind:value={selected}
		bind:this={selectEl}
		class="inline-block border-b border-b-2 border-black px-2"
	>
		{#each availableFilter as filter, i}
			<option value={filter.key}>
				{filter.key}
			</option>
		{/each}
	</select>
	<span class="select-mirror" bind:this={mirrorEl}></span>
</div>

<style>
	.select-wrapper {
		display: inline-block;
		position: relative;
	}

	select {
		font: inherit;
		min-width: 50px;
		padding: 4px 8px;
		width: auto;
	}

	.select-mirror {
		position: absolute;
		visibility: hidden;
		white-space: nowrap;
		font: inherit;
		padding: 4px 8px;
	}
</style>
