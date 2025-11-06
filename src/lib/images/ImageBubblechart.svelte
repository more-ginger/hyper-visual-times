<script>
	import ArticlesCard from '$lib/common/ArticlesCard.svelte';
	import translateMap from '../../content/data/images/translate_map.json';
	import BackwardButton from '$lib/common/BackwardButton.svelte';
	import totalDataNYT from '../../content/data/images/visual_mentions_per_person_and_week_nyt.json';
	import totalDataZeit from '../../content/data/images/visual_mentions_per_person_and_week_zeit.json';
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import { selectedOutlet } from '$lib/utils/state.images.svelte.ts';
	let {selectedWeek ='2024-01-01', selectedPeople= [] } = $props();
	let currentTotalDataset = $derived($selectedOutlet === 'NYT' ? totalDataNYT : totalDataZeit);
	let width = $state(0);
	let height = $state(0);
	let loaded = $state(false);
	let svg;
	let bubbles;
	let simulation;
	let scaleLog = d3
		.scaleLog()
		.domain(d3.extent(selectedPeople.map((p) => p.count)))
		.range([10, 70]);
	let selectedPerson = $state(null);
	let selectedPeopleFixed = selectedPeople;
	let selectedWeekFixed = selectedWeek;
	let selectedPersonIDs = $derived(
		selectedPeopleFixed.find((p) => p.person === selectedPerson?.person ?? '')?.ids ?? []
	);
	onMount(() => {
		svg = d3.select('#bubble-chart');
		bubbles = svg.selectAll('.bubble');
		loaded = true;
		updateChart();
	});
	function updateChart() {
		// Stop any running simulation
		if (simulation) simulation.stop();
		selectedPeople.map((p) => {
			p.x = width / 2 + Math.random() * 50 - 25;
			p.y = height / 2 + Math.random() * 50 - 25;
		});

		simulation = d3
			.forceSimulation(selectedPeople)
			.force('x', d3.forceX(width / 2.75).strength(0.1))
			.force('y', d3.forceY(height / 1.5).strength(0.3))
			.force('charge', d3.forceManyBody().strength(-50))
			.force(
				'collide',
				d3.forceCollide((d) => scaleLog(d.count) + 30)
			)
			.alphaDecay(0.05)
			.on('tick', ticked);

		bubbles = bubbles.data(
			selectedPeople.sort((a, b) => d3.ascending(a.count, b.count)),
			(d) => d.person + d.week
		);
		bubbles.exit().remove();

		const entered = bubbles.enter().append('g').attr('class', 'bubble').call(drag(simulation))

		entered
			.append('circle')
			.attr('r', (d) => scaleLog(d.count))
			.attr('stroke', 'black')
			.attr('fill', 'var(--color-ivory-default)')
			.attr('class', 'cursor-pointer')
			.attr('stroke-width', 1)
			.on('mouseover', function (event, d) {
				if (selectedPerson && selectedPerson.person == d.person) return;
				event.target.setAttribute(
					'fill',
					`var(--color-${$selectedOutlet.toLocaleLowerCase()}-light)`
				);
				event.target.parentNode.querySelector('.selection-bubble').setAttribute('opacity', 1);
			})
			.on('mouseout', function (event, d) {
				if (selectedPerson && selectedPerson.person == d.person) return;
				event.target.setAttribute('fill', `var(--color-ivory-default)`);
				event.target.parentNode.querySelector('.selection-bubble').setAttribute('opacity', 0);
			})
			.on('click', function (event, d) {
				if(selectedPerson && selectedPerson.person == d.person){
					//deselect
					d3.selectAll('.cursor-pointer').attr('fill', `var(--color-ivory-default)`);
					d3.selectAll('.selection-bubble').attr('opacity', 0);
					selectedPerson = null;
					event.stopPropagation();
					return;
				}
				event.stopPropagation();
				d3.selectAll('.cursor-pointer').attr('fill', `var(--color-ivory-default)`);
				d3.selectAll('.selection-bubble').attr('opacity', 0);
				event.target.parentNode.querySelector('.selection-bubble').setAttribute('opacity', 1);
				event.target.setAttribute(
					'fill',
					`var(--color-${$selectedOutlet.toLocaleLowerCase()}-default)`
				);
				event.stopPropagation();
				selectedPerson = d;
			});
		entered
			.append('circle')
			.attr('class', 'selection-bubble')
			.attr('r', d => scaleLog(d.count) + 5)
			.attr('fill', 'none')
			.attr('stroke', $selectedOutlet == 'NYT' ? 'var(--color-nyt-default)' : 'var(--color-zeit-default)')
			.attr('stroke-width', 1)
			.attr('cx', (d) => 0)
			.attr('cy', (d) => 0)
			.attr('opacity', 0);

		entered
			.append('image')
			.attr('xlink:href', (d) => `/img/people/${d.person}.webp`)
			.attr('width', (d) => scaleLog(d.count) * 2)
			.attr('height', (d) => scaleLog(d.count) * 2)
			.attr('x', (d) => -scaleLog(d.count))
			.attr('y', (d) => -scaleLog(d.count))
			.attr('class', 'pointer-events-none')
			.attr('clip-path', (d) => `circle(${scaleLog(d.count)}px at center)`);

		let pills = entered
			.append('foreignObject')
			.attr('y', (d) => scaleLog(d.count) + 3) // position below the bubble
			.attr('height', 30) // height of pill)
			.style('display', 'flex')
			.style('flex-direction', 'row');

		pills
			.append('xhtml:div') // HTML inside SVG
			.style('display', 'inline-block')
			.style('width', 'fit-content')
			.style('margin', 'auto')
			.style('padding', '4px 8px')
			.style('z-index', '10')
			.style('backdrop-filter', 'blur(5px)')
			.style('border', '1px solid #999')
			.style('border-radius', '9999px') // pill shape
			.style('font-weight', 'bold')
			.style('font-size', '10px')
			.style('text-align', 'center')
			.style('pointer-events', 'none') // prevent mouse events
			.text((d) => translateMap[d.person])
			.each(function (d) {
				// measure actual pill width after rendering
				const bb = this.getBoundingClientRect();
				d3.select(this.parentNode) // parent foreignObject
					.attr('width', bb.width * 2)
					.attr('x', -bb.width) // center under node
					.attr('y', scaleLog(d.count) + 3); // position below the bubble
			});

		bubbles = entered.merge(bubbles);

		function ticked() {
			bubbles.attr(
				'transform',
				(d) =>
					`translate(${Math.max(scaleLog(d.count), Math.min(width - scaleLog(d.count), d.x))}, ${Math.max(scaleLog(d.count), Math.min(height - scaleLog(d.count), d.y))})`
			);
		}
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
				d.fx = null;
				d.fy = null;

			}
			return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
		}
	}
</script>

<div class="grid grid-cols-10 items-start justify-items-center gap-4" bind:clientWidth={width} bind:clientHeight={height}>
	<div class="col-span-3 flex flex-col gap-4 p-6">
		<h2 class="font-serif text-xl">1.1 Visual Exploration</h2>
		<p>
			Here you can explore the detected faces for the week
			<span class="w-fit border rounded-full px-2">
				{new Date(selectedWeekFixed).toLocaleDateString('de')} - {new Date(
					new Date(selectedWeekFixed).getTime() + 7 * 24 * 60 * 60 * 1000
				).toLocaleDateString('de')} 
				</span>in total we have detected faces on <span class="w-fit border rounded-full px-2">{selectedPeopleFixed.reduce((acc, person) => acc + person.count, 0)} images</span>.
		</p>
		<img src="/img/images-bubblechart-legend.svg" class="mb-2" alt="" />
			<ArticlesCard ids={selectedPersonIDs}>
				<div class="col-span-2 text-center">
					<div class="col-span-2 flex">
						<span class="w-fit border rounded-full px-2 bg-[var(--color-ivory-default)] z-10 "><img class="inline mr-1 pb-px" src="icons/ui-interact.svg">{translateMap[selectedPerson?.person] ?? 'Selection'}</span><span class="border rounded-full px-3 py-px bg-black text-white pl-10 -ml-8 -z-2 pr-2" class:hidden={selectedPerson == null}>{currentTotalDataset.data[selectedPerson?.person]?.total ?? ''} Images</span>
					</div>
					<hr class="my-2">
					<div class="flex gap-2 items-start justify-start">
						<span class="border rounded-full px-3 py-px bg-[var(--color-ivory-default)] z-10" >This Week</span><span class="border rounded-full px-3 py-px bg-black text-white pl-8 -ml-8 -z-2 pr-2">{selectedPersonIDs.length == 0?'?':selectedPersonIDs.length} Images </span>
					</div>	
				</div>
			</ArticlesCard>
	</div>

	<div class="col-span-7 p-6">
			<div class="flex gap-2">
		<BackwardButton>Back to Overview</BackwardButton>
	</div>
		<svg width = {width*0.7} height={height*1.15} id="bubble-chart" >
		<defs>
			<circle id="circle" cx="25%" cy="25%" r="15" />
			<clipPath id="clip">
				<use xlink:href="#circle" />
			</clipPath>
		</defs>
	</svg>
	</div>

</div>
