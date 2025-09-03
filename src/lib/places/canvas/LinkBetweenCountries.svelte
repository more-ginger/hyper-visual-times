<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';

	import { getContext, onDestroy, onMount } from 'svelte';
	import type { MapContext } from '../../../types';

	const { register, deregister, invalidate } = getContext<MapContext>('map');
	const { link, sfeature, tfeature, projection, borderProjection, colors, linkWeightDomain } =
		$props();
	let localCtx: CanvasRenderingContext2D | null = $state(null);
	let outline = { type: 'Sphere' };

	const geoPathGenerator = $derived(d3.geoPath(projection, localCtx));
	const borderPathGenerator = $derived(d3.geoPath(borderProjection, localCtx));

	const sourceCentroid = $derived(geoPathGenerator.centroid(sfeature));
	const targetCentroid = $derived(
		tfeature ? projection([tfeature.properties.label_x, tfeature.properties.label_y]) : [0, 0]
	);

	const linkWeightScale = $derived(d3.scaleLog().domain(linkWeightDomain).range([0.4, 5]).base(2));

	function draw(ctx: CanvasRenderingContext2D) {
		localCtx = ctx;

		ctx.beginPath(), borderPathGenerator(outline);
		ctx.clip();
		ctx.fillStyle = 'transparent';
		ctx.stroke();

		if (sfeature && tfeature) {
			ctx.beginPath();
			ctx.moveTo(sourceCentroid[0], sourceCentroid[1]);
			ctx.lineTo(targetCentroid[0], targetCentroid[1]);
			ctx.lineWidth = linkWeightScale(link.weight);
			ctx.globalAlpha = link.priority > 0 ? 0.7 : 0;
			ctx.strokeStyle = colors.darkAccentHex;
			ctx.stroke();

			ctx.translate(targetCentroid[0], targetCentroid[1]);
			ctx.beginPath();
			ctx.arc(0, 0, 3, 0, 2 * Math.PI);
			ctx.globalAlpha = 1;
			ctx.fillStyle = colors.darkAccentHex;
			ctx.fill();
		}
	}

	onMount(() => {
		register(draw);
		invalidate();
	});

	onDestroy(() => {
		deregister(draw);
	});

	$effect(() => {
		if (link) {
			invalidate();
		}
	});
</script>
