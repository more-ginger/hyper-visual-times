<script lang="ts">
	import { getContext, onDestroy, onMount } from 'svelte';
	import type { MapContext } from '../../../types';

	const { register, deregister, invalidate } = getContext<MapContext>('map');
	let {
		node,
		projection,
		primaryCountryKey,
		colors,
		onFeaturesDraw,
		priority,
		currentNode
	} = $props();

	let localCtx: CanvasRenderingContext2D | null = $state(null);
	const centroid = $derived(node ? projection([node.coords[1], node.coords[0]]) : null);

	function determinePrimaryCountryCentroid() {
		if (node.country === primaryCountryKey) {
			onFeaturesDraw({
				centroid: node ? [node.coords[1], node.coords[0]] : null
			});
		}
	}

	function draw(ctx: CanvasRenderingContext2D) {
		localCtx = ctx;
		if (
			centroid &&
			(node.country === primaryCountryKey ||
			(currentNode && node.country === currentNode.country))
		) {
			ctx.translate(centroid[0], centroid[1]);
			ctx.beginPath();
			ctx.arc(0, 0, 10, 0, Math.PI * 2);
			ctx.strokeStyle = 'red';
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(0, 0, 3, 0, Math.PI * 2);
			ctx.fillStyle = 'red';
			ctx.strokeStyle = colors.darkAccentHex;
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.fill();

			if (projection.scale() >= 400) {
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
