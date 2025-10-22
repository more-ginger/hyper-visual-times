<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import translateCard from '../../content/data/images/translate_map.json';
	import ImageBubblechart from './ImageBubblechart.svelte';
	import OutletSwitch from '$lib/common/OutletSwitch.svelte';
	//props
	let { peopleOrdered, peopleData, peopleSelected, currentSource, blocked } = $props();
	//setup for the two views (steamgraph and bubblechart)
	let steamgraph = $state(true);
	let selectedWeek = $state(null);
	//setup for the steamgraph svg
	let svg;
	let width = $state(0);
	let height = $state(0);
	let heightDerived = $derived(height / 1.5);
	let loaded = $state(false);
	let xScale;
	let yScale;
	let axisGenerator;
	let xAxisDescriptor;
	let yAxisDescriptor;
	let tooltip;
	let bubbles;
	let simulation;
	const margin = { top: 60, right: 40, bottom: 60, left: 40 };
	const circleRadius = 10;
	$inspect(peopleSelected);
	onMount(() => {
		svg = d3.select('#steamgraph-chart');
		bubbles = svg.selectAll('.bubble');
		tooltip = d3
			.select('body')
			.append('div')
			.attr('class', 'tooltip')
			.style('opacity', 0)
			.style('position', 'absolute')
			.style('text-align', 'left')
			.style('width', 'auto')
			.style('height', 'auto')
			.style('padding', '8px')
			.style('font', '12px sans-serif')
			.style('background', 'rgba(255,255,255,0.25)')
			.style('box-shadow', '0px 0px 6px #aaa')
			.style('backdrop-filter', 'blur(5px)')
			.style('border', '0px')
			.style('border-radius', '8px')
			.style('pointer-events', 'none');
		yScale = d3
			.scaleLinear()
			.domain([0, d3.max(peopleData, (d) => d.count)])
			.range([4,100]);
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
				`M${margin.left + width - margin.right - 100},${heightDerived - 30} L${margin.left + width - margin.right},${heightDerived - 30}`
			)
			.attr('stroke', 'black')
			.attr('stroke-width', 0.5)
			.attr('marker-end', 'url(#arrowhead)');
		xAxisDescriptor
			.append('text')
			.attr('x', margin.left + width - margin.right - 100)
			.attr('y', heightDerived - 18)
			.attr('text-anchor', 'start')
			.attr('font-size', '10')
			.text('Time');

		yAxisDescriptor = svg.append('g').attr('transform', `rotate(-90 ${margin.left} ${100})`);

		yAxisDescriptor
			.append('path')
			.attr('d', `M${margin.left - 100},${100 - 15} L${margin.left + 150 - 115},${100 - 15}`)
			.attr('stroke', 'black')
			.attr('stroke-width', 0.5)
			.attr('marker-end', 'url(#arrowhead)')
			.attr('marker-start', 'url(#arrowhead-reverse)');

		yAxisDescriptor
			.append('text')
			.attr('x', margin.left - 90)
			.attr('y', 100 - 5 - 15)
			.attr('text-anchor', 'start')
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
			.attr('y', heightDerived - 25)
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

			yAxisDescriptor
				.select('path')
				.attr('d', `M${margin.left - 100},${100 - 15} L${margin.left + 150 - 100},${100 - 15}`);
			yAxisDescriptor
				.select('text')
				.attr('x', margin.left - 100)
				.attr('y', 100 - 5 - 15);
			d3.select('#year-label')
				.attr('x', margin.left)
				.attr('y', heightDerived - 25);
		});

		loaded = true;
		// Start with no bubbles shown
		updateChart();
	});
	function updateChart() {
		const nodes = peopleData.filter((d) => peopleSelected.includes(d.person))
			.map((d) => {
				let nodes = [];
				for (let i = 0; i < Math.round(d.count / 10); i++) {
					nodes.push({
						...d,
						x: xScale(d.week),
						y: heightDerived / 2 + (Math.random() - 0.5) * 50,
						r: circleRadius
					});
				}
					// nodes.push({
					// 	...d,
					// 	x: xScale(d.week),
					// 	y: heightDerived / 2 + (Math.random() - 0.5) * 50,
					// 	r: yScale(d.count)
					// });
				return nodes;
			})
			.flat();

		// Stop any running simulation
		if (simulation) simulation.stop();

		simulation = d3
			.forceSimulation(nodes)
			.force('x', d3.forceX((d) => xScale(d.week)).strength(0.7))
			.force('y', d3.forceY(heightDerived / 2).strength(0.05))
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
				tooltip.transition().duration(200).style('opacity', 1);
				tooltip
					.html(
						`<strong>${translateCard[d.person]}</strong><br>${d3.timeFormat('%d/%m/%Y')(d.week)}<br>${d.count} mentions`
					)
					.style('left', event.pageX + 10 + 'px')
					.style('top', event.pageY - 28 + 'px');
			})
			.on('mouseout', function () {
				tooltip.transition().duration(300).style('opacity', 0);
			});

		entered
			.append('circle')
			.attr('r', circleRadius /*(d) => d.r*/)
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
				steamgraph = false;
				selectedWeek = d.week;
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
		// entered
		// 	.append('image')
		// 	.attr('xlink:href', (d) => `/img/people/${d.person}.webp`)
		// 	.attr('width', d => d.r * 2)
		// 	.attr('height', d => d.r * 2)
		// 	.attr('x', d => -d.r)
		// 	.attr('y', d => -d.r)
		// 	.attr('class', 'pointer-events-none')
		// 	.attr('clip-path', d => `circle(${d.r}px at center)`);

		bubbles = entered.merge(bubbles)
	}
	// auto update the chart on change of the dataset
	$effect(() => {
		if ((peopleSelected) && (currentSource && loaded) || (peopleData && loaded) || (steamgraph && loaded)) {
			console.log('update chart');
			updateChart();
		}
	});
	function togglePerson(event) {
		let person = event.target.dataset.person;
		if (peopleSelected.includes(person)) {
			peopleSelected = peopleSelected.filter((p) => p != person);
		} else {
			peopleSelected = [...peopleSelected, person];
		}
	}
</script>

<div class="h-full w-full" bind:clientWidth={width} bind:clientHeight={height}>
	<div class:hidden={!steamgraph}>
		{#if !blocked}
			<OutletSwitch bind:currentOutlet={currentSource} />
		{/if}
		<div id="steamgraph-chart-controls" class="grid grid-cols-3	gap-1">
			{#each peopleOrdered as person, i}
				<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
				<div
					class={`control py rounded-xl border px-3 hover:cursor-pointer col-span-1`}
					class:col-start-1={Math.floor(i / 5) == 0}
					class:col-start-2={Math.floor(i / 5) == 1}
					class:col-start-3={Math.floor(i / 5) == 2}
					class:row-start-1={i % 5 == 0}
					class:row-start-2={i % 5 == 1}
					class:row-start-3={i % 5 == 2}
					class:row-start-4={i % 5 == 3}
					class:row-start-5={i % 5 == 4}
					class:pointer-events-none={false/*blocked*/}
					class:bg-[var(--color-nyt-light)]={peopleSelected.includes(person) &&
						currentSource == 'NYT'}
					class:bg-[var(--color-zeit-light)]={peopleSelected.includes(person) &&
						currentSource == 'Zeit'}
					onclick={togglePerson}
					data-person={person}
				>
					{i + 1}. {translateCard[person]}
				</div>
			{/each}
		</div>
		<svg {width} height={heightDerived} id="steamgraph-chart" class:hidden={!steamgraph}>
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
	{#if !steamgraph}
		<ImageBubblechart
			bind:steamgraph
			{width}
			height={heightDerived}
			{selectedWeek}
			{currentSource}
			people={peopleData.filter((p) => p.week.getTime() == new Date(selectedWeek).getTime())}
		/>
	{/if}
</div>
