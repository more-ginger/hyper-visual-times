<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import translateCard from '../../content/data/images/translate_map.json';
    import dataNYT from '../../content/data/images/connections_with_news_desk_per_person_nyt.json';
    import dataZeit from '../../content/data/images/connections_with_news_desk_per_person_zeit.json';
	//props
	let { currentSource } = $props();
	//setup for the steamgraph svg
	let svg;
	let width = $state(0);
	let height = $state(0);
	let heightDerived = $derived(height);
	let loaded = $state(false);
	let tooltip;
	let bubbles;
	let simulation;
	onMount(() => {
		svg = d3.select('#network-graph');
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
		loaded = true;
		// Start with no bubbles shown
		updateChart();
	});
	function updateChart() {
      const nodesMap = new Map();
        let dataset = currentSource == 'NYT' ? dataNYT : dataZeit;
      dataset.forEach(d => {
        if (!nodesMap.has(d.personA)) nodesMap.set(d.personA, { id: d.personA });
        if (!nodesMap.has(d.personB)) nodesMap.set(d.personB, { id: d.personB });
      });
      const nodes = Array.from(nodesMap.values());

            // Expand into individual lines per news_desk per coappearance count
      const expandedLinks = [];
    dataset.forEach(d => {
        let total = 0
        let i = 0;
        Object.entries(d.news_desks).forEach(([desk, count]) => {
            total += count
        })
        Object.entries(d.news_desks).forEach(([desk, count]) => {
          // Create a separate array for this pair + news desk
        //   const lines = Array.from({ length: count }, (_, j) => ({
        //     source: d.personA,
        //     target: d.personB,
        //     news_desk: desk,
        //     localIndex: i++, // local index per pair
        //     total
        //   }));
        //   expandedLinks.push(...lines);
        })
        expandedLinks.push({
                source: d.personA,
                target: d.personB,
                localIndex: i++, // local index per pair
                total
            });
      });
     const newsDesks = Array.from(new Set(expandedLinks.map(d => d.news_desk)));
      const color = d3.scaleOrdinal(newsDesks, d3.schemeTableau10);

      // --- Force simulation ---
      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(expandedLinks).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, heightDerived / 2))
        .force("collision", d3.forceCollide().radius(25));

      // --- Draw links (balanced curved lines per pair) ---
      const link = svg.append("g")
        .attr("stroke-opacity", 0.7)
        .selectAll("path")
        .data(expandedLinks)
        .join("path")
        .attr("class", "link")
        .attr('fill', 'none')
        .attr("stroke", 'black')
        .attr("stroke-width", d => d.total * 0.5);

      // --- Draw nodes ---
      const node = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .attr("class", "node")
        .call(drag(simulation));

		node
			.append('circle')
			.attr('r', 20)
			.attr('stroke', 'black')
			.attr('fill', 'var(--color-ivory-default)')
			.attr('class', 'cursor-pointer')
			.attr('stroke-width', 1)
			.on('mouseover', function (event, d) {
				event.target.setAttribute(
					'fill',
					`var(--color-${currentSource.toLocaleLowerCase()}-light)`
				);
                event.target.parentNode.querySelector('.selection-bubble').setAttribute('opacity', 1);
			})
			.on('mouseout', function (event, d) {
				event.target.setAttribute('fill', `var(--color-ivory-default)`);
                event.target.parentNode.querySelector('.selection-bubble').setAttribute('opacity', 0);

			})
        node.append('circle')
                    .attr('class', 'selection-bubble')
                    .attr('r', 30)
                    .attr('stroke', currentSource == 'NYT' ? 'var(--color-nyt-default)' : 'var(--color-zeit-default)')
                    .attr('fill', 'none')
                    .attr('stroke-width', 1)
                    .attr('cx', d => 0)
                    .attr('cy', d=>  0)
                    .attr('opacity', 0);

		node
			.append('image')
			.attr('xlink:href', (d) => `/img/people/${d.id}.webp`)
			.attr('width', 40)
			.attr('height', 40)
			.attr('x', -20)
			.attr('y', -20)
			.attr('class', 'pointer-events-none')
			.attr('clip-path',`circle(${20}px at center)`);
     
    let pills = node
			.append('foreignObject')
			.attr('y', (d) => 20) // position below the bubble
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
					.attr('y', 20); // position below the bubble
			});

      simulation.on("tick", () => {
            let selectionBubble = d3.select('#selection-bubble');
            if (!selectionBubble.empty()) {
                selectionBubble
                    .attr('cx', d =>  d.x)
                    .attr('cy', d =>  d.y);
            }
        link.attr("d", d => {
          const sx = d.source.x, sy = d.source.y;
          const tx = d.target.x, ty = d.target.y;

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
          const step = Math.floor((d.localIndex + 1) / 2);
          const direction = d.localIndex % 2 === 0 ? 1 : -1;
          const curvature = step * 8; // curvature strength for each side

          const controlX = midX + normX * curvature * direction;
          const controlY = midY + normY * curvature * direction;

          // Draw quadratic Bézier curve
          return `M${sx},${sy} Q${controlX},${controlY} ${tx},${ty}`;
        });

        node.attr("transform", d => `translate(${d.x},${d.y})`);
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
          d.fx = null;
          d.fy = null;
        }
        return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      }
	}
	// auto update the chart on change of the dataset
	$effect(() => {
	});
</script>

<div class="h-full w-full" bind:clientWidth={width} bind:clientHeight={height}>
		<svg {width} height={heightDerived} id="network-graph">
		</svg>
</div>
