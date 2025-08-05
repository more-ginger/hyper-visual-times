<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	let { selectedCluster, switchView } = $props();
	let data = $derived(selectedCluster[0].topWords);
	let width = $state(0);
	let height = $state(0);

	let yScale = $derived(
		d3
			.scaleLinear()
			.domain([0, 100])
			.range([0, height - 25])
	);

	let xScale = $derived(
		d3
			.scaleLinear()
			.domain(d3.extent(data.map((d: {}, i: number) => i)))
			.range([30, width - 30])
	);

	let leftAxis = $derived(d3.axisLeft(yScale));
	let axisTicks = $derived(leftAxis.scale().ticks());

	function handleClusterSelection() {
		switchView({
			selectionIsActive: false,
			networkIsActive: true
		});
	}
</script>

<div class="m-2">
	<div class="mb-2 flex items-center justify-between">
		<p class="border-b font-serif text-xs">{selectedCluster[0].manualLabel}</p>
		<button
			onclick={() => {
				handleClusterSelection();
			}}>Go to Network</button
		>
	</div>
	<div class="h-70 w-full" bind:clientWidth={width} bind:clientHeight={height}>
		<svg {width} {height}>
			<g class="-translate-y-2">
				{#each data as word, w}
					<rect
						x={xScale(w)}
						y={height - yScale(word.value)}
						width="10"
						height={yScale(word.value)}
					/>
				{/each}
				<g>
					<line x1="10" x2={width - 10} y1={height} y2={height} stroke="black" />
					<line x1="10" x2="10" y1={height} y2={20} stroke="black" />
					{#each axisTicks as tick, t}
						<line
							x1="10"
							x2={width - 10}
							y1={yScale(tick)}
							y2={yScale(tick)}
							stroke="black"
							stroke-width="0.5"
							stroke-dasharray="2 2"
						/>
						{#if t === axisTicks.length - 1}
							<text x="12" y={height - yScale(tick) - 2} font-size="10">
								{tick}% frequency within cluster
							</text>
						{:else}
							<text x="12" y={height - yScale(tick) - 2} font-size="10">{tick}</text>
						{/if}
					{/each}
				</g>
			</g>
		</svg>
		<div class="mx-2 grid grid-cols-10 pt-2 pl-2">
			{#each data as word}
				<div class="flex -rotate-90 items-center justify-end text-xs">
					<p>{word.word}</p>
				</div>
			{/each}
		</div>
	</div>
</div>
