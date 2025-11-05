<script>
	import ArticlesCard from '$lib/common/ArticlesCard.svelte';
	import translateMap from '../../content/data/images/translate_map.json';
	import BackwardButton from '$lib/common/BackwardButton.svelte';
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	let {selectedSource = $bindable(), selectedWeek, selectedPeople } = $props();
	let svg;
	let width = $state(0);
	let height = $state(0);
	let loaded = $state(false);
	let bubbles;
	let simulation;
	let scaleLog = d3
		.scaleLog()
		.domain(d3.extent(selectedPeople.map((p) => p.count)))
		.range([20, 80]);
	let data = $state([]);
	let selectedPerson = $state(null);
	let loading = $state(false);
	let selectedPeopleFixed = selectedPeople;
	let selectedWeekFixed = selectedWeek
	async function fetchArticlesForCards() {
		try {
			loading = true;
			const response = await fetch(
					`/api/articles?source=${selectedSource.toLocaleLowerCase()}&id=${selectedPerson.ids.join('&id=')}`
			);
			data = [...(await response.json())];
			loading = false;
		} catch (error) {
			console.log('Error in fetching articles inside fetchArticlesForCards', error);
		}
	}
	onMount(() => {
		svg = d3.select('#bubble-chart');
		svg
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
			.force('x', d3.forceX(width / 2.5).strength(0.2))
			.force('y', d3.forceY(height / 2).strength(0.5))
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
				event.target.setAttribute(
					'fill',
					`var(--color-${selectedSource.toLocaleLowerCase()}-light)`
				);
			})
			.on('mouseout', function (event, d) {
				event.target.setAttribute('fill', `var(--color-ivory-default)`);
			})
			.on('click', function (event, d) {
				event.stopPropagation();
				loading = true;
				selectedPerson = d;
				fetchArticlesForCards();
			});

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
	// auto update the chart on change of the dataset
	// $effect(() => {
	// 	if (selectedPeople && loaded) {
	// 		updateChart();
	// 	}
	// });
</script>

<div class="grid grid-cols-4 items-start justify-items-center gap-4 mt-4" bind:clientWidth={width} bind:clientHeight={height}>
	<div class="col-span-1 flex flex-col gap-4">
		<h2 class="font-serif text-xl">Exploration</h2>
		<img src="/img/bubblechart-legend.svg" class="" alt="" />
		<p class="mb-2">
			Please click on a bubble to explore the articles in which the respective person appeared in the selected week.
			
		</p>
		<div>
			<ArticlesCard articles={data} {selectedSource} selectedPerson={selectedPerson?.person} selectedDate={selectedPerson.date} {loading}>
				<div class="col-span-2">
					<b>{translateMap[selectedPerson.person] ?? selectedPerson.person}</b><br />
					Found in <u>{data.length == 0 ? '?' : data.length} articles</u>
				</div>
			</ArticlesCard>
		</div>
	</div>

	<div class="col-span-3">
			<div class="flex gap-2">
		<BackwardButton>Back to Overview</BackwardButton>
		<p>
			Detected and labeled <u>{selectedPeopleFixed.reduce((acc, p) => acc + p.count, 0)} faces</u> for the week
			<u
				>{new Date(selectedWeekFixed).toLocaleDateString('de')} - {new Date(
					new Date(selectedWeekFixed).getTime() + 7 * 24 * 60 * 60 * 1000
				).toLocaleDateString('de')}</u
			>
		</p>
	</div>
		<svg width = {width*0.75} height={height*1.15} id="bubble-chart" >
		<defs>
			<circle id="circle" cx="25%" cy="25%" r="15" />
			<clipPath id="clip">
				<use xlink:href="#circle" />
			</clipPath>
		</defs>
	</svg>
	</div>

</div>
