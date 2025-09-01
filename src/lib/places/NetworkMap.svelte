<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import World from '../../content/data/places/world.json';

	const { nodes, links, selectedOutlet, primaryCountryKey } = $props();
	let canvas: HTMLCanvasElement | null = $state(null);
	let context: CanvasRenderingContext2D | null = $state(null);
	let width = $state(0);
	let height = $state(0);

	let projection = $derived(d3.geoNaturalEarth1());
	let path = $derived(d3.geoPath(projection, context));
	let dpi = 1;
	let graticule = d3.geoGraticule10();
	let outline = { type: 'Sphere' };

	$effect(() => {
		if (canvas) {
			context = canvas.getContext('2d');

			canvas.style.width = '100%';
			canvas.style.height = '100%';

			dpi = window.devicePixelRatio || 1;
			canvas.width = canvas.offsetWidth * dpi;
			canvas.height = canvas.offsetHeight * dpi;
			width = canvas.offsetWidth * dpi;
			height = canvas.offsetHeight * dpi;
			const positioningFactor = dpi > 1 ? 4 : 2;

			projection.fitExtent(
				[
					[10, 0],
					[width / 2 - 10, height / 2]
				],
				World
			);

			if (context) {
				context.scale(dpi, dpi);
				context.beginPath(), path(graticule), (context.strokeStyle = '#ccc'), context.stroke();
				context.beginPath(),
					path(outline),
					context.clip(),
					(context.strokeStyle = '#000'),
					(context.fillStyle = 'transparent'),
					context.stroke();
				context.fillRect(0, 0, width, height);
				context.beginPath(),
					path(World),
					(context.strokeStyle = '#000'),
					(context.fillStyle = 'transparent'),
					context.fill(),
					context.stroke();
			}
		}
	});
</script>

<div class="flex">
	<div class="w-1/3 bg-red-100">Titles card</div>
	<div class="h-150 w-2/3" bind:clientWidth={width} bind:clientHeight={height}>
		<canvas bind:this={canvas} {width} {height}></canvas>
	</div>
</div>
