<script lang="ts">
	import { onMount } from 'svelte';
	// @ts-expect-error
	import * as d3 from 'd3';
	import NetworksData from '../../content/data/topics/networks.json';
	import type { clusterNodes, clusterLinks, renderedLinks } from '../../types';
	import NetworkLabel from './NetworkLabel.svelte';

	let { selectedCluster, switchView, selectedClusterColor } = $props();
	let width = $state(0);
	let height = $state(0);
	let label: string | null = $state(null);
	let simulation;
	let currentNetworkData = $derived(
		NetworksData.filter((network) => {
			return selectedCluster[0].id === network.topic;
		})
	);
	let nodes = $derived(currentNetworkData[0].nodes);
	let links = $derived(currentNetworkData[0].links);
	let circleRefs = $state({});

	let nodesExtent = $derived(
		d3.extent(
			nodes.map((d) => {
				return d.size;
			})
		)
	);

	let mean = $derived(
		d3.mean(
			nodes.map((d) => {
				return d.size;
			})
		)
	);

	function handleMouseOver(id: string) {
		label = id;
	}

	let nodesForRender: clusterNodes[] = $state([]);
	let linksForRender: renderedLinks[] = $state([]);

	const radiusScale = $derived(d3.scaleLinear().domain(nodesExtent).range([2, 25]));

	function handleClusterReset() {
		switchView({
			selectionIsActive: true,
			networkIsActive: false
		});
	}

	function simulationUpdate() {
		nodesForRender = nodes;
		linksForRender = links;
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

		const drag = d3.drag<SVGCircleElement, clusterNodes>().on('start', onStart).on('drag', onDrag);
		// .on('end', onEnd);

		nodes.forEach((node) => {
			const el = circleRefs[node.id];
			$inspect(el);
			if (el) {
				console.log('!');
				d3.select(el).datum(node).call(drag);
			}
		});
	});

	onMount(() => {});

	function onStart(event: any, d: clusterNodes) {
		if (!event.active) simulation.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}

	function onDrag(event: any, d: clusterNodes) {
		d.fx = clamp(event.x, -width, width);
		d.fy = clamp(event.y, -height, height);
		simulation.alpha(1).restart();
	}

	function onEnd(event: any, d: clusterNodes) {
		if (!event.active) simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	}

	function clamp(x, lo, hi) {
		return x < lo ? lo : x > hi ? hi : x;
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
				{#each nodesForRender as node, n (node.id)}
					<circle
						onmouseover={() => {
							handleMouseOver(node.id);
						}}
						cx={node.x}
						cy={node.y}
						r={radiusScale(node.size) + 10}
						stroke={label === node.id ? selectedClusterColor : 'none'}
						fill="transparent"
					/>
					<circle
						cx={node.x}
						cy={node.y}
						r={radiusScale(node.size)}
						stroke="black"
						fill={selectedClusterColor}
						bind:this={circleRefs[node.id]}
					/>
					<NetworkLabel {node} {radiusScale} {mean} {label} />
				{/each}
			</g>
		</svg>
	{/await}
</div>
