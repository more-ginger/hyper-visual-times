<script lang="ts">
	import { getContext, onDestroy, onMount } from 'svelte';
	import type { MapContext } from '../../../types';
	const { register, deregister, invalidate } = getContext<MapContext>('map');
	let { w, h, colors } = $props();

	function draw(ctx: CanvasRenderingContext2D) {
		ctx.translate(w / 2, h / 2);
		const txt = 'No data for this outlet';

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

	onMount(() => {
		register(draw);
		invalidate();
	});

	onDestroy(() => {
		deregister(draw);
	});
</script>
