<script lang="ts">
	import type { countryDataForComparison } from '../../types';
	import { onMount } from 'svelte';
	import Dropdown from '$lib/common/Dropdown.svelte';

	let { data, onMounted = () => {} } = $props();
	const outlets = ['zeit', 'nyt'];
	let selectedOutlet = $state(outlets[0]);
	let isHelp = $state(false);

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
	let primaryCountry = $state(dropdownData.find((d: { key: string }) => d.key == 'Germany'));

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
								source_coords: nodesOutlet[i].coords,
								target_coords: nodesOutlet[j].coords,
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

	function toggleHelp() {
		isHelp = !isHelp;
	}

	onMount(() => {
		onMounted();
	});
</script>

<div class="relative flex w-full">
	{#if isHelp}
		<div
			class="bg-ivory-default/75 absolute top-[6vh] left-[30vw] z-9000 w-90 rounded-sm border p-4 text-sm backdrop-blur-sm"
		>
			<p class="py-2">
				This visualization tool lets you explore coverage shared between geographic entities, namely
				articles that mention both. You can:
			</p>
			<ul class="list-inside list-decimal">
				<li class="pb-2">
					Use the dropdown menu <img
						class="inline rotate-180"
						src="/icons/ui-scroll.svg"
						alt="arrow up label"
					/>
					to select a new country or region.
				</li>
				<li class="pb-2">
					Use the toggle <img class="inline" src="/icons/ui-switch.svg" alt="switch label" /> at the
					top right of the screen to switch between outlets.
				</li>
				<li class="pb-2">
					Use the card <img class="inline" src="/icons/ui-interact.svg" alt="interact label" /> at the
					bottom left of the screen to see the shared coverage between two countries.
				</li>
				<li class="pb-2">
					Zoom in and out using the toggles <img
						class="inline"
						src="/icons/ui-interact.svg"
						alt="interact label"
					/> above the bottom left card. This will allow you to shift focus between a close view of the
					country and a broader overview.
				</li>
			</ul>
		</div>
	{/if}
	<div class="w-full lg:mr-10 lg:flex lg:justify-between">
		<h3 class="text-center font-serif text-xl lg:text-left">
			What other countries share coverage with
			<span>
				<Dropdown availableFilter={dropdownData} bind:selected={primaryCountryKey} />
			</span>
			?
			<span
				role="button"
				tabindex="0"
				aria-label="Show help"
				class="cursor-pointer rounded-xl border p-2 text-xs"
				onmouseenter={toggleHelp}
				onmouseleave={toggleHelp}>i</span
			>
		</h3>
		<div>
			<div class="flex justify-center p-2 lg:justify-end lg:p-0">
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
