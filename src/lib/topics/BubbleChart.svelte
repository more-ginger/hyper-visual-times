<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import BubbleChartLabels from './BubbleChartLabels.svelte';

	let { TopicClusters, selectNewCluster } = $props();

	let width = $state(0);
	let height = $state(0);
	let simulation;
	let finalClusters = $state([]);
	let clusterRadius = $derived(width / 2);
	let categories = $derived(TopicClusters.map((d: { group: string }) => d.group));
	let uniqueCategories = $derived(
		categories.filter((value: string, index: number, array: string[]) => {
			return array.indexOf(value) === index;
		})
	);

	function handleClusterSelection(current: string) {
		selectNewCluster(current);
	}

	function distance(x1: number, y1: number, x2: number, y2: number) {
		return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
	}

	const radiusScale = $derived(
		d3
			.scaleLinear()
			.domain(
				d3.extent(
					TopicClusters.map((d) => {
						return d.count;
					})
				)
			)
			.range([12, 180])
	);

	const categoryScale = $derived(
		d3.scaleOrdinal(uniqueCategories, ['#FF805B', '#FFBC35', '#EAFFC0', '#FFDAB9'])
	);

	$effect(() => {
		simulation = d3
			.forceSimulation(TopicClusters)
			.force('charge', d3.forceManyBody().strength(0.1))
			.force(
				'collide',
				d3
					.forceCollide()
					.radius((d: { count: number }) => radiusScale(d.count) + 5)
					.strength(0.2)
					.iterations(1)
			)
			.force('center', d3.forceCenter(width / 2, height / 2))
			.force('bounding', () => {
				TopicClusters.forEach((node: node) => {
					const xCenter = width / 2;
					const yCenter = height / 2;
					if (distance(node.x, node.y, xCenter, yCenter) > clusterRadius) {
						const theta = Math.atan((node.y - yCenter) / (node.x - xCenter));
						node.x = xCenter + clusterRadius * Math.cos(theta) * (node.x < xCenter ? -1 : 1);
						node.y = yCenter + clusterRadius * Math.sin(theta) * (node.x < xCenter ? -1 : 1);
					}
				});
			})
			.on('tick', simulationUpdate)
			.tick(2);
	});

	function simulationUpdate() {
		finalClusters = TopicClusters;
	}
</script>

<div class="h-full w-full" bind:clientWidth={width} bind:clientHeight={height}>
	<svg {width} {height}>
		{#await finalClusters then finalClusters}
			{#each finalClusters as cluster, c}
				<circle
					cx={cluster.x}
					cy={cluster.y}
					r={radiusScale(cluster.count)}
					stroke="black"
					fill={categoryScale(cluster.group)}
				></circle>
				<BubbleChartLabels {cluster} {c} {radiusScale} />
				<!-- svelte-ignore a11y_unknown_aria_attribute -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<circle
					class="cursor-pointer"
					cx={cluster.x}
					cy={cluster.y}
					r={radiusScale(cluster.count)}
					stroke="none"
					fill="transparent"
					onclick={() => {
						handleClusterSelection(cluster.manualLabel);
					}}
				></circle>
			{/each}
		{/await}
	</svg>
</div>
