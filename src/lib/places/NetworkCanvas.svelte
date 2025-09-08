<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import Canvas from '$lib/places/canvas/Canvas.svelte';
	import Map from '$lib/places/canvas/Map.svelte';

	import World from '../../content/data/places/world.json';
	import CountryFeature from './canvas/CountryFeature.svelte';
	import LinkBetweenCountries from './canvas/LinkBetweenCountries.svelte';
	import CountryCard from './CountryCard.svelte';
	import DataPlaceholder from './canvas/DataPlaceholder.svelte';

	const { nodes, links, selectedOutlet, primaryCountryKey, onDropdownChange } = $props();
	let w = $state(0);
	let h = $state(0);
	let start: number;
	let initialProjectionVariables = $state({
		scale: 0,
		translate: [0, 0],
		center: [0, 0]
	});

	let currentLatPos = $state(0);
	let currentLongPos = $state(0);
	let currentCenter = $derived([currentLatPos, currentLongPos]);

	const darkAccentHex = $derived(selectedOutlet === 'zeit' ? '#0036AC' : '#ECA547');
	const lightAccentHex = $derived(selectedOutlet === 'zeit' ? '#D9E5FF' : '#FFE8BA');
	let isListMode = $state(true);
	let currentNode = $state(null);

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

	function extractCurrentNode(node) {
		currentNode = node;
	}

	function extractCurrentFeature(iso: string) {
		const currentNodeFeature = World.features.find((feature) => {
			return feature.properties.adm0_iso === iso;
		});

		return currentNodeFeature;
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

	let count = 0;

	function panToCenter(timestamp: number) {
		if (start === undefined) {
			start = timestamp;
		}
		const elapsed = timestamp - start;
		const endLat = initialProjectionVariables.center[0];
		const endLong = initialProjectionVariables.center[1];
		const eased = -Math.cos(elapsed * Math.PI) / 2 + 0.5;

		count = count + 0.01 * eased;

		// do we need to count up or down from current position
		const weNeedToCountUp = endLat > currentLatPos;
		const weNeedToCountDown = endLong > currentLongPos;

		// if lat long are bigger we need to count up and take the min value
		// if lat long are smaller we need to count down and take the max value
		currentLatPos = weNeedToCountUp
			? Math.min(currentLatPos + count, endLat)
			: Math.max(currentLatPos - count, endLat);

		currentLongPos = weNeedToCountDown
			? Math.min(currentLongPos + count, endLong)
			: Math.max(currentLongPos - count, endLong);

		if (currentLatPos !== endLat || currentLongPos !== endLong) {
			requestAnimationFrame(panToCenter);
		}
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
			/>
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
			{#if nodes[0][`count_${selectedOutlet}`]}
				{#each nodes as node}
					<CountryFeature
						{node}
						feature={extractCurrentFeature(node.iso)}
						{projection}
						{borderProjection}
						{primaryCountryKey}
						colors={{ darkAccentHex, lightAccentHex }}
						{onFeaturesDraw}
					/>
				{/each}
			{:else}
				<DataPlaceholder {w} {h} />
			{/if}
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
					{#if primaryCountryKey}
						<CountryCard
							{primaryCountryKey}
							{currentNode}
							{selectedOutlet}
							{onCardReset}
							{onPrimaryCountryChange}
						/>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
