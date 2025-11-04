<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import translateCard from '../../content/data/images/translate_map.json';
	import ImageBubblechart from './ImageBubblechart.svelte';
	import OutletSwitch from '$lib/common/OutletSwitch.svelte';
	//props
	let { currentSource, peopleSelected, peopleOrdered, peopleData } = $props();
	//setup for the two views (steamgraph and bubblechart)
	let steamgraph = $state(true);
	let selectedWeek = $state(null);
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
	let heightDerived = $derived(height);
	let loaded = $state(false);
	let margin = { top: 0, right: 40, bottom: 150, left: 40 };
	let diagramInnerHeight = $derived(heightDerived - margin.top - margin.bottom);
	let diagramCenterY = $derived(diagramInnerHeight / 2);
	let circleRadius = 10;
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
				`M${margin.left + width - margin.right - 125},${heightDerived-margin.bottom+30} L${margin.left + width - margin.right-15},${heightDerived-margin.bottom+30}`
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
			.attr('y', heightDerived-margin.bottom + 35)
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
			.filter((d) => peopleSelected.includes(d.person))
			.map((d) => {
				let nodes = [];
				for (let i = 0; i < Math.round(d.count / 10); i++) {
					nodes.push({
						...d,
						x: xScale(d.week),
						y: (heightDerived-margin.bottom) / 2 + (Math.random() - 0.5) * 50,
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
			.force('y', d3.forceY((heightDerived-margin.bottom) / 2).strength(0.05))
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
						`<strong>${translateCard[d.person]}</strong><br>${d3.timeFormat('%d/%m/%Y')(d.week)}<br>${d.count} mentions`
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

		bubbles = entered.merge(bubbles);
	}
	// auto update the chart on change of the dataset
	$effect(() => {
		if (
			(peopleSelected && currentSource && loaded) ||
			(peopleData && loaded) ||
			(steamgraph && loaded)
		) {
			updateChart();
		}
	});

</script>

<div class="h-full w-full" bind:clientWidth={width} bind:clientHeight={height}>
	 <div class:hidden={!steamgraph}>
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
			height={heightDerived*0.8}
			{selectedWeek}
			{currentSource}
			people={peopleData.filter((p) => p.week.getTime() == new Date(selectedWeek).getTime())}
		/>
	{/if}
</div>
