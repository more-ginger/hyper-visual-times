<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import Canvas from '$lib/places/canvas/Canvas.svelte';
	import Map from '$lib/places/canvas/Map.svelte';

	import World from '../../content/data/places/world.json';
	import CountryFeature from './canvas/CountryFeature.svelte';
	import LinkBetweenCountries from './canvas/LinkBetweenCountries.svelte';
	import DataPlaceholder from './canvas/DataPlaceholder.svelte';
	import type { countryDataForComparison } from '../../types';

	const { nodes, links, selectedOutlet, primaryCountryKey, onDropdownChange } = $props();
	let w = $state(0);
	let h = $state(0);
	let start: number | undefined;
	let initialProjectionVariables = $state({
		scale: 0,
		translate: [0, 0],
		center: [0, 0]
	});

	let currentLatPos = $state(0);
	let currentLongPos = $state(0);
	let currentCenter = $derived([currentLatPos, currentLongPos]);
	let isAnimationRunning = $state(false);

	const darkAccentHex = $derived(selectedOutlet === 'zeit' ? '#0036AC' : '#ECA547');
	const lightAccentHex = $derived(selectedOutlet === 'zeit' ? '#D9E5FF' : '#FFE8BA');

	let isListMode = $state(true);
	let currentNode: countryDataForComparison | null = $state(null);

	const orderedListOfNodes = $derived(
		[...nodes].sort((a, b) => b.shared_articles.length - a.shared_articles.length)
	);

	const linkWeightDomain = $derived(
		d3.extent(links.map((link: { weight: string }) => link.weight))
	);

	let projection = $derived(
		d3
			.geoNaturalEarth1()
			.fitSize([w, h], World)
			.scale(initialProjectionVariables.scale)
			.center(currentCenter)
			.translate(initialProjectionVariables.translate)
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
		initialProjectionVariables.scale = w / 6;
		initialProjectionVariables.translate = [w / 2, h / 2];
	}

	function zoomToCountry() {
		initialProjectionVariables.scale = w / 2;

		if (
			currentLatPos !== initialProjectionVariables.center[0] ||
			currentLongPos !== initialProjectionVariables.center[1]
		) {
			requestAnimationFrame(panToCenter);
		}
	}

	function extractCurrentNode(node: countryDataForComparison) {
		console.log(node);
		currentNode = node;
	}

	function onFeaturesDraw(data: { centroid: [number] }) {
		initialProjectionVariables.center = data.centroid;
	}

	function onCardReset() {
		if (!isListMode) {
			isListMode = true;
		}
	}

	function onPrimaryCountryChange(data: { key: string }) {
		onDropdownChange(data.key);
	}

	let initialLat = initialProjectionVariables.center[0];
	let initialLong = initialProjectionVariables.center[1];

	function panToCenter(timestamp: number) {
		if (!isAnimationRunning) {
			start = undefined;
		}

		if (start === undefined) {
			start = timestamp;
			isAnimationRunning = true;
			// Store initial positions at the start of each animation
			initialLat = currentLatPos;
			initialLong = currentLongPos;
		}

		const endLat = initialProjectionVariables.center[0];
		const endLong = initialProjectionVariables.center[1];
		const elapsed = timestamp - start;
		const duration = 2000; // Animation duration in ms (adjust as needed)
		const progress = Math.min(elapsed / duration, 1);
		// Apply easing (e.g., ease-in-out)
		const easedProgress = easeInOutQuad(progress);

		// Linear interpolation for both coordinates
		currentLatPos = initialLat + (endLat - initialLat) * easedProgress;
		currentLongPos = initialLong + (endLong - initialLong) * easedProgress;

		if (progress < 1) {
			requestAnimationFrame(panToCenter);
			isAnimationRunning = true;
		} else {
			start = undefined;
			isAnimationRunning = false;
		}
	}

	// Example easing function (ease-in-out quadratic)
	function easeInOutQuad(t: number): number {
		return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
	}

	onMount(() => {
		initialProjectionVariables.translate = [w / 2, h / 2];
		initialProjectionVariables.scale = w / 6;
		currentLatPos = initialProjectionVariables.center[0];
		currentLongPos = initialProjectionVariables.center[1];
	});

	$effect(() => {
		if (initialProjectionVariables.center && nodes[0][`count_${selectedOutlet}`] > 0) {
			zoomToCountry();
		}

		if (nodes[0][`count_${selectedOutlet}`] === 0) {
			initialProjectionVariables.scale = w / 6;
			currentLatPos = 0;
			currentLongPos = 0;
		}

		if (primaryCountryKey) {
			isListMode = true;
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
				{primaryCountryKey}
				colors={{ darkAccentHex, lightAccentHex }}
				priority={0}
			/>
			{#each links as link}
				<LinkBetweenCountries
					{link}
					{projection}
					{borderProjection}
					{primaryCountryKey}
					{currentNode}
					{linkWeightDomain}
					colors={{ darkAccentHex, lightAccentHex }}
					priority={1}
				/>
			{/each}
			{#if nodes[0][`count_${selectedOutlet}`]}
				{#each nodes as node}
					<CountryFeature
						{node}
						{projection}
						{borderProjection}
						{primaryCountryKey}
						{currentNode}
						colors={{ darkAccentHex, lightAccentHex }}
						{onFeaturesDraw}
						priority={2}
					/>
				{/each}
			{:else}
				<DataPlaceholder {w} {h} />
			{/if}
		</Canvas>
	</div>
	<div class="absolute right-0 bottom-10 h-100 w-80">
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
		<div class="bg-ivory-default/50 border-ivory-dark h-full rounded-xl border backdrop-blur-sm">
			{#if isListMode}
				<div>
					<div class="h-14 border-b">
						<p class="m-2">
							Countries sharing coverage with {primaryCountryKey} in {selectedOutlet}
						</p>
					</div>
					<div class="h-83 overflow-scroll p-2">
						{#each orderedListOfNodes as node, n}
							{#if node.country !== primaryCountryKey}
								<div class="py-2">
									<div>
										<div class="flex justify-between">
											<h5>#{n + 1} {node.country}</h5>
											<button
												onclick={() => {
													isListMode = false;
													extractCurrentNode(node);
												}}
												>{node.shared_articles.length} shared articles
												<img class="mx-auto inline" src="icons/ui-forward.svg" alt="arrow right" />
											</button>
										</div>
										<div>
											<p>Keywords</p>
										</div>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{:else}
				<div>
					{#await import('./CountryCard.svelte') then { default: CountryCard }}
						{#if primaryCountryKey}
							<CountryCard
								{primaryCountryKey}
								{currentNode}
								{selectedOutlet}
								{onCardReset}
								{onPrimaryCountryChange}
							/>
						{/if}
					{/await}
				</div>
			{/if}
		</div>
	</div>
</div>
