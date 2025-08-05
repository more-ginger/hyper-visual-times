<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import NetworksData from '../../content/data/topics/networks.json';
	import type { clusterNodes, clusterLinks, renderedLinks } from '../../types';
	import { distance } from '../utils/actions.svelte';
	import { tick } from 'svelte';

	let { selectedCluster, switchView, selectedClusterColor } = $props();
	let width = $state(0);
	let height = $state(0);
	let clusterRadius = $derived(width / 2.2);
	let simulation;
	let currentNetworkData = $derived(
		NetworksData.filter((network) => {
			return selectedCluster[0].id === network.topic;
		})
	);
	let nodes = $derived(currentNetworkData[0].nodes);
	let links = $derived(currentNetworkData[0].links);

	let nodesForRender: clusterNodes[] = $state([]);
	let linksForRender: renderedLinks[] = $state([]);

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
			.range([2, 25])
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
			.force(
				'link',
				d3.forceLink(links).id((d: clusterLinks) => d.id)
			)
			.force('charge', d3.forceManyBody().strength(-250))
			.force(
				'collide',
				d3.forceCollide().radius((d: { size: number }) => radiusScale(d.size) + 5)
			)
			.force('x', d3.forceX())
			.force('y', d3.forceY())
			.on('tick', simulationUpdate);
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
		<svg {width} {height} viewBox={`-${width / 2}, ${-height / 2}, ${width}, ${height}`}>
			<g>
				{#each linksForRender as link}
					<line
						x1={link.source.x}
						x2={link.target.x}
						y1={link.source.y}
						y2={link.target.y}
						stroke="gray"
					/>
				{/each}
				{#each nodesForRender as node}
					<circle
						cx={node.x}
						cy={node.y}
						r={radiusScale(node.size)}
						stroke="black"
						fill={selectedClusterColor}
					/>
					{#if radiusScale(node.size) > 5}
						<text x={node.x + 10 + radiusScale(node.size) / 2} y={node.y + 2} font-size="10"
							>{node.id}</text
						>
					{/if}
				{/each}
			</g>
		</svg>
	{/await}
</div>
