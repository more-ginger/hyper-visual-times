<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import translateMap from '../../content/data/images/translate_map.json';
	import ArticlesCard from '$lib/common/ArticlesCard.svelte';
	import {
		selectedOutlet,
		currentCoappearanceDataset,
		currentVisualMentionsDataset,
		currentColorDefault
	} from '$lib/utils/state.images.svelte.ts';
	//props
	//setup for the steamgraph svg
	let newsDesksFix = $state([]);
	let svg;
	let width = $state(0);
	let height = $state(0);
	let widthDerived = $derived(width * 0.66);
	let loaded = $state(false);
	let loading = $state(false);
	let nodes;
	let links;
	let selection1 = $state(null);
	let selection2 = $state(null);
	let simulation = null;
	let selectedPairIDs = $state([]);
	$effect(() => {
		if (selection1 !== null && selection2 !== null) {
			selectedPairIDs =
				$currentCoappearanceDataset.find(
					(d) =>
						(d.personA === selection1 && d.personB === selection2) ||
						(d.personA === selection2 && d.personB === selection1)
				)?.ids ?? [];
		}
	});
	onMount(() => {
		svg = d3.select('#network-graph');
		nodes = svg.selectAll('.nodes');
		loaded = true;
		// Start with no bubbles shown
		updateChart();
	});
	function updateChart() {
		const nodesMap = new Map();
		$currentCoappearanceDataset.forEach((d) => {
			if (!nodesMap.has(d.personA)) nodesMap.set(d.personA, { id: d.personA });
			if (!nodesMap.has(d.personB)) nodesMap.set(d.personB, { id: d.personB });
		});
		const nodesData = Array.from(nodesMap.values());

		// Expand into individual lines per news_desk per coappearance count
		const expandedLinks = [];
		$currentCoappearanceDataset.forEach((d) => {
			let total = 0;
			let i = 0;
			Object.entries(d.news_desks).forEach(([desk, count]) => {
				total += count;
			});
			Object.entries(d.news_desks).forEach(([desk, count]) => {
				// Create a separate array for this pair + news desk
				const lines = Array.from({ length: count }, (_, j) => ({
					source: d.personA,
					target: d.personB,
					news_desk: desk,
					localTotal: count,
					localIndex: i++, // local index per pair
					total
				}));
				expandedLinks.push(...lines);
			});
		});
		const newsDesks = Array.from(new Set(expandedLinks.map((d) => d.news_desk)));
		const color = d3.scaleOrdinal(newsDesks, d3.schemeTableau10);
		newsDesksFix = [...newsDesks];

		// --- Force simulation ---
		if (simulation) {
			simulation.stop();
		}
		simulation = d3
			.forceSimulation(nodesData)
			.force(
				'link',
				d3
					.forceLink(expandedLinks)
					.id((d) => d.id)
					.distance((d) => width / 3 / d.total)
			)
			.force('charge', d3.forceManyBody().strength(-400))
			.force('x', d3.forceX(widthDerived / 2).strength(0.2))
			.force('y', d3.forceY(height / 2).strength(0.5))
			.force('collision', d3.forceCollide().radius(50));

		// --- Draw links (balanced curved lines per pair) ---
		svg.selectAll('path').remove();
		svg.selectAll('.nodes').remove();
		links = svg.selectAll('path').data(expandedLinks);
		links.exit().remove();
		const linksEnter = links
			.enter()
			.append('path')
			.attr('class', 'link-curve')
			.attr('fill', 'none')
			.attr('stroke-width', 1)
			.attr('stroke-opacity', 0);

		// --- Draw nodes ---
		nodes = svg.selectAll('.nodes').data(nodesData);
		nodes.exit().remove();
		const nodesEnter = nodes
			.enter()
			.append('g')
			.attr('class', 'nodes')
			.attr('transform', (d) => `translate(${width / 2}, ${height / 2})`)
			.call(drag(simulation));

		nodesEnter
			.append('circle')
			.attr('r', 20)
			.attr('stroke', 'black')
			.attr('class', 'node-circle')
			.attr('fill', 'var(--color-ivory-default)')
			.attr('class', 'cursor-pointer')
			.attr('stroke-width', 1)
			.on('mouseover', function (event, d) {
				if (selection1 != d.id && selection2 != d.id) {
					event.target.setAttribute(
						'fill',
						`var(--color-${$selectedOutlet.toLocaleLowerCase()}-light)`
					);
				}
				event.target.parentNode.querySelector('.selection-bubble').setAttribute('opacity', 1);
			})
			.on('mouseout', function (event, d) {
				if (selection1 != d.id && selection2 != d.id) {
					event.target.setAttribute('fill', `var(--color-ivory-default)`);
				}
				event.target.parentNode.querySelector('.selection-bubble').setAttribute('opacity', 0);
			})
			.on('click', (event, d) => {
				if (selection1 === null) {
					selection1 = d.id;
				} else if (selection2 === null && selection1 !== d.id) {
					selection2 = d.id;
				} else if (selection1 === d.id || selection2 === d.id) {
					selection1 = null;
					selection2 = null;
					if (!loading) {
						selectedPairIDs = [];
					}
				}
			});

		nodesEnter
			.append('circle')
			.attr('class', 'selection-bubble')
			.attr('r', 25)
			.attr('fill', 'none')
			.attr('stroke-width', 1)
			.attr('cx', (d) => 0)
			.attr('cy', (d) => 0)
			.attr('opacity', 0);

		nodesEnter
			.append('image')
			.attr('width', 40)
			.attr('height', 40)
			.attr('x', -20)
			.attr('y', -20)
			.attr('class', 'pointer-events-none')
			.attr('clip-path', `circle(${20}px at center)`);

		let pills = nodesEnter
			.append('foreignObject')
			.attr('y', 23) // position below the bubble
			.attr('height', 30) // height of pill)
			.style('display', 'flex')
			.style('flex-direction', 'row');

		pills
			.append('xhtml:div') // HTML inside SVG
			.style('display', 'inline-block')
			.style('width', 'fit-content')
			.style('margin', 'auto')
			.style('padding', '4px 8px')
			.style('backdrop-filter', 'blur(5px)')
			.style('border', '1px solid #999')
			.style('border-radius', '9999px') // pill shape
			.style('font-weight', 'bold')
			.style('font-size', '10px')
			.style('text-align', 'left')
			.style('pointer-events', 'none') // prevent mouse events
			.text((d) => translateMap[d.id])
			.each(function (d) {
				// measure actual pill width after rendering
				const bb = this.getBoundingClientRect();
				d3.select(this.parentNode) // parent foreignObject
					.attr('width', bb.width * 2)
					.attr('x', -bb.width) // center under node
					.attr('y', 23); // position below the bubble
			});

		nodes = nodesEnter.merge(nodes);
		links = linksEnter.merge(links);

		simulation.on('tick', () => {
			links
				.attr('stroke', (d) => {
					if (selection1 == null || selection2 == null) {
						return $currentColorDefault;
					} else if (
						selection1 != null &&
						selection2 != null &&
						(d.source.id === selection1 || d.source.id === selection2) &&
						(d.target.id === selection1 || d.target.id === selection2)
					) {
						return color(d.news_desk);
					}
				})
				.attr('stroke-opacity', (d) => {
					if (selection1 == null && selection2 == null) {
						return 1;
					} else if (
						((selection1 != null && selection2 == null) ||
							(selection2 != null && selection1 == null)) &&
						d.source.id !== selection1 &&
						d.target.id !== selection2 &&
						d.source.id !== selection2 &&
						d.target.id !== selection1
					) {
						return 0.05;
					} else if (
						selection1 != null &&
						selection2 != null &&
						d.source.id !== selection1 &&
						d.source.id !== selection2 &&
						d.target.id !== selection1 &&
						d.target.id !== selection2
					) {
						return 0;
					}
				})
				.attr('stroke-width', (d) => {
					if (selection1 == null || selection2 == null) {
						return d.total * 0.2;
					} else {
						return 0.5;
					}
				})
				.attr('d', (d, i) => {
					const sx = d.source.x,
						sy = d.source.y;
					const tx = d.target.x,
						ty = d.target.y;
					if (selection1 == null || selection2 == null) {
						if (d.localIndex == 0) {
							return `M${sx},${sy} L${tx},${ty}`;
						} else {
							return `M0,0 L0,0`;
						}
					} else {
						// Midpoint between the two nodes
						const midX = (sx + tx) / 2;
						const midY = (sy + ty) / 2;

						// Vector from source to target
						const dx = tx - sx;
						const dy = ty - sy;
						const len = Math.sqrt(dx * dx + dy * dy);

						// Perpendicular normalized vector
						const normX = -dy / len;
						const normY = dx / len;

						// Balanced curvature that resets per pair
						const step = Math.abs(d.localIndex + 1 - (d.total + 1) / 2);
						const direction = (d.localIndex + 1) / d.total <= 0.5 ? 1 : -1;
						const curvature = step * 10; // curvature strength for each side

						const controlX = midX + normX * curvature * direction;
						const controlY = midY + normY * curvature * direction;

						// Draw quadratic Bézier curve
						return `M${sx},${sy} Q${controlX},${controlY} ${tx},${ty}`;
					}
				});
			nodes
				.select('div')
				.text((d) => translateMap[d.id])
				.each(function (d) {
					// measure actual pill width after rendering
					const bb = this.getBoundingClientRect();
					d3.select(this.parentNode) // parent foreignObject
						.attr('width', bb.width)
						.attr('x', -bb.width / 2) // center under node
						.attr('y', 23); // position below the bubble
				});
			nodes.select('.node-circle').attr('fill', 'var(--color-ivory-default)');
			nodes.select('.selection-bubble').attr('stroke', $currentColorDefault);
			nodes
				.attr('transform', (d) => `translate(${d.x},${d.y})`)
				.attr('opacity', (d) => {
					if (selection1 == null || selection2 == null) {
						return 1;
					} else if (
						selection1 != null &&
						selection2 != null &&
						(d.id === selection1 || d.id === selection2)
					) {
						return 1;
					} else {
						return 0.05;
					}
				});

			nodes.select('circle').attr('fill', (d) => {
				if (d.id === selection1 || d.id === selection2) {
					return $currentColorDefault;
				} else {
					return 'var(--color-ivory-default)';
				}
			});

			nodes.select('image').attr('xlink:href', (d) => `/img/people/${d.id}.webp`);
		});

		// --- Dragging behavior ---
		function drag(simulation) {
			function dragstarted(event, d) {
				if (!event.active) simulation.alphaTarget(0.3).restart();
				d.fx = d.x;
				d.fy = d.y;
			}
			function dragged(event, d) {
				d.fx = event.x;
				d.fy = event.y;
			}
			function dragended(event, d) {
				if (!event.active) simulation.alphaTarget(0);
			}
			return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
		}
	}
	// auto update the chart on change of the dataset
	$effect(() => {
		if ($selectedOutlet && loaded) {
			updateChart();
		}
	});
</script>

<div class="grid h-full w-full grid-cols-3" bind:clientWidth={width} bind:clientHeight={height}>
	<svg class="col-span-2" width={widthDerived} {height} id="network-graph"> </svg>
	<div class="col-span-1 flex flex-col items-center gap-4">
		<h2 class="font-serif text-xl">2. Visual Coappearances</h2>
		<img src="img/images-networkgraph-legend.svg" class="my-2" alt="" />
		<ArticlesCard ids={selectedPairIDs} newsDesks={newsDesksFix}>
			<div class="col-span-2 text-center">
				<div class="flex flex flex-wrap gap-2">
					<div class="flex">
						<span class="w-fit rounded-full border bg-[var(--color-ivory-default)] px-2"
							><img class="mr-1 inline pb-px" src="icons/ui-interact.svg" />{translateMap[
								selection1
							] ?? 'Selection 1'}</span
						><span
							class="-z-2 -ml-8 rounded-full border bg-black px-3 py-px pr-2 pl-10 text-white"
							class:hidden={selection1 == null}
							>{$currentVisualMentionsDataset.data[selection1]?.total ?? ''} Images</span
						>
					</div>
					<div class="flex">
						<span class="w-fit rounded-full border bg-[var(--color-ivory-default)] px-2"
							><img class="mr-1 inline pb-px" src="icons/ui-interact.svg" />{translateMap[
								selection2
							] ?? 'Selection 2'}</span
						><span
							class="-z-2 -ml-8 rounded-full border bg-black px-3 py-px pr-2 pl-10 text-white"
							class:hidden={selection2 == null}
							>{$currentVisualMentionsDataset.data[selection2]?.total ?? ''} Images</span
						>
					</div>
				</div>
				<hr class="my-2" />
				<div class="flex items-start justify-start gap-2">
					<span class="z-10 rounded-full border bg-[var(--color-ivory-default)] px-3 py-px"
						>Depicted Together</span
					><span class="-z-2 -ml-8 rounded-full border bg-black px-3 py-px pr-2 pl-8 text-white"
						>{selectedPairIDs.length == 0 ? '?' : selectedPairIDs.length} Images</span
					>
				</div>
			</div>
		</ArticlesCard>
	</div>
</div>
