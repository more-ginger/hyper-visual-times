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

	let initialProjectionVariables: {
		scale: number;
		translate: number[];
		center: number[];
	} = $state({
		scale: 0,
		translate: [0, 0],
		center: [0, 0]
	});

	let start: number | undefined;
	let panProgress: number | undefined = $state(0);
	let isAnimationRunning: boolean = $state(false);

	let startScaleAnimation: number | undefined;
	let isScaleAnimationRunning: boolean = $state(false);

	let isZoomedOut: boolean = $state(false);
	let currentLatPos = $state(0);
	let currentLongPos = $state(0);
	let currentFeatureCentroid: number[] | null = $state(null);
	let currentCenter = $derived([currentLatPos, currentLongPos]);

	const darkAccentHex = $derived(selectedOutlet === 'zeit' ? '#0036AC' : '#ECA547');
	const lightAccentHex = $derived(selectedOutlet === 'zeit' ? '#D9E5FF' : '#FFE8BA');

	let isListMode: boolean = $state(true);
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
		currentLatPos = 0;
		currentLongPos = 0;
		initialProjectionVariables.center = [0, 0];
		initialProjectionVariables.scale = w / 6;

		//requestAnimationFrame(panToCenter);
	}

	function zoomToCountry() {
		initialProjectionVariables.scale = w / 2;
		if (currentFeatureCentroid !== null) {
			initialProjectionVariables.center = currentFeatureCentroid;
			requestAnimationFrame(panToCenter);
		}
	}

	function scaleToCountry(timestamp: number) {
		if (!isScaleAnimationRunning && !isAnimationRunning) {
			startScaleAnimation = undefined;
		}

		if (startScaleAnimation === undefined) {
			startScaleAnimation = timestamp;
			isScaleAnimationRunning = true;
		}

		const initialScale = w / 6; // Starting scale
		const targetScale = w / 2; // Target scale
		const elapsed = timestamp - startScaleAnimation;
		const duration = 1000; // Animation duration in ms
		const progress = Math.min(elapsed / duration, 1);
		const easedProgress = easeInOutQuad(progress);

		// Interpolate between initial and target scale
		initialProjectionVariables.scale = initialScale + (targetScale - initialScale) * easedProgress;

		if (progress < 1) {
			requestAnimationFrame(scaleToCountry);
			isScaleAnimationRunning = true;
		} else {
			start = undefined;
			isScaleAnimationRunning = false;
		}
	}

	function extractCurrentNode(node: countryDataForComparison) {
		currentNode = node;
	}

	function onFeaturesDraw(data: { centroid: [number] }) {
		currentFeatureCentroid = data.centroid;
	}

	function onCardReset() {
		if (!isListMode) {
			currentNode = null;
			isListMode = true;
		}
	}

	function onPrimaryCountryChange(data: { key: string }) {
		onDropdownChange(data.key);
	}

	let initialLat = initialProjectionVariables.center[0];
	let initialLong = initialProjectionVariables.center[1];

	function panToCenter(timestamp: number) {
		if (!isScaleAnimationRunning && !isAnimationRunning) {
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
		const duration = 1000; // Animation duration in ms (adjust as needed)
		const progress = Math.min(elapsed / duration, 1);
		// Apply easing (e.g., ease-in-out)
		const easedProgress = easeInOutQuad(progress);

		// Linear interpolation for both coordinates
		currentLatPos = initialLat + (endLat - initialLat) * easedProgress;
		currentLongPos = initialLong + (endLong - initialLong) * easedProgress;

		if (progress < 1) {
			requestAnimationFrame(panToCenter);
			isAnimationRunning = true;
			panProgress = progress;
		} else {
			start = undefined;
			isAnimationRunning = false;
			panProgress = undefined;
		}
	}

	// Example easing function (ease-in-out quadratic)
	function easeInOutQuad(t: number): number {
		return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
	}

	onMount(() => {
		initialProjectionVariables.translate = [w / 2, h / 2];
		initialProjectionVariables.scale = w / 6;
	});

	$effect(() => {
		if (isZoomedOut) {
			revertZoom();
		} else {
			if (nodes[0][`count_${selectedOutlet}`] > 0) {
				console.log('effect zoomToCountry');
				zoomToCountry();
			} else {
				if (nodes[0][`count_${selectedOutlet}`] === 0) {
					revertZoom();
				}
			}
		}

		if (primaryCountryKey) {
			currentNode = null;
			isListMode = true;
		}
	});
</script>

<div class="relative h-220 md:h-140">
	<div class="h-100 w-full rounded-xl lg:h-150" bind:clientWidth={w} bind:clientHeight={h}>
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
				<DataPlaceholder {w} {h} colors={{ darkAccentHex, lightAccentHex }} />
			{/if}
		</Canvas>
	</div>
	<div class="md:absolute md:bottom-0 md:left-0 md:w-80">
		<div class="mb-2">
			<button
				disabled={isZoomedOut || panProgress !== undefined}
				class="bg-ivory-default disabled:border-gray-500 disabled:text-gray-500"
				onclick={() => {
					isZoomedOut = true;
					//revertZoom();
				}}>- Zoom out</button
			>
			<button
				disabled={!isZoomedOut}
				class="bg-ivory-default disabled:border-gray-500 disabled:text-gray-500"
				onclick={() => {
					isZoomedOut = false;
					requestAnimationFrame(scaleToCountry);
					//zoomToCountry();
				}}>+ Zoom to selection</button
			>
		</div>
		<div class="bg-ivory-default/50 border-ivory-dark h-full rounded-xl border backdrop-blur-sm">
			{#if isListMode}
				<div>
					<div class="h-14 border-b text-center italic">
						<p class="m-2">
							There are {nodes.length} countries sharing coverage with {primaryCountryKey ===
							'The Democratic Republic of the Congo'
								? 'DR of Congo'
								: primaryCountryKey} in {selectedOutlet === 'zeit'
								? 'Zeit Online'
								: 'The New York Times'}
						</p>
					</div>
					<div class="h-83 overflow-scroll py-4">
						{#each orderedListOfNodes as node, n}
							{#if node.country !== primaryCountryKey}
								<div
									class="cursor-crosshair border-t px-2 py-3 hover:bg-white hover:shadow-sm"
									role="button"
									tabindex="0"
									onmouseenter={() => {
										extractCurrentNode(node);
									}}
									onmouseleave={() => {
										currentNode = null;
									}}
								>
									<div>
										<div class="flex justify-between">
											<h5 class="max-w-[140px] truncate">#{n + 1} {node.country}</h5>
											<button
												class="left-0 transition-all hover:-translate-y-0.5 hover:shadow-sm"
												onclick={() => {
													isListMode = false;
												}}
												>Browse {node.shared_articles.length} articles
												<img class="mx-auto inline" src="icons/ui-forward.svg" alt="arrow right" />
											</button>
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
