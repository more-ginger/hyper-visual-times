<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import { getContext, onDestroy, onMount } from 'svelte';

	type MapContext = {
		register: (fn: (ctx: CanvasRenderingContext2D) => void) => void;
		deregister: (fn: (ctx: CanvasRenderingContext2D) => void) => void;
		transition: (
			duration: number,
			onUpdate: (progress: number) => void,
			onComplete?: (progress: number) => void
		) => void;
		invalidate: () => void;
	};

	const { register, deregister, invalidate } = getContext<MapContext>('map');
	let { World, projection, borderProjection, primaryCountryKey, colors = undefined } = $props();
	let outline = { type: 'Sphere' };

	function draw(ctx: CanvasRenderingContext2D) {
		const geoPathGenerator = d3.geoPath(projection, ctx);
		const borderPathGenerator = d3.geoPath(borderProjection, ctx);

		ctx.beginPath(), borderPathGenerator(outline);
		ctx.clip();
		ctx.strokeStyle = colors.darkAccentHex;
		ctx.lineWidth = 2;
		ctx.fillStyle = 'transparent';
		ctx.stroke();

		ctx.beginPath();
		geoPathGenerator(World);
		ctx.strokeStyle = colors.darkAccentHex;
		ctx.lineWidth = 0.7;
		ctx.stroke();

		ctx.beginPath();
		borderPathGenerator(outline);
		ctx.clip();
		ctx.strokeStyle = colors.darkAccentHex;
		ctx.lineWidth = 2;
		ctx.fillStyle = 'transparent';
		ctx.stroke();
	}

	// boiler plate for in-canvas transition
	// function animateCircle() {
	// 	transition(
	// 		1000,
	// 		(progress) => {
	// 			const eased = -Math.cos(progress * Math.PI) / 2 + 0.5;
	// 			x = eased * 200;
	// 			y = eased * 200;
	// 			invalidate();
	// 		},
	// 		() => {
	// 			console.log('Animation Complete');
	// 		}
	// 	);
	// }

	onMount(() => {
		register(draw);
		//animateCircle();
		invalidate();
	});

	onDestroy(() => {
		deregister(draw);
	});

	$effect(() => {
		if (projection || primaryCountryKey) {
			invalidate();
		}
	});
</script>
