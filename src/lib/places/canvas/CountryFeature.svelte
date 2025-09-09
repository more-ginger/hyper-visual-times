<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import { getContext, onDestroy, onMount } from 'svelte';
	import type { MapContext } from '../../../types';

	const { register, deregister, invalidate } = getContext<MapContext>('map');
	let {
		node,
		projection,
		borderProjection,
		primaryCountryKey,
		colors,
		onFeaturesDraw,
		priority,
		currentNode
	} = $props();
	let outline = { type: 'Sphere' };
	let localCtx: CanvasRenderingContext2D | null = $state(null);

	const borderPathGenerator = $derived(d3.geoPath(borderProjection, localCtx));
	const centroid = $derived(node ? projection([node.coords[1], node.coords[0]]) : [0, 0]);

	function determinePrimaryCountryCentroid() {
		if (node.country === primaryCountryKey) {
			onFeaturesDraw({
				centroid: node ? [node.coords[1], node.coords[0]] : [0, 0]
			});
		}
	}

	function draw(ctx: CanvasRenderingContext2D) {
		localCtx = ctx;

		ctx.beginPath(), borderPathGenerator(outline);
		ctx.clip();
		ctx.fillStyle = 'transparent';
		ctx.stroke();

		if (
			node.country === primaryCountryKey ||
			(currentNode && node.country === currentNode.country)
		) {
			ctx.translate(centroid[0], centroid[1]);
			ctx.beginPath();
			ctx.arc(0, 0, 10, 0, Math.PI * 2);
			ctx.strokeStyle = 'red';
			ctx.stroke();

			if (projection.scale() > 400) {
				const txt = node.country;

				const metrics = ctx.measureText(txt);
				const width = metrics.width;
				const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

				ctx.fillStyle = 'white';
				ctx.strokeStyle = colors.darkAccentHex;
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.roundRect(
					-width / 2 - 4,
					-fontHeight - metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent - 4.5,
					width + 8,
					fontHeight + 6,
					20
				);
				ctx.stroke();
				ctx.fill();

				ctx.fillStyle = colors.darkAccentHex;
				ctx.fillText(txt, -width / 2, -fontHeight);
			}
		}
	}

	onMount(() => {
		register(draw, priority);
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
