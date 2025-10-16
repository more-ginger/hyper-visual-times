<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import translateCard from '../../content/data/images/translate_map.json';
	import ImageBubblechart from './ImageBubblechart.svelte';
	import BackwardButton from '$lib/common/BackwardButton.svelte';
	//props
	let { peopleOrdered, peopleData, peopleSelected, currentSource, blocked } = $props();
	//setup for the two views (steamgraph and bubblechart)
	let steamgraph = $state(true);
	let selectedDate = $state(null);
	//setup for the steamgraph svg
	let svg;
	let width = $state(0);
	let height = $state(0);
	let heightDerived = $derived(height / 1.5);
	let loaded = $state(false);
	let xScale;
	let axisGenerator;
	let tooltip;
	let bubbles;
	let simulation;
	const margin = { top: 60, right: 40, bottom: 60, left: 40 };
	const circleRadius = 10;
	onMount(() => {
		console.log(peopleData)
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
					.tickFormat((d) => d3.utcFormat('%B')(d))
		svg
			.append('g')
			.attr('class', 'axis')
			.attr('transform', `translate(5,${heightDerived - margin.bottom})`)
			.call(axisGenerator)
			.call(g => g.select('.domain').remove())
			.call((g) =>
				g
					.selectAll('.tick line')
					.attr('opacity', 0.5)
					.attr('stroke-width', 0.5)
					.attr('stroke-dasharray', '5,5')
					.attr('y2', -heightDerived + margin.top + margin.bottom)
			);
		window.addEventListener('resize', () => {
			console.log(width)
			xScale = d3
				.scaleTime()
				.domain([new Date('2024-01-01'), new Date('2024-12-31')])
				.range([margin.left, width - margin.right]);
			
			axisGenerator = d3
					.axisBottom(xScale)
					.tickValues([
						new Date('2024-01-01'),
						new Date('2024-04-01'),
						new Date('2024-07-01'),
						new Date('2024-10-01'),
						new Date('2024-12-31')
					])
					.tickFormat((d) => d3.utcFormat('%B')(d))

			svg.select('.axis')
			.attr('transform', `translate(5,${heightDerived - margin.bottom})`)
			.call(axisGenerator)
			.call(g => g.select('.domain').remove())
			.call((g) =>
				g
					.selectAll('.tick line')
					.attr('opacity', 0.5)
					.attr('stroke-width', 0.5)
					.attr('stroke-dasharray', '5,5')
					.attr('y2', -heightDerived + margin.top + margin.bottom)
			);
			updateChart();		
		})
		loaded = true;
		// Start with no bubbles shown
		updateChart();
	});
	

	function updateChart() {
		const nodes = peopleData.filter((d) => peopleSelected.includes(d.person))
			.map((d) => {
				let nodes = [];
				for (let i = 0; i < Math.round(d.count / 12); i++) {
					nodes.push({
						...d,
						x: xScale(d.week),
						y: heightDerived / 2 + (Math.random() - 0.5) * 50,
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
			.force('y', d3.forceY(heightDerived / 2).strength(0.05))
			.force(
				'collide',
				d3.forceCollide((d) => d.r + 1.5)
			)
			.alphaDecay(0.05)
			.on('tick', ticked);

		bubbles = bubbles.data(nodes, (d) => d.person + d.week);
		bubbles.exit().remove();

		const entered = bubbles
			.enter()
			.append('g')
			.attr('class', 'bubble')
			.attr('transform', (d) => `translate(${xScale(d.week)}, ${heightDerived / 2})`)
			.on('mouseover', function(event, d){
				tooltip.transition().duration(200).style('opacity', 1);
				tooltip
					.html(
						`<strong>${translateCard[d.person]}</strong><br>${d3.timeFormat('%d/%m/%Y')(d.week)}<br>${d.count} mentions`
					)
					.style('left', event.pageX + 10 + 'px')
					.style('top', event.pageY - 28 + 'px');
			})
			.on('mouseout', function(){
				tooltip.transition().duration(300).style('opacity', 0)
			});

		entered
			.append('circle')
			.attr('r', circleRadius)
			.attr('stroke', 'black')
			.attr('fill', 'var(--color-ivory-default)')
			.attr('class','cursor-pointer')
			.attr('stroke-width', 1)
			.on('mouseover',function(event,d){
				event.target.setAttribute('fill',`var(--color-${currentSource.toLocaleLowerCase()}-light)`)
			})
			.on('mouseout',function(event,d){
				event.target.setAttribute('fill',`var(--color-ivory-default)`)
			})
			.on('click',function(event,d){
				steamgraph = false;
				selectedDate = d.week;
				console.log(selectedDate)
			})

		entered
			.append('image')
			.attr('xlink:href',(d) => `/img/people/${d.person}.webp`)
			.attr('width', circleRadius * 2)
			.attr('height',circleRadius * 2)
			.attr('x',  -circleRadius)
			.attr('y', -circleRadius)
			.attr('class','pointer-events-none')
			.attr('clip-path',`circle(${circleRadius}px at center)`);

		bubbles = entered.merge(bubbles);

		function ticked() {
			bubbles.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
		}
	}
	// auto update the chart on change of the dataset
	$effect(() => {
		if ((peopleData && loaded) || (peopleSelected && loaded) || (steamgraph && loaded)) {
			updateChart();
		}
	});
	function togglePerson(event){
		let person = event.target.dataset.person
		if(peopleSelected.includes(person)){
			peopleSelected = peopleSelected.filter(p => p!=person)
		}else{
			peopleSelected = [...peopleSelected,person]
		}
	}
</script>

<div class="h-full w-full" bind:clientWidth={width} bind:clientHeight={height}>
	<div id="steamgraph-chart-controls" class="flex flex-wrap gap-1" class:hidden={!steamgraph}>
		{#each peopleOrdered as person, i}
			<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
			<div
				class={`control py rounded-xl border px-3 hover:cursor-pointer`}
				class:pointer-events-none={blocked}
				class:bg-[var(--color-nyt-light)]={peopleSelected.includes(person) && currentSource == 'NYT'}
				class:bg-[var(--color-zeit-light)]={peopleSelected.includes(person) && currentSource == 'Zeit'}
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
		</defs>
	</svg>
	{#if !steamgraph}
	<div class="flex gap-2">
		<BackwardButton backto={"Chart"} bind:back={steamgraph}/>
		<p>Found <u>{peopleData.filter(p => p.week.getTime() == (selectedDate.getTime())).reduce((acc, p) => acc + p.count, 0)}</u> visual mentions on <u>{selectedDate.toLocaleDateString('de')}</u></p>
	</div>
		<ImageBubblechart {width} height={heightDerived} {currentSource} people = {peopleData.filter(p => p.week.getTime() == (selectedDate.getTime()))}/>
	{/if}
</div>
