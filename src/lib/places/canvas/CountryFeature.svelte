<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import { getContext, onDestroy, onMount } from 'svelte';
	import type { MapContext } from '../../../types';

	const { register, deregister, invalidate } = getContext<MapContext>('map');
	let { node, feature, projection, borderProjection, primaryCountryKey, colors, onFeaturesDraw } =
		$props();
	let outline = { type: 'Sphere' };
	let localCtx: CanvasRenderingContext2D | null = $state(null);

	const geoPathGenerator = $derived(d3.geoPath(projection, localCtx));
	const borderPathGenerator = $derived(d3.geoPath(borderProjection, localCtx));
	const centroid = $derived(geoPathGenerator.centroid(feature));

	function determinePrimaryCountryCentroid() {
		if (node.country === primaryCountryKey) {
			onFeaturesDraw({
				centroid: [feature.properties.label_x, feature.properties.label_y]
			});
		}
	}

	function draw(ctx: CanvasRenderingContext2D) {
		localCtx = ctx;

		ctx.beginPath(), borderPathGenerator(outline);
		ctx.clip();
		ctx.fillStyle = 'transparent';
		ctx.stroke();

		if (node.country === primaryCountryKey) {
			ctx.beginPath();
			geoPathGenerator(feature);
			ctx.fillStyle = colors.lightAccentHex;
			ctx.fill();

			//const selectedCountryCentroid = geoPathGenerator(feature);

			ctx.translate(centroid[0], centroid[1]);
			ctx.beginPath();
			ctx.arc(0, 0, 3, 0, Math.PI * 2);
			ctx.fillStyle = colors.darkAccentHex;
			ctx.fill();
		}
	}

	onMount(() => {
		register(draw);
		invalidate();

		determinePrimaryCountryCentroid();
	});

	onDestroy(() => {
		deregister(draw);
	});

	$effect(() => {
		if (primaryCountryKey) {
			determinePrimaryCountryCentroid();
		}
		if (node) {
			invalidate();
		}
	});
</script>
