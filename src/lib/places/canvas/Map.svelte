<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import { getContext, onDestroy, onMount } from 'svelte';

	type MapContext = {
		register: (fn: (ctx: CanvasRenderingContext2D) => void) => void;
		deregister: (fn: (ctx: CanvasRenderingContext2D) => void) => void;
		invalidate: () => void;
	};

	const { register, deregister, invalidate } = getContext<MapContext>('map');
	let { World, initTranslate, initScale, initCenter, w, h } = $props();
	let graticule = d3.geoGraticule10();
	let outline = { type: 'Sphere' };

	let projection = $derived(
		d3
			.geoNaturalEarth1()
			.fitSize([w, h], World)
			.scale(initScale)
			.center(initCenter)
			.translate(initTranslate)
	);

	let borderProjection = $derived(
		d3
			.geoNaturalEarth1()
			.fitSize([w, h], World)
			.scale(w / 6)
			.center([0, 0])
			.translate([w / 2, h / 2])
	);

	function draw(ctx: CanvasRenderingContext2D) {
		const geoPathGenerator = d3.geoPath(projection, ctx);
		const borderPathGenerator = d3.geoPath(borderProjection, ctx);
		ctx.beginPath(),
			borderPathGenerator(outline),
			ctx.clip(),
			(ctx.strokeStyle = 'black'),
			(ctx.lineWidth = 5),
			(ctx.fillStyle = 'transparent'),
			ctx.stroke();

		ctx.beginPath(),
			geoPathGenerator(World),
			(ctx.strokeStyle = 'black'),
			(ctx.lineWidth = 0.5),
			(ctx.fillStyle = 'white'),
			ctx.stroke();
		ctx.fill();

		ctx.beginPath(),
			borderPathGenerator(outline),
			ctx.clip(),
			(ctx.strokeStyle = 'black'),
			(ctx.lineWidth = 5),
			(ctx.fillStyle = 'transparent'),
			ctx.stroke();
	}

	onMount(() => {
		register(draw);
		invalidate();
	});

	onDestroy(() => {
		deregister(draw);
	});

	$effect(() => {
		if (projection) {
			invalidate();
		}
	});
</script>
