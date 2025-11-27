<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import { clamp } from '../utils/actions.svelte';
	import NetworksData from '../../content/data/topics/networks.json';
	import type { clusterNodes, clusterLinks, renderedLinks } from '../../types';
	import NetworkLabel from './NetworkLabel.svelte';
	import { LinkHandler } from '$lib/utils/pathhelper.svelte';

	let {
		selectedCluster,
		switchView,
		selectedClusterColor,
		selectNewNodesPair,
		selectOverlappingArticleIds
	} = $props();
	let simulation: d3.Simulation<clusterNodes, undefined>;

	// reactive state
	let width = $state(0);
	let height = $state(0);
	let label: string | null = $state(null);
	let nodesForRender: clusterNodes[] = $state([]);
	let linksForRender: renderedLinks[] = $state([]);
	let circleRefs: { [key: string]: SVGCircleElement | null } = $state({});
	let activeNodeIndex: number | null = $state(null);
	let arrayOfActiveNodes: string[] = $state([]);
	////
	////
	// derived variables
	let currentNetworkData = $derived(
		NetworksData.filter((network) => {
			return selectedCluster[0].id === network.topic;
		})
	);

	let nodes = $derived(currentNetworkData[0].nodes);
	let links = $derived(currentNetworkData[0].links);

	let nodesExtent = $derived(
		d3.extent(
			nodes.map((d) => {
				return d.size;
			})
		)
	);

	const radiusScale = $derived(d3.scaleLinear().domain(nodesExtent).range([2, 25]));

	let mean = $derived(
		d3.mean(
			nodes.map((d) => {
				return d.size;
			})
		)
	);
	////
	// Init and run simulation and network related business
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

		nodes.forEach((node) => {
			const el = circleRefs[node.id];
			if (el) {
				d3.select(el).datum(node).call(drag);
			}
		});
	});
	////
	// Simulation update and interactivity
	function simulationUpdate() {
		nodesForRender = nodes;
		linksForRender = links;
	}

	function onStart(event: any, d: clusterNodes) {
		if (!event.active) simulation.alphaTarget(0).restart();
		d.fx = d.x;
		d.fy = d.y;
	}

	function onDrag(event: any, d: clusterNodes) {
		d.fx = clamp(event.x, -width, width);
		d.fy = clamp(event.y, -height, height);
		simulation.alpha(1).restart();
	}
	////
	// User interactivity on nodes and UI
	function handleMouseOver(id: string) {
		label = id;
	}

	function handleClusterReset() {
		switchView({
			selectionIsActive: true,
			networkIsActive: false
		});

		selectOverlappingArticleIds({
			selectedIds: []
		});
	}

	function handleNodeSelection(id: string, i: number) {
		//arrayOfActiveNodes.push(id);
		if (i && !arrayOfActiveNodes.includes(id)) {
			if (arrayOfActiveNodes.length < 2) {
				arrayOfActiveNodes.push(id);
			} else {
				arrayOfActiveNodes = [];
				arrayOfActiveNodes.push(id);
			}
		}

		if (arrayOfActiveNodes.length === 2) {
			const selectedLink = checkOverlappingArticles(arrayOfActiveNodes);
			if (selectedLink && selectedLink.length !== 0) {
				selectOverlappingArticleIds({
					selectedIds: selectedLink?.shared_articles
				});
			} else {
				selectOverlappingArticleIds({
					selectedIds: []
				});
			}
		}

		selectNewNodesPair({
			arrayOfActiveNodes
		});

		activeNodeIndex = i;
	}

	function checkOverlappingArticles(nodeIds: string[]) {
		return links.find((l) => nodeIds.includes(l.source.id) && nodeIds.includes(l.target.id));
	}

	function areLinksActive(sourceId: string, targetId: string) {
		const activeLinksIds = [sourceId, targetId];
		if (arrayOfActiveNodes.length == 2) {
			return activeLinksIds.every((el) => arrayOfActiveNodes.includes(el));
		} else if (arrayOfActiveNodes.length < 2) {
			return activeLinksIds.some((el) => arrayOfActiveNodes.includes(el));
		} else {
			return false;
		}
	}
</script>

<div class="h-full w-full" bind:clientWidth={width} bind:clientHeight={height}>
	<div class="absolute m-2">
		<button
			class="flex"
			onclick={() => {
				handleClusterReset();
			}}
			><span class="mr-2 -rotate-180"
				><img
					src={LinkHandler("/icons/ui-forward.svg")}
					class="inline-block align-middle pb-1"
					alt="arrow back"
				/></span
			> Back to clusters</button
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
						stroke={areLinksActive(link.source.id, link.target.id) ? selectedClusterColor : 'grey'}
						stroke-width={areLinksActive(link.source.id, link.target.id) ? 2 : 0.5}
					/>
				{/each}
				{#each nodesForRender as node, n (node.id)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<g
						role="button"
						tabindex="0"
						onfocus={() => {
							handleNodeSelection(node.id, n);
						}}
						onclick={() => {
							handleNodeSelection(node.id, n);
						}}
					>
						<circle
							role="button"
							tabindex="0"
							onfocus={() => {
								handleMouseOver(node.id);
							}}
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
							fill={arrayOfActiveNodes.includes(node.id) || arrayOfActiveNodes.length === 0
								? selectedClusterColor
								: 'white'}
							bind:this={circleRefs[node.id]}
						/>
					</g>
				{/each}
				{#each nodesForRender as node, n (node.id)}
					<NetworkLabel {node} {radiusScale} {mean} {label} />
				{/each}
			</g>
		</svg>
	{/await}
</div>
