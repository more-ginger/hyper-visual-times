<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import translateMap from '../../content/data/images/translate_map.json';
	import dataNYT from '../../content/data/images/visual_mentions_per_person_and_week_nyt.json';
	import dataZeit from '../../content/data/images/visual_mentions_per_person_and_week_zeit.json';
	import { selectedView } from '$lib/utils/state.images.svelte.ts';
	//props
	let {selectedSource, selectedWeek = $bindable(), selectedPeople = $bindable() } = $props();
	//setup for the steamgraph svg
	let svg;
	let xScale;
	let yScale;
	let axisGenerator;
	let xAxisDescriptor;
	let yAxisDescriptor;
	let tooltip;
	let bubbles;
	let simulation;
	let width = $state(0);
	let height = $state(0);
	let heightDerived = $derived(height * 0.75);
	let loaded = $state(false);
	let margin = { top: 20, right: 40, bottom: 130, left: 40 };
	let diagramInnerHeight = $derived(heightDerived - margin.top - margin.bottom);
	let diagramCenterY = $derived(diagramInnerHeight / 2);
	let circleRadius = 10;
	function togglePerson(event) {
		let person = event.target.dataset.person;
		if (selectedPeople.includes(person)) {
			selectedPeople = selectedPeople.filter((p) => p != person);
		} else {
			selectedPeople = [...selectedPeople, person];
		}
	}
	let currentDataset = $derived(selectedSource == 'NYT' ? dataNYT : dataZeit);
	let peopleOrdered = $derived(
		Object.keys(currentDataset.data).sort(
			(a, b) => currentDataset.data[b].total - currentDataset.data[a].total
		)
	);
	let peopleData = $derived(
		peopleOrdered
			.map((person) => {
				let entries = [];
				Object.entries(currentDataset.data[person].timeframe).forEach(([week, ids]) => {
					entries.push({
						person: person,
						week: new Date(week.slice(0, 10)), // Convert to Date object
						count: ids.length,
						ids
					});
				});
				return entries;
			})
			.flat()
	);
	$effect(() => {
		if (peopleOrdered) {
			selectedPeople = [...peopleOrdered];
		}
	});
	//dataset setup
	onMount(() => {
		svg = d3.select('#steamgraph-chart');
		bubbles = svg.selectAll('.bubble');
		d3.selectAll('.tooltip-streamgraph').remove();

		tooltip = d3
			.select('body')
			.append('div')
			.attr('class', 'tooltip-streamgraph')
			.style('opacity', 0)
			.style('position', 'absolute')
			.style('text-align', 'left')
			.style('width', 'auto')
			.style('height', 'auto')
			.style('padding', '8px')
			.style('font-size', '10px')
			.style('background', 'rgba(255,255,255,0.75)')
			.style('box-shadow', '0px 0px 6px #aaa')
			.style('backdrop-filter', 'blur(5px)')
			.style('border', '0px')
			.style('border-radius', '8px')
			.style('pointer-events', 'none');
		yScale = d3
			.scaleLinear()
			.domain([0, d3.max(peopleData, (d) => d.count)])
			.range([5, 100]);
		// Scales
		xScale = d3
			.scaleTime()
			.domain([new Date('2024-01-01'), new Date('2024-12-31')])
			.range([margin.left, width - margin.right]);
		// Axes
		axisGenerator = d3
			.axisBottom(xScale)
			.tickValues([
				new Date('2024-01-01'),
				new Date('2024-04-01'),
				new Date('2024-07-01'),
				new Date('2024-10-01'),
				new Date('2024-12-31')
			])
			.tickFormat((d, i) => d3.utcFormat('%B')(d));
		xAxisDescriptor = svg.append('g');
		xAxisDescriptor
			.append('path')
			.attr(
				'd',
				`M${margin.left + width - margin.right - 125},${heightDerived - margin.bottom + 30} L${margin.left + width - margin.right - 15},${heightDerived - margin.bottom + 30}`
			)
			.attr('stroke', 'black')
			.attr('stroke-width', 0.5)
			.attr('marker-end', 'url(#arrowhead)');

		xAxisDescriptor
			.append('text')
			.attr('x', margin.left + width - margin.right - 125)
			.attr('y', heightDerived - margin.bottom + 40)
			.attr('text-anchor', 'start')
			.attr('font-size', '10')
			.text('Time');

		yAxisDescriptor = svg
			.append('g')
			.attr('transform', `rotate(-90 ${margin.left} ${diagramCenterY})`);

		yAxisDescriptor
			.append('path')
			.attr(
				'd',
				`M${margin.left - 70},${diagramCenterY - 25} L${margin.left + 70},${diagramCenterY - 25}`
			)
			.attr('stroke', 'black')
			.attr('stroke-width', 0.5)
			.attr('marker-end', 'url(#arrowhead)')
			.attr('marker-start', 'url(#arrowhead-reverse)');

		yAxisDescriptor
			.append('text')
			.attr('x', margin.left - 55)
			.attr('y', diagramCenterY - 30)
			.attr('text-anchor', 'center')
			.attr('font-size', '10')
			.text('Amount of detected Faces');
		svg
			.append('g')
			.attr('class', 'axis')
			.attr('transform', `translate(0,${heightDerived - margin.bottom})`)
			.call(axisGenerator)
			.call((g) => g.select('.domain').remove())
			.call((g) =>
				g
					.selectAll('.tick line')
					.attr('opacity', 0.5)
					.attr('stroke-width', 0.5)
					.attr('stroke-dasharray', '5,5')
					.attr('y2', -heightDerived + margin.top + margin.bottom)
			);

		svg
			.append('text')
			.attr('id', 'year-label')
			.attr('x', margin.left)
			.attr('y', heightDerived - margin.bottom + 35)
			.attr('text-anchor', 'middle')
			.attr('font-size', '10')
			.text('2024');
		window.addEventListener('resize', () => {
			console.log(width);
			xScale = d3
				.scaleTime()
				.domain([new Date('2024-01-01'), new Date('2024-12-31')])
				.range([margin.left, width - margin.right]);

			svg
				.select('.axis')
				.attr('transform', `translate(5,${heightDerived - margin.bottom})`)
				.call(axisGenerator)
				.call((g) => g.select('.domain').remove())
				.call((g) =>
					g
						.selectAll('.tick line')
						.attr('opacity', 0.5)
						.attr('stroke-width', 0.5)
						.attr('stroke-dasharray', '5,5')
						.attr('y2', -heightDerived + margin.top + margin.bottom)
				);
			xAxisDescriptor
				.select('path')
				.attr(
					'd',
					`M${margin.left + width - margin.right - 100},${heightDerived - 30} L${margin.left + width - margin.right},${heightDerived - 30}`
				);
			xAxisDescriptor
				.select('text')
				.attr('x', margin.left + width - margin.right - 100)
				.attr('y', heightDerived - 18);

			yAxisDescriptor.attr('transform', `rotate(-90 ${margin.left} ${diagramCenterY})`);

			yAxisDescriptor
				.select('path')
				.attr(
					'd',
					`M${margin.left - 150},${diagramCenterY - 25} L${margin.left + 50},${diagramCenterY - 25}`
				);

			yAxisDescriptor
				.select('text')
				.attr('x', margin.left - 105)
				.attr('y', diagramCenterY - 30);

			d3.select('#year-label')
				.attr('x', margin.left)
				.attr('y', heightDerived - 25);
		});

		loaded = true;
		// Start with no bubbles shown
		updateChart();
	});
	function updateChart() {
		const nodes = peopleData
			.filter((d) => selectedPeople.includes(d.person))
			.map((d) => {
				let nodes = [];
				for (let i = 0; i < Math.round(d.count / 10); i++) {
					nodes.push({
						...d,
						x: xScale(d.week),
						y: (heightDerived - margin.bottom) / 2 + (Math.random() - 0.5) * 50,
						r: circleRadius
					});
				}
				return nodes;
			})
			.flat();

		// Stop any running simulation
		if (simulation) simulation.stop();

		simulation = d3
			.forceSimulation(nodes)
			.force('x', d3.forceX((d) => xScale(d.week)).strength(0.7))
			.force('y', d3.forceY((heightDerived - margin.bottom) / 2).strength(0.05))
			.force(
				'collide',
				d3.forceCollide((d) => d.r + 1.5)
			)
			.alphaDecay(0.05)
			.on('tick', ticked);

		bubbles = bubbles.data(nodes, (d) => d.person + d.week);
		bubbles.exit().remove();

		function ticked() {
			bubbles.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
		}
		const entered = bubbles
			.enter()
			.append('g')
			.attr('class', 'bubble')
			.attr('transform', (d) => `translate(${xScale(d.week)}, ${heightDerived / 2})`)
			.on('mouseover', function (event, d) {
				console.log(event.target.getBoundingClientRect());
				let bbTooltip = tooltip.node().getBoundingClientRect();
				let bb = event.target.getBoundingClientRect();
				tooltip.transition().duration(200).style('opacity', 1);
				tooltip
					.html(
						`<strong>${translateMap[d.person]}</strong><br>${d3.timeFormat('%d/%m/%Y')(d.week)}<br>${d.count} mentions`
					)
					.style('left', bb.left + bb.width / 2 - bbTooltip.width / 2 + 'px')
					.style('top', bb.top + window.scrollY - bbTooltip.height - 5 + 'px');
			})
			.on('mouseout', function () {
				tooltip.transition().duration(300).style('opacity', 0);
			});

		entered
			.append('circle')
			.attr('r', circleRadius)
			.attr('stroke', 'black')
			.attr('fill', 'var(--color-ivory-default)')
			.attr('class', 'cursor-pointer')
			.attr('stroke-width', 1)
			.on('mouseover', function (event, d) {
				event.target.setAttribute(
					'fill',
					`var(--color-${selectedSource.toLocaleLowerCase()}-default)`
				);
			})
			.on('mouseout', function (event, d) {
				event.target.setAttribute('fill', `var(--color-ivory-default)`);
			})
			.on('click', function (event, d) {
				tooltip.remove();
				selectedView.set('bubblechart');
				selectedWeek = d.week;
				selectedPeople = peopleData.filter((p) => p.week.getTime() == new Date(selectedWeek).getTime())
			});

		entered
			.append('image')
			.attr('xlink:href', (d) => `/img/people/${d.person}.webp`)
			.attr('width', circleRadius * 2)
			.attr('height', circleRadius * 2)
			.attr('x', -circleRadius)
			.attr('y', -circleRadius)
			.attr('class', 'pointer-events-none')
			.attr('clip-path', `circle(${circleRadius}px at center)`);

		bubbles = entered.merge(bubbles);
	}
	// auto update the chart on change of the dataset
	$effect(() => {
		if (
			(selectedPeople && selectedSource && loaded) ||
			(peopleData && loaded) ||
			($selectedView =='streamgraph' && loaded)
		) {
			updateChart();
		}
	});
</script>

<div class="h-dvh w-full" bind:clientWidth={width} bind:clientHeight={height}>
		<div class="grid grid-cols-3 gap-1">
			{#each peopleOrdered as person, i}
				<button
					class="control text-left py grid w-full grid-cols-3 rounded-xl border px-2 hover:cursor-pointer hover:bg-[var(--color-ivory-default)]"
					class:pointer-events-none={false}
					class:col-start-1={Math.floor(i / 5) == 0}
					class:col-start-2={Math.floor(i / 5) == 1}
					class:col-start-3={Math.floor(i / 5) == 2}
					class:row-start-1={i % 5 == 0}
					class:row-start-2={i % 5 == 1}
					class:row-start-3={i % 5 == 2}
					class:row-start-4={i % 5 == 3}
					class:row-start-5={i % 5 == 4}
					class:bg-[var(--color-nyt-light)]={selectedPeople.includes(person) &&
						selectedSource == 'NYT'}
					class:bg-[var(--color-zeit-light)]={selectedPeople.includes(person) &&
						selectedSource == 'Zeit'}
					onclick={togglePerson}
					data-person={person}
				>
					<span class:pointer-events-none={true} class="col-span-3 col-start-1 row-start-1">
						{i + 1}. {translateMap[person]}
					</span>

					<span
						class:pointer-events-none={true}
						class="self-center justify-self-end col-span-1 col-start-3 row-start-1"
						style="font-size: 10px; pointer-events: none;"
					>
						({peopleData.filter((p) => p.person == person).reduce((acc, p) => acc + p.count, 0)} images)
					</span>
				</button>
			{/each}
		</div>

		<svg {width} height={heightDerived} id="steamgraph-chart">
			<defs>
				<circle id="circle" cx="25%" cy="25%" r="15" />
				<clipPath id="clip">
					<use xlink:href="#circle" />
				</clipPath>
				<marker id="arrowhead" markerWidth="14" markerHeight="14" refX="7" refY="7" orient="auto">
					<path d="M2,2 L2,12 L10,7 L2,2"></path>
				</marker>
				<marker
					id="arrowhead-reverse"
					markerWidth="14"
					markerHeight="14"
					refX="8"
					refY="7"
					orient="auto"
				>
					<path d="M8,2 L8,12 L0,7 L8,2"></path>
				</marker>
			</defs>
		</svg>
</div>
