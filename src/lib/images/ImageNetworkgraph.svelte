<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import translateCard from '../../content/data/images/translate_map.json';
	import dataNYT from '../../content/data/images/connections_with_news_desk_per_person_nyt.json';
	import dataZeit from '../../content/data/images/connections_with_news_desk_per_person_zeit.json';
	import ArticlesCard from '$lib/common/ArticlesCard.svelte';
	//props
	let { currentSource } = $props();
	//setup for the steamgraph svg
	let svg;
	let width = $state(0);
	let height = $state(0);
	let heightDerived = $derived(height);
	let loaded = $state(false);
  let loading = $state(false);
	let tooltip;
	let nodes;
	let links;
	let selection1 = $state(null);
	let selection2 = $state(null);
  let articles = $state([]);
  let simulation = null;
  $effect(async() => {
    if(selection1 !== null && selection2 !== null) {
      loading = true;
      console.log('fetching articles for:', selection1, selection2);
      try { 
			  const response = await fetch(
				`/api/articles/compare?source=${currentSource.toLocaleLowerCase()}&person1=${selection1}&person2=${selection2}`
			);
        const result = await response.json();
        console.log(result);
        articles = result;
        loading = false;
      } catch (error) {
        console.log('Error in fetching total counts inside fetchTotalCounts', error);
        articles = [];
        loading = false;
      }
    }
  });
	onMount(() => {
		svg = d3.select('#network-graph');
		nodes = svg.selectAll('.nodes');
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
		loaded = true;
		// Start with no bubbles shown
		updateChart();
	});
	function updateChart() {
		const nodesMap = new Map();
		let dataset = currentSource == 'NYT' ? dataNYT : dataZeit;
		dataset.forEach((d) => {
			if (!nodesMap.has(d.personA)) nodesMap.set(d.personA, { id: d.personA });
			if (!nodesMap.has(d.personB)) nodesMap.set(d.personB, { id: d.personB });
		});
		const nodesData = Array.from(nodesMap.values());

		// Expand into individual lines per news_desk per coappearance count
		const expandedLinks = [];
		dataset.forEach((d) => {
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

		// --- Force simulation ---
    if(simulation) {
      simulation.stop();
    }
		simulation = d3
			.forceSimulation(nodesData)
			.force(
				'link',
				d3
					.forceLink(expandedLinks)
					.id((d) => d.id)
					.distance(150)
			)
			.force('charge', d3.forceManyBody().strength(-300))
			.force('center', d3.forceCenter(width / 2, heightDerived / 2))
			.force('collision', d3.forceCollide().radius(50));

		// --- Draw links (balanced curved lines per pair) ---
    svg.selectAll('path').remove();
    svg.selectAll('.nodes').remove();
    links = svg.selectAll('path').data(expandedLinks);
    links.exit().remove();
    const linksEnter = links.enter()
      .append('path')
      .attr('class', 'link-curve')
			.attr('fill', 'none')
			.attr('stroke-width', 1)
			.attr('stroke-opacity', 0);

		// --- Draw nodes ---
    nodes = svg.selectAll('.nodes').data(nodesData);
    nodes.exit().remove();
    const nodesEnter = nodes.enter()
      .append('g')
      .attr('class', 'nodes')
			.call(drag(simulation))
			.on('click', (event, d) => {
				if (selection1 === null && d.id !== selection2) {
					selection1 = d.id;
				} else if (selection1 !== null && selection2 === null && d.id !== selection1) {
					selection2 = d.id;
				} else if (selection1 === d.id) {
					selection1 = null;
          if(!loading){
          articles = [];
          }
				} else if (selection2 === d.id) {
					selection2 = null;
          if(!loading){
            articles = [];
          }
				}
			});

		nodesEnter
			.append('circle')
			.attr('r', 20)
			.attr('stroke', 'black')
      .attr('class','node-circle')
			.attr('fill', 'var(--color-ivory-default)')
			.attr('class', 'cursor-pointer')
			.attr('stroke-width', 1)
			.on('mouseover', function (event, d) {
				if (selection1 != d.id && selection2 != d.id) {
					event.target.setAttribute(
						'fill',
						`var(--color-${currentSource.toLocaleLowerCase()}-light)`
					);
				}
				event.target.parentNode.querySelector('.selection-bubble').setAttribute('opacity', 1);
			})
			.on('mouseout', function (event, d) {
				if (selection1 != d.id && selection2 != d.id) {
					event.target.setAttribute('fill', `var(--color-ivory-default)`);
				}
				event.target.parentNode.querySelector('.selection-bubble').setAttribute('opacity', 0);
			});
		
    nodesEnter
			.append('circle')
			.attr('class', 'selection-bubble')
			.attr('r', 30)
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
      .text((d) => translateCard[d.id])
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
          if(selection1 == null || selection2 == null) {
            return currentSource == 'NYT' ? 'var(--color-nyt-default)' : 'var(--color-zeit-default)';
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
					if (selection1 == null || selection2 == null) {
						return 1;
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
						return d.total * 0.5;
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
						const step = Math.abs((d.localIndex + 1) - (d.total + 1) / 2);
						const direction = (d.localIndex + 1) / d.total <= 0.5 ? 1 : -1;
						const curvature = step * 10; // curvature strength for each side

						const controlX = midX + normX * curvature * direction;
						const controlY = midY + normY * curvature * direction;

						// Draw quadratic Bézier curve
						return `M${sx},${sy} Q${controlX},${controlY} ${tx},${ty}`;
					}
				});
        nodes.select('div').text((d) => translateCard[d.id]).each(function (d) {
				// measure actual pill width after rendering
				const bb = this.getBoundingClientRect();
				d3.select(this.parentNode) // parent foreignObject
					.attr('width', bb.width * 2)
					.attr('x', -bb.width) // center under node
					.attr('y', 23); // position below the bubble
			});
      nodes.select('.node-circle').attr('fill','var(--color-ivory-default)');
      nodes.select('.selection-bubble').attr(
				'stroke',
				currentSource == 'NYT' ? 'var(--color-nyt-default)' : 'var(--color-zeit-default)'
			)
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
					return currentSource == 'NYT' ? 'var(--color-nyt-default)' : 'var(--color-zeit-default)';
				} else {
					return 'var(--color-ivory-default)';
				}
			});

      nodes.select('image').attr('xlink:href', (d) => `/img/people/${d.id}.webp`)
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
    if(currentSource && loaded){
      updateChart();
    }
  });
</script>

<div class="h-full w-full" bind:clientWidth={width} bind:clientHeight={height}>
	<svg {width} height={heightDerived} id="network-graph"> </svg>
  <div class="absolute left-[10%] top-[50%] -translate-y-[50%]" class:hidden={!loading && articles.length === 0}>
        <ArticlesCard {articles} {currentSource} {loading}>
          <div class="col-span-2">
              <span><b>{translateCard[selection1]}</b> <img class="inline" src="/icons/ui-switch.svg"/> <b>{translateCard[selection2]}</b></span><br>
              appear visually together in <u>{articles.length == 0 ? '?' : articles.length} Articles.</u>
          </div>
        </ArticlesCard>
  </div>
</div>
