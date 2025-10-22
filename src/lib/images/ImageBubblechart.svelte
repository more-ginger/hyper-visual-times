<script>
	import ArticlesCard from '$lib/common/ArticlesCard.svelte';
	import translateCard from '../../content/data/images/translate_map.json';
	import BackwardButton from '$lib/common/BackwardButton.svelte';
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	let { steamgraph = $bindable(), selectedWeek, width, height, people, currentSource } = $props();
	let svg;
	let loaded = $state(false);
	let bubbles;
	let simulation;
	let scaleLog = d3
		.scaleLinear()
		.domain(d3.extent(people.map((p) => p.count)))
		.range([width/100, width/10]);
	let data = $state([]);
	let totalCounts = $state(0);
	let selectedPerson = $state(null);
	let selectedDate = $state(null);
	let loading = $state(false);
	onMount(async () => {
		try {
			const response = await fetch(
				`/api/articles/date?source=${currentSource.toLocaleLowerCase()}&date=${d3.utcFormat('%Y-%m-%d')(selectedWeek)}`
			);
			const result = await response.json();
			console.log('fetching total counts for date:', result);
			totalCounts = result.length;
			loading = false
		} catch (error) {
			console.log('Error in fetching total counts inside fetchTotalCounts', error);
		}
	});
	async function fetchArticlesForCards(event) {
		try {
			loading = true;
			const response = await fetch(
				`/api/articles/date?source=${currentSource.toLocaleLowerCase()}&person=${selectedPerson}&date=${d3.utcFormat('%Y-%m-%d')(selectedDate)}`
			);
			data = [...(await response.json())];
			loading = false;
		} catch (error) {
			console.log('Error in fetching articles inside fetchArticlesForCards', error);
		}
	}
	onMount(() => {
		console.log(people);
		svg = d3.select('#bubble-chart');
		bubbles = svg.selectAll('.bubble');
		loaded = true;
		updateChart();
	});
	function updateChart() {
		// Stop any running simulation
		if (simulation) simulation.stop();
		people.map((p) => {
			p.x = width / 3.5;
			p.y = height / 2;
		});

		simulation = d3
			.forceSimulation(people)
			.force('x', d3.forceX(width / 3.5).strength(0.25))
			.force('y', d3.forceY(height / 2).strength(0.25))
			.force(
				'collide',
				d3.forceCollide((d) => scaleLog(d.count) + 25)
			)
			.alphaDecay(0.05)
			.on('tick', ticked);

		bubbles = bubbles.data(
			people.sort((a, b) => d3.ascending(a.count, b.count)),
			(d) => d.person + d.week
		);
		bubbles.exit().remove();

		const entered = bubbles.enter().append('g').attr('class', 'bubble');

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
				selectedPerson = d.person;
				selectedDate = d.week;
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
			.style('backdrop-filter', 'blur(5px)')
			.style('border', '1px solid #999')
			.style('border-radius', '9999px') // pill shape
			.style('font-weight', 'bold')
			.style('font-size', '10px')
			.style('text-align', 'left')
			.style('pointer-events', 'none') // prevent mouse events
			.text((d) => translateCard[d.person])
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
			bubbles.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
		}
	}
	// auto update the chart on change of the dataset
	$effect(() => {
		if (people && loaded) {
			updateChart();
		}
	});
</script>

<div class="flex gap-2">
	<BackwardButton bind:back={steamgraph}>Back to Overview</BackwardButton>
	<p>
		Detected <u>{people.reduce((acc, p) => acc + p.count, 0)} faces</u> across
		<u>{totalCounts == 0 ? '?' : totalCounts} articles</u>
		between
		<u
			>{new Date(selectedWeek).toLocaleDateString('de')} - {new Date(
				new Date(selectedWeek).getTime() + 7 * 24 * 60 * 60 * 1000
			).toLocaleDateString('de')}</u
		>
	</p>
</div>
<div class="grid grid-cols-5 items-center justify-items-center gap-4">
	<svg width={width/1.5} {height} id="bubble-chart" class="col-span-3">
		<defs>
			<circle id="circle" cx="25%" cy="25%" r="15" />
			<clipPath id="clip">
				<use xlink:href="#circle" />
			</clipPath>
		</defs>
	</svg>
	<div class="col-span-2">
		<ArticlesCard articles={data} {currentSource} {selectedPerson} {selectedDate} {loading} />
	</div>
</div>
