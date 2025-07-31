<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import NetworksData from '../../content/data/topics/networks.json';
	import type { clusterNodes, clusterLinks, renderedLinks } from '../../types';
	import { distance } from '../utils/actions.svelte';

	let { selectedCluster, switchView, selectedClusterColor } = $props();
	let width = $state(0);
	let height = $state(0);
	let clusterRadius = $derived(width / 2.5);
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
					.id((d: clusterLinks) => d.id)
					.distance((d: clusterLinks) => d.value)
			)
			.force(
				'collide',
				d3
					.forceCollide()
					.radius((d: clusterNodes) => radiusScale(d.size) + 5)
					.strength(10)
					.iterations(1)
			)
			.force('center', d3.forceCenter(width / 2, height / 2))
			.force('bounding', () => {
				nodes.forEach((node: cluster) => {
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
		<svg {width} {height}>
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
					<circle
						cx={node.x}
						cy={node.y}
						r={radiusScale(node.size)}
						stroke="black"
						fill={selectedClusterColor}
					/>
				{/each}
			</g>
		</svg>
	{/await}
</div>
