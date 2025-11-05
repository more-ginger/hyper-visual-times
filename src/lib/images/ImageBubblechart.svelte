<script>
	import ArticlesCard from '$lib/common/ArticlesCard.svelte';
	import translateMap from '../../content/data/images/translate_map.json';
	import BackwardButton from '$lib/common/BackwardButton.svelte';
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	let { steamgraph = $bindable(), selectedWeek, width, height, people, currentSource } = $props();
	let svg;
	let loaded = $state(false);
	let bubbles;
	let simulation;
	let scaleLog = d3
		.scaleLog()
		.domain(d3.extent(people.map((p) => p.count)))
		.range([10, 60]);
	let data = $state([]);
	let selectedPerson = $state(null);
	let loading = $state(false);
	let peopleFixed = people;
	let selectedWeekFixed = selectedWeek
	async function fetchArticlesForCards() {
		try {
			loading = true;
			const response = await fetch(
					`/api/articles?source=${currentSource.toLocaleLowerCase()}&id=${selectedPerson.ids.join('&id=')}`
			);
			data = [...(await response.json())];
			loading = false;
		} catch (error) {
			console.log('Error in fetching articles inside fetchArticlesForCards', error);
		}
	}
	onMount(() => {
		svg = d3.select('#bubble-chart');
		bubbles = svg.selectAll('.bubble');
		loaded = true;
		updateChart();
	});
	function updateChart() {
		// Stop any running simulation
		if (simulation) simulation.stop();
		people.map((p) => {
			p.x = width / 3;
			p.y = height / 2;
		});

		simulation = d3
			.forceSimulation(people)
			.force('x', d3.forceX(width / 3).strength(0.1))
			.force('y', d3.forceY(height / 2).strength(0.1))
			.force(
				'collide',
				d3.forceCollide((d) => scaleLog(d.count) + 30)
			)
			.alphaDecay(0.05)
			.on('tick', ticked);

		bubbles = bubbles.data(
			people.sort((a, b) => d3.ascending(a.count, b.count)),
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
					`var(--color-${currentSource.toLocaleLowerCase()}-light)`
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
	// 	if (people && loaded) {
	// 		updateChart();
	// 	}
	// });
</script>

<div class="flex gap-2">
	<BackwardButton bind:back={steamgraph}>Back to Overview</BackwardButton>
	<p>
		Detected and labeled <u>{peopleFixed.reduce((acc, p) => acc + p.count, 0)} faces</u> for the week
		<u
			>{new Date(selectedWeekFixed).toLocaleDateString('de')} - {new Date(
				new Date(selectedWeekFixed).getTime() + 7 * 24 * 60 * 60 * 1000
			).toLocaleDateString('de')}</u
		>
	</p>
</div>
<div class="grid grid-cols-5 items-start justify-items-center gap-4 mt-4">
	<div class="col-span-3 relative">
		<svg width={width / 1.5} {height} id="bubble-chart" >
		<defs>
			<circle id="circle" cx="25%" cy="25%" r="15" />
			<clipPath id="clip">
				<use xlink:href="#circle" />
			</clipPath>
		</defs>
	</svg>
	</div>
	<div class="col-span-2 flex flex-col items-center gap-4">
		<img src="/img/bubblechart-legend.svg" alt="" />
		<div>
			<ArticlesCard articles={data} {currentSource} selectedPerson={selectedPerson?.person} selectedDate={selectedPerson.date} {loading}>
				<div class="col-span-2">
					<b>{translateMap[selectedPerson.person] ?? selectedPerson.person}</b><br />
					Found in <u>{data.length == 0 ? '?' : data.length} articles</u>
				</div>
			</ArticlesCard>
		</div>
	</div>
</div>
