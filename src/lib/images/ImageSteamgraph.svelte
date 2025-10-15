<script lang="ts">
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import translateCard from '../../content/data/images/translate_map.json';
	let { json, source, detail, step, endStep } = $props();

	let svg: any;
	let width = $state(0);
	let height = $state(0);
	let heightDerived = $derived(height / 1.5);
	let loaded = $state(false);
	let x: any;
	let color: any;
	let tooltip: any;
	let zeitORnyt = $derived(source); // NYT or Zeit
	// margins
	const margin = { top: 60, right: 40, bottom: 60, left: 40 };
	const fixedCircleRadius = 8;
	// data container
	let people: any = $derived(
		Object.keys(json.data).sort((a, b) => json.data[b].total - json.data[a].total)
	);
	let peopleFlat: any = $derived(
		people
			.map((person: any) => {
				let entries = [];
				Object.entries(json.data[person].timeframe).forEach(([week, count]) => {
					entries.push({
						person: person,
						week: new Date(week.slice(0, 10)), // Convert to Date object
						count: count
					});
				});
				return entries;
			})
			.flat()
	);
	let bubbles: any;
	let simulation: any;
	onMount(() => {
		svg = d3.select('#bubble-chart');
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
		x = d3
			.scaleTime()
			.domain([new Date('2024-01-01'), new Date('2024-12-31')])
			.range([margin.left, width - margin.right]);

		color = d3.scaleOrdinal(d3.schemePaired).domain(people);
		// Axes
		svg
			.append('g')
			.attr('class', 'axis')
			.attr('transform', `translate(5,${heightDerived - margin.bottom})`)
			.call(
				d3
					.axisBottom(x)
					.tickValues([
						new Date('2024-01-01'),
						new Date('2024-04-01'),
						new Date('2024-07-01'),
						new Date('2024-10-01'),
						new Date('2024-12-31')
					])
					.tickFormat((d) => d3.utcFormat('%B')(d))
			)
			.call((g) => g.select('.domain').remove())
			.call((g) =>
				g
					.selectAll('.tick line')
					.attr('opacity', 0.5)
					.attr('stroke-width', 0.5)
					.attr('stroke-dasharray', '5,5')
					.attr('y2', -heightDerived + margin.top + margin.bottom)
			);
		loaded = true;
		// Start with no bubbles shown
		updateChart();
	});

	function updateChart() {
		let selected: any = new Set();
		if (step != endStep && detail[step] != null) {
			selected = new Set(detail[step]);
		} else {
			selected = new Set(
				Array.from(document.querySelectorAll('#bubble-chart-controls .active')).map(
					(d) => d.dataset.person
				)
			);
		}

		const filteredData = peopleFlat.filter((d) => selected.has(d.person));
		const nodes = filteredData
			.map((d) => {
				let nodes = [];
				for (let i: number = 0; i < Math.round(d.count / 10); i++) {
					nodes.push({
						...d,
						x: x(d.week),
						y: heightDerived / 2 + (Math.random() - 0.5) * 50,
						r: fixedCircleRadius
					});
				}
				return nodes;
			})
			.flat();

		// Stop any running simulation
		if (simulation) simulation.stop();

		simulation = d3
			.forceSimulation(nodes)
			.force('x', d3.forceX((d) => x(d.week)).strength(0.5))
			.force('y', d3.forceY(heightDerived / 2).strength(0.05))
			.force(
				'collide',
				d3.forceCollide((d) => d.r + 1.5)
			)
			.alphaDecay(0.02)
			.on('tick', ticked);

		bubbles = bubbles.data(nodes, (d) => d.person + d.week);
		bubbles.exit().remove();

		const entered = bubbles
			.enter()
			.append('g')
			.attr('class', 'bubble')
			.attr('transform', (d) => `translate(${x(d.week)}, ${heightDerived / 2})`)
			.on('mouseover', (event, d) => {
				tooltip.transition().duration(200).style('opacity', 1);
				tooltip
					.html(
						`<strong>${translateCard[d.person]}</strong><br>${d3.timeFormat('%d/%m/%Y')(d.week)}<br>${d.count} mentions`
					)
					.style('left', event.pageX + 10 + 'px')
					.style('top', event.pageY - 28 + 'px');
			})
			.on('mouseout', () => tooltip.transition().duration(300).style('opacity', 0));

		entered
			.append('circle')
			.attr('r', (d) => fixedCircleRadius)
			.attr('stroke', 'black')
			.attr('fill', 'var(--color-ivory-default)')
			.attr('stroke-width', 1);

		entered
			.append('image')
			.attr('xlink:href', (d) => `/img/people/${d.person}.png`)
			.attr('width', (d) => fixedCircleRadius * 2)
			.attr('height', (d) => fixedCircleRadius * 2)
			.attr('x', (d) => -fixedCircleRadius)
			.attr('y', (d) => -fixedCircleRadius)
			.attr('clip-path', (d) => `circle(${fixedCircleRadius}px at center)`);

		bubbles = entered.merge(bubbles);

		function ticked() {
			bubbles.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
		}
	}
	function togglePerson(event: any) {
		if (event.currentTarget.classList.contains('active')) {
			event.currentTarget.classList.remove('active');
			event.currentTarget.classList.toggle(
				zeitORnyt == 'NYT' ? 'bg-[var(--color-nyt-light)]' : 'bg-[var(--color-zeit-light)]',
				false
			);
		} else {
			event.currentTarget.classList.add('active');
			event.currentTarget.classList.toggle(
				zeitORnyt == 'NYT' ? 'bg-[var(--color-nyt-light)]' : 'bg-[var(--color-zeit-light)]',
				true
			);
		}
		updateChart();
	}
	// auto update the chart on change of the dataset
	$effect(() => {
		if (zeitORnyt && loaded) {
			updateChart();
		}
	});
</script>

<div class="h-full w-full" bind:clientWidth={width} bind:clientHeight={height}>
	<div id="bubble-chart-controls" class="grid grid-cols-3 gap-1 pl-4">
		{#each people as person, i}
			<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
			<div
				class={'control py w-[225px] rounded-xl border bg-[var(--color-ivory-light)] px-3 hover:cursor-pointer' +
					(zeitORnyt == 'NYT'
						? ' hover:bg-[var(--color-nyt-light)]'
						: ' hover:bg-[var(--color-zeit-light)]')}
				class:active={detail[step].includes(person)}
				class:bg-[var(--color-nyt-light)]={zeitORnyt == 'NYT' && detail[step].includes(person)}
				class:bg-[var(--color-zeit-light)]={zeitORnyt == 'Zeit' && detail[step].includes(person)}
				class:pointer-events-none={step != endStep}
				onclick={togglePerson}
				data-person={person}
			>
				{i + 1}. {translateCard[person]}
			</div>
		{/each}
	</div>
	<svg {width} height={heightDerived} id="bubble-chart">
		<defs>
			<circle id="circle" cx="25%" cy="25%" r="15" />
			<clipPath id="clip">
				<use xlink:href="#circle" />
			</clipPath>
		</defs>
	</svg>
</div>
