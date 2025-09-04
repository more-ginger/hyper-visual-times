<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import { getContext, onDestroy, onMount } from 'svelte';
	import type { MapContext } from '../../../types';

	const { register, deregister, invalidate } = getContext<MapContext>('map');
	let { node, feature, projection, borderProjection, primaryCountryKey, colors } = $props();
	let outline = { type: 'Sphere' };
	let localCtx: CanvasRenderingContext2D | null = $state(null);

	const geoPathGenerator = $derived(d3.geoPath(projection, localCtx));
	const borderPathGenerator = $derived(d3.geoPath(borderProjection, localCtx));

	function draw(ctx: CanvasRenderingContext2D) {
		localCtx = ctx;

		ctx.beginPath(), borderPathGenerator(outline);
		ctx.clip();
		ctx.fillStyle = 'transparent';
		ctx.stroke();

		ctx.beginPath();
		geoPathGenerator(feature);
		ctx.fillStyle = colors.lightAccentHex;
		ctx.fill();
	}

	onMount(() => {
		register(draw);
		invalidate();
	});

	onDestroy(() => {
		deregister(draw);
	});

	$effect(() => {
		if (node) {
			invalidate();
		}
	});
</script>

// color background for map
