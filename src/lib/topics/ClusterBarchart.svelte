<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	let { selectedCluster } = $props();
	let data = $derived(selectedCluster[0].topWords);
	let width = $state(0);
	let height = $state(0);

	let yScale = $derived(d3.scaleLinear().domain([0, 100]).range([0, height]));

	let xScale = $derived(
		d3
			.scaleLinear()
			.domain(d3.extent(data.map((d: {}, i: number) => i)))
			.range([30, width - 30])
	);
</script>

<div class="bg-green-100">
	<h1>{selectedCluster[0].manualLabel}</h1>
	<div class="h-70 w-full" bind:clientWidth={width} bind:clientHeight={height}>
		<svg {width} {height} class="bg-purple-100">
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
				</g>
			</g>
		</svg>
	</div>
</div>
