<script lang="ts">
	import type { countryDataForComparison } from '../../types';
	import { onMount } from 'svelte';
	import Dropdown from '$lib/common/Dropdown.svelte';

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
	let primaryCountry = $state(dropdownData.find((d: { key: string }) => d.key == 'Japan'));

	let primaryCountryKey = $state(primaryCountry.key);

	function onDropdownChange(data: string) {
		let newPrimaryCountry = dropdownData.find((d: { key: string }) => d.key == data);
		primaryCountryKey = newPrimaryCountry.key;
	}

	let nodes = $derived.by(() => {
		let overlaps: Record<string, countryDataForComparison[]> = {};
		if (primaryCountry) {
			const a = data.find((d: { country: string }) => d.country == primaryCountryKey);
			a.shared_articles = [];
			//a.priority = 1;
			outlets.forEach((outlet: string) => {
				const outletArray: countryDataForComparison[] = [a];
				for (let index = 0; index < data.length; index++) {
					const b = data[index];
					if (a.country == b.country) continue;
					const aArticles = new Set(a[`ids_of_articles_${outlet}`]);
					const bArticles = new Set(b[`ids_of_articles_${outlet}`]);
					const shared_articles = [...aArticles].filter((k) => bArticles.has(k));

					if (shared_articles.length > 0) {
						//b.priority = 0;
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
								source_iso: nodesOutlet[i].iso,
								target_iso: nodesOutlet[j].iso,
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
	<div class="mr-10 flex w-full justify-between">
		<div>
			<h5>
				What other countries share coverage with
				<span>
					<Dropdown availableFilter={dropdownData} bind:selected={primaryCountryKey} />
				</span>
				?
			</h5>
		</div>
		<div>
			<div class="flex justify-end">
				<div class="m-2">
					<button
						class={selectedOutlet === outlets[0] ? `bg-zeit-light` : `bg-default`}
						onclick={() => {
							selectedOutlet = outlets[0];
						}}>Zeit</button
					>
				</div>
				<img class="inline" src="icons/ui-switch.svg" alt="Switch with The New York Times" />
				<div class="m-2">
					<button
						class={selectedOutlet === outlets[1] ? `bg-nyt-light` : `bg-default`}
						onclick={() => {
							selectedOutlet = outlets[1];
						}}>The New York Times</button
					>
				</div>
			</div>
		</div>
	</div>
</div>
{#if primaryCountryKey}
	<div class="w-full">
		<div class="w-full">
			{#if selectedOutlet}
				{#await import('./NetworkCanvas.svelte') then { default: NetworkCanvas }}
					<NetworkCanvas
						nodes={nodes[selectedOutlet]}
						links={links[selectedOutlet]}
						{selectedOutlet}
						{primaryCountryKey}
						{onDropdownChange}
					/>
				{/await}
			{/if}
		</div>
	</div>
{/if}
