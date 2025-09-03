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

		ctx.beginPath(),
			borderPathGenerator(outline),
			ctx.clip(),
			(ctx.fillStyle = 'transparent'),
			ctx.stroke();

		if (node.country === primaryCountryKey) {
			ctx.beginPath(), geoPathGenerator(feature), (ctx.fillStyle = 'red'), ctx.fill();
		} else {
			ctx.beginPath(),
				geoPathGenerator(feature),
				(ctx.fillStyle = colors.lightAccentHex),
				ctx.fill();
		}

		ctx.translate(centroid[0], centroid[1]);
		ctx.beginPath(),
			ctx.arc(0, 0, 2, 0, 2 * Math.PI),
			(ctx.fillStyle = colors.darkAccentHex),
			ctx.fill(),
			(ctx.strokeStyle = 'white'),
			ctx.stroke();
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
