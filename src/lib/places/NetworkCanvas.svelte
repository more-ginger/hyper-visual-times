<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import Canvas from '$lib/places/canvas/Canvas.svelte';
	import Map from '$lib/places/canvas/Map.svelte';
	import MapBorder from '$lib/places/canvas/MapBorder.svelte';
	import World from '../../content/data/places/world.json';

	const { nodes, links, selectedOutlet, primaryCountryKey } = $props();
	let w = $state(0);
	let h = $state(0);
	let initCenter = $state([0, 0]);
	let initScale = $state(1900);
	let initTranslate = $state([0, 0]);

	function testCenterMap() {
		console.log('!');
		//initTranslate = [100, 100];
		initCenter = [13.42, 52.54];
		initScale = w / 3;
	}

	onMount(() => {
		initTranslate = [w / 2, h / 2];
		initScale = w / 6;
		//initCenter = [13.42, 52.54];
	});
</script>

<div class="relative">
	<button
		onclick={() => {
			testCenterMap();
		}}>Center</button
	>
	<div class="h-150 w-full rounded-xl" bind:clientWidth={w} bind:clientHeight={h}>
		<Canvas {w} {h} contextName={'map'}>
			<MapBorder {World} {w} {h} />

			<Map {World} {initTranslate} {initScale} {initCenter} {w} {h} />
		</Canvas>
	</div>
</div>
