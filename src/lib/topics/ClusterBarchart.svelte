<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	let { selectedCluster } = $props();
	let data = $derived(selectedCluster[0].topWords.sort((a,b) => b.value-a.value));
	let width = $state(0);
	let height = $state(0);

	$inspect(data.map((d: {}, i: number) => d));

	let maxValue = $derived(d3.max(data.map((d: { value: number }, i: number) => d.value)));

	let yScale = $derived(
		d3
			.scaleLinear()
			.domain([0, maxValue])
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
</script>

<div class="my-4">
	<div class="h-[45vh] w-full" bind:clientWidth={width} bind:clientHeight={height}>
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
							y1={yScale(tick) + 25}
							y2={yScale(tick) + 25}
							stroke="black"
							stroke-width="0.5"
							stroke-dasharray="2 2"
						/>
						{#if t === axisTicks.length - 1}
							<text
								x="12"
								y={height - yScale(tick) - 30}
								font-size="10"
							>
								Mentions within cluster
							</text>
							<text x="12" y={height - yScale(tick) - 2} font-size="10">
								{tick}
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
