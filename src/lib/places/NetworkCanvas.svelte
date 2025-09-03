<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import Canvas from '$lib/places/canvas/Canvas.svelte';
	import Map from '$lib/places/canvas/Map.svelte';
	import World from '../../content/data/places/world.json';
	import CountryDot from './canvas/CountryDot.svelte';

	const { nodes, links, selectedOutlet, primaryCountryKey } = $props();
	let w = $state(0);
	let h = $state(0);
	let initCenter = $state([0, 0]);
	let initScale = $state(1900);
	let initTranslate = $state([0, 0]);
	let newCenter = $state([0, 0]);

	const darkAccentHex = $derived(selectedOutlet === 'zeit' ? '#0036AC' : '#ECA547');
	const lightAccentHex = $derived(selectedOutlet === 'zeit' ? '#D9E5FF' : '#FFE8BA');

	let projection = $derived(
		d3
			.geoNaturalEarth1()
			.fitSize([w, h], World)
			.scale(initScale)
			.center(initCenter)
			.translate(initTranslate)
	);

	function testCenterMap() {
		initCenter = newCenter;
		initScale = w / 3;
	}

	function extractCurrentFeature(node: { iso: string }) {
		const currentNodeFeature = World.features.find((feature) => {
			return feature.properties.adm0_iso === node.iso;
		});

		return currentNodeFeature;
	}

	function onFeaturesDraw(data: { centroid: [number] }) {
		newCenter = data.centroid;
	}

	onMount(() => {
		initTranslate = [w / 2, h / 2];
		initScale = w / 6;
	});

	$effect(() => {
		$inspect(newCenter);
		if (newCenter) {
			initCenter = newCenter;
			initScale = w / 3;
		}
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
			{#each nodes as node}
				<CountryDot
					{node}
					feature={extractCurrentFeature(node)}
					{projection}
					{primaryCountryKey}
					colors={{ darkAccentHex, lightAccentHex }}
					{onFeaturesDraw}
				/>
				<Map
					{World}
					{projection}
					{w}
					{h}
					feature={extractCurrentFeature(node)}
					colors={{ darkAccentHex, lightAccentHex }}
				/>
			{/each}
			<Map {World} {projection} {w} {h} colors={{ darkAccentHex, lightAccentHex }} />
		</Canvas>
	</div>
</div>
