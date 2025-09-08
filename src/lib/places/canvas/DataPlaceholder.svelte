<script lang="ts">
	import { getContext, onDestroy, onMount } from 'svelte';
	import type { MapContext } from '../../../types';
	const { register, deregister, invalidate } = getContext<MapContext>('map');
	let { w, h } = $props();

	function draw(ctx: CanvasRenderingContext2D) {
		ctx.translate(w / 2, h / 2);
		const txt = 'No data for this outlet';
		ctx.fillText(txt, 0, 0);
	}

	onMount(() => {
		register(draw);
		invalidate();
	});

	onDestroy(() => {
		deregister(draw);
	});
</script>
