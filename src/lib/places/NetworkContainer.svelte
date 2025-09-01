<script lang="ts">
	import type { countryDataForComparison } from '../../types';
	import { onMount } from 'svelte';
	import Dropdown from '$lib/common/Dropdown.svelte';
	import NetworkMap from './NetworkMap.svelte';
	import Network from './Network.svelte';
	// @ts-expect-error
	import { extent } from 'd3-array';
	let { data, onMounted = () => {} } = $props();
	const outlets = ['zeit', 'nyt'];
	let selectedOutlet = $state(outlets[0]);

	// The first dropdown lets the user
	// select the primary country for analysis
	const dropdownData = $state(
		data
			.map((d: countryDataForComparison) => {
				return {
					key: d.country,
					count: d.count_zeit + d.count_nyt
				};
			})
			.sort((a: { key: string }, b: { key: string }) => a.key.localeCompare(b.key))
	);

	// Set the primary country to calc overlaps
	let primaryCountry = dropdownData.find((d: { key: string }) => d.key == 'United Kingdom');
	let primaryCountryKey = $state(primaryCountry.key);

	const dataDomain = $derived(
		extent(data.map((d: countryDataForComparison) => [d.count_nyt, d.count_zeit]).flat())
	);

	let nodes = $derived.by(() => {
		let overlaps: Record<string, countryDataForComparison[]> = {};
		if (primaryCountry) {
			const a = data.find((d: { country: string }) => d.country == primaryCountryKey);
			a.shared_articles = [];
			a.priority = 1;
			outlets.forEach((outlet: string) => {
				const outletArray: countryDataForComparison[] = [a];
				for (let index = 0; index < data.length; index++) {
					const b = data[index];
					if (a.country == b.country) continue;
					const aArticles = new Set(a[`ids_of_articles_${outlet}`]);
					const bArticles = new Set(b[`ids_of_articles_${outlet}`]);
					const shared_articles = [...aArticles].filter((k) => bArticles.has(k));

					if (shared_articles.length > 0) {
						b.priority = 0;
						outletArray.push({ ...b, shared_articles });
					}
				}
				overlaps[outlet] = outletArray;
			});
		}
		return overlaps;
	});

	let links = $derived.by(() => {
		const links: Record<string, { source: string; target: string; weight: number }[]> = {};

		const haveOverlap = (setA: Set<string>, setB: Set<string>) => {
			for (const id of setA) {
				if (setB.has(id)) return true;
			}
			return false;
		};

		const countOverlap = (setA: Set<string>, setB: Set<string>) => {
			let counter = 0;
			for (const id of setA) {
				if (setB.has(id)) {
					counter += 1;
				}
			}
			return counter;
		};

		Object.keys(nodes).forEach((outlet) => {
			const linksArray = [];
			const seenPairs = new Set();
			const nodesOutlet = nodes[outlet] as countryDataForComparison[];
			for (let i = 0; i < nodesOutlet.length; i++) {
				for (let j = 0; j < nodesOutlet.length; j++) {
					if (i === j) continue;
					const idsA = new Set<string>(nodesOutlet[i][`ids_of_articles_${outlet}`]);
					const idsB = new Set<string>(nodesOutlet[j][`ids_of_articles_${outlet}`]);

					if (haveOverlap(idsA, idsB)) {
						const countryA = nodesOutlet[i].country;
						const countryB = nodesOutlet[j].country;
						const pairKey = [countryA, countryB].sort().join('::');

						if (!seenPairs.has(pairKey)) {
							seenPairs.add(pairKey);
							linksArray.push({
								source: nodesOutlet[i].country,
								target: nodesOutlet[j].country,
								weight: countOverlap(idsA, idsB),
								priority: nodesOutlet[i].country === primaryCountryKey ? 1 : 0
							});
						}
					}
				}
			}

			links[outlet] = linksArray;
		});

		return links;
	});

	onMount(() => {
		onMounted();
	});
</script>

<div class="flex w-full">
	<div class="mr-10 w-2/3 bg-yellow-100">
		<div class="mt-4 border-b">
			<h5>
				What other countries share coverage with
				<span>
					<Dropdown availableFilter={dropdownData} bind:selected={primaryCountryKey} />
				</span>
				?
			</h5>
		</div>
		<div>
			<!-- <p>
				The two networks visualizations show the coverage directly shared between {primaryCountryKey}
				and other countries. Interact with the nodes to see how coutries are connected with each other
				in relation to {primaryCountryKey}. Use the dropdown menu above to switch primary country.
			</p> -->
		</div>
	</div>
	<div class="mr-10 w-1/3 bg-green-100">
		<div class="mt-4 border-b">Legend</div>
	</div>
</div>
{#if primaryCountryKey}
	{#if selectedOutlet}
		<div class="w-full">
			<div class="flex w-full justify-end bg-yellow-100">
				<div class="m-2">
					<button
						onclick={() => {
							selectedOutlet = outlets[0];
						}}>Zeit</button
					>
				</div>
				<div class="m-2">
					<button
						onclick={() => {
							selectedOutlet = outlets[1];
						}}>The New York Times</button
					>
				</div>
			</div>
			<NetworkMap
				nodes={nodes[selectedOutlet]}
				links={links[selectedOutlet]}
				{selectedOutlet}
				{primaryCountryKey}
			/>
		</div>
	{/if}
	<!-- <div class="flex">
		{#each outlets as outlet}
			<div class="w-1/2">
				<Network
					nodes={nodes[outlet]}
					links={links[outlet]}
					{outlet}
					{dataDomain}
					{primaryCountryKey}
				/>
			</div>
		{/each}
	</div> -->
{/if}
