<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import Canvas from '$lib/places/canvas/Canvas.svelte';
	import Map from '$lib/places/canvas/Map.svelte';
	import World from '../../content/data/places/world.json';
	import CountryDot from './canvas/CountryFeature.svelte';
	import LinkBetweenCountries from './canvas/LinkBetweenCountries.svelte';
	import { tick } from 'svelte';

	const { nodes, links, selectedOutlet, primaryCountryKey } = $props();
	let w = $state(0);
	let h = $state(0);
	let initCenter = $state([0, 0]);
	let initScale = $state(0);
	let initTranslate = $state([0, 0]);
	let newCenter = $state([0, 0]);

	const darkAccentHex = $derived(selectedOutlet === 'zeit' ? '#0036AC' : '#ECA547');
	const lightAccentHex = $derived(selectedOutlet === 'zeit' ? '#D9E5FF' : '#FFE8BA');

	const linkWeightDomain = $derived(d3.extent(links.map((link) => link.weight)));
	const linksMode = $derived(d3.mode(links.map((link) => link.weight)));

	let projection = $derived(
		d3
			.geoNaturalEarth1()
			.fitSize([w, h], World)
			.scale(initScale)
			.center(initCenter)
			.translate(initTranslate)
	);

	let borderProjection = $derived(
		d3
			.geoNaturalEarth1()
			.fitSize([w, h], World)
			.scale(w / 6)
			.center([0, 0])
			.translate([w / 2, h / 2])
	);

	function revertZoom() {
		initCenter = [0, 0];
		initScale = w / 6;
		initTranslate = [w / 2, h / 2];
	}

	function zoomToCountry() {
		initCenter = newCenter;
		initScale = w / 2;
	}

	function extractCurrentFeature(iso: string) {
		const currentNodeFeature = World.features.find((feature) => {
			return feature.properties.adm0_iso === iso;
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
		if (newCenter) {
			zoomToCountry();
		}
	});
</script>

<div class="relative">
	<div class="h-150 w-full rounded-xl" bind:clientWidth={w} bind:clientHeight={h}>
		<Canvas {w} {h} contextName={'map'}>
			<Map
				{World}
				{projection}
				{borderProjection}
				{w}
				{h}
				{primaryCountryKey}
				colors={{ darkAccentHex, lightAccentHex }}
			/>
			{#each nodes as node}
				<Map
					{World}
					{projection}
					{borderProjection}
					{w}
					{h}
					{primaryCountryKey}
					feature={extractCurrentFeature(node.iso)}
					colors={{ darkAccentHex, lightAccentHex }}
				/>
				<CountryDot
					{node}
					feature={extractCurrentFeature(node.iso)}
					{projection}
					{borderProjection}
					{primaryCountryKey}
					colors={{ darkAccentHex, lightAccentHex }}
					{onFeaturesDraw}
				/>
			{/each}

			{#each links as link}
				<LinkBetweenCountries
					{link}
					{projection}
					{borderProjection}
					sfeature={extractCurrentFeature(link.source_iso)}
					tfeature={extractCurrentFeature(link.target_iso)}
					{linkWeightDomain}
					colors={{ darkAccentHex, lightAccentHex }}
				/>
			{/each}
		</Canvas>
	</div>
	<div class="absolute bottom-0 h-100 w-80">
		<div class="mb-2">
			<button
				class="bg-ivory-default"
				onclick={() => {
					revertZoom();
				}}>Zoom out</button
			>
			<button
				class="bg-ivory-default"
				onclick={() => {
					zoomToCountry();
				}}>Zoom to country</button
			>
		</div>
		<div class="bg-ivory-default border-ivory-dark h-full rounded-xl border">
			<div class="h-14 border-b">
				<p class="m-2">
					Countries sharing coverage with {primaryCountryKey} in {selectedOutlet}
				</p>
			</div>
			<div class="h-83 overflow-scroll p-2">
				{#each nodes as node}
					{#if node.country !== primaryCountryKey}
						<div>{node.country}</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>
