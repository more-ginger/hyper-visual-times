<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import NetworksData from '../../content/data/topics/networks.json';
	let { selectedCluster, switchView } = $props();
	let width = $state(0);
	let height = $state(0);
	let simulation;
	let currentNetworkData = $derived(
		NetworksData.filter((network) => {
			return selectedCluster[0].id === network.topic;
		})
	);
	let nodes = $derived(currentNetworkData[0].nodes);
	let links = $derived(currentNetworkData[0].links);

	let nodesForRender = $state([]);
	let linksForRender = $state([]);

	const radiusScale = $derived(
		d3
			.scaleLinear()
			.domain(
				d3.extent(
					nodes.map((d) => {
						return d.size;
					})
				)
			)
			.range([5, 20])
	);

	function handleClusterReset() {
		switchView({
			selectionIsActive: true,
			networkIsActive: false
		});
	}

	$effect(() => {
		simulation = d3
			.forceSimulation(nodes)
			.force('charge', d3.forceManyBody().strength(0.1))
			.force(
				'link',
				d3
					.forceLink(links)
					.id((d) => d.id)
					.distance((d) => d.value)
			)
			.force(
				'collide',
				d3
					.forceCollide()
					.radius((d: { count: number }) => radiusScale(d.size) + 5)
					.strength(10)
					.iterations(1)
			)
			.force('center', d3.forceCenter(width / 2, height / 2))
			.on('tick', simulationUpdate)
			.tick(1);
	});

	function simulationUpdate() {
		nodesForRender = nodes;
		linksForRender = links;
	}
</script>

<div class="h-full w-full" bind:clientWidth={width} bind:clientHeight={height}>
	<div class="absolute m-2">
		<button
			onclick={() => {
				handleClusterReset();
			}}>Back to clusters</button
		>
	</div>
	{#await nodesForRender then nodesForRender}
		<svg {width} {height} class="bg-red-100">
			<g>
				{#each linksForRender as link}
					<line
						x1={link.source.x}
						x2={link.target.x}
						y1={link.source.y}
						y2={link.target.y}
						stroke="black"
					/>
				{/each}
				{#each nodesForRender as node}
					<circle cx={node.x} cy={node.y} r={radiusScale(node.size)} stroke="black" fill="red" />
				{/each}
			</g>
		</svg>
	{/await}
</div>
