<script lang="ts">
	import BubbleChart from '$lib/topics/BubbleChart.svelte';
	import ClusterBarchart from '$lib/topics/ClusterBarchart.svelte';
	import ClusterNetwork from '$lib/topics/ClusterNetwork.svelte';
	import NetworkCard from '$lib/topics/NetworkCard.svelte';
	import TopicClusters from '../../content/data/topics/topics.json';
	import { LinkHandler } from '$lib/utils/linkhandler.svelte.js';

	let selectionIsActive = $state(true);
	let networkIsActive = $state(false);
	let selectedClusterLabel = $state(TopicClusters[0].manualLabel);
	let selectedClusterColor = $state('#FF805B');
	let selectedPair: string[] = $state([]);
	let selectedIds: string[] = $state([]);

	function selectNewCluster(selectionRules: { cluster: string; clusterColor: string }) {
		if (selectedClusterLabel !== selectionRules.cluster) {
			selectedClusterLabel = selectionRules.cluster;
			selectedClusterColor = selectionRules.clusterColor;
		}
	}

	function switchView(viewRules: { selectionIsActive: boolean; networkIsActive: boolean }) {
		selectionIsActive = viewRules.selectionIsActive;
		networkIsActive = viewRules.networkIsActive;
	}

	let selectedCluster = $derived(
		TopicClusters.filter((cluster) => cluster.manualLabel === selectedClusterLabel)
	);

	function selectNewNodesPair(nodesPair: { arrayOfActiveNodes: string[] }) {
		selectedPair = nodesPair.arrayOfActiveNodes;
	}

	function selectOverlappingArticleIds(ids: { selectedIds: string[] }) {
		selectedIds = ids.selectedIds;
	}
	let contextOpen = $state(false);
	function toggleOpen(name, open) {
		switch (name) {
			case 'Context':
				contextOpen = !open;
				break;
		}
	}
</script>

{#snippet cardSection(name, open)}
	<button
		type="button"
		class="grid w-full cursor-pointer grid-cols-2 rounded-none border-none p-2 text-left"
		onclick={() => {
			toggleOpen(name, open);
		}}
	>
		<p class="font-bold">{name}</p>
		<img class="h-4 self-center justify-self-end" class:rotate-180={open} src={LinkHandler("/icons/ui-scroll.svg")} alt="" />
	</button>
{/snippet}
<div class="base relative m-auto flex h-[100vh] pt-20 md:w-full">
	<div class="flex h-full overflow-scroll px-2 pb-2 md:w-full">
		<div class="w-4/12 pb-150">
			<div class="2xl:mt-10 2xl:rounded-xl 2xl:border 2xl:p-2 2xl:pb-15">
				<div class="mt-2 mb-2">
					<p class="text-sm">Currently selected:</p>
					<h1 class="my-2 font-serif text-xl md:text-2xl">
						{selectedCluster[0].manualLabel}
					</h1>
					<p>
						{selectedCluster[0].description}
					</p>
				</div>
				<div class:hidden={networkIsActive} class="relative overflow-hidden overscroll-none rounded-xl border border-black backdrop-blur-lg my-2">
					<div class="w-full">
						{@render cardSection('Context', contextOpen)}
						<div class={'h-0 overflow-hidden ' + (contextOpen ? '!h-full border-t border-dashed ' : '')}>
							<div class={'p-2 ' + (contextOpen ? 'border-solid' : '')}>
								<div>
									<p class="text-sm"></p>
									<p class="mb-2">
										This project frames the patterns of language and narrative of a year's corpus of news
										data, digging into the divergent simultaneous discourses discourses that occur across the
										newspaper's articles, sections, and timeframes.
									</p>
									One bubble represents a topic, a cluster of common words extracted from The New York Times' articles.
									The most common topics are marked in<span
										class="rounded-xl border border-orange-700 px-2 before:pr-1 before:text-orange-700 before:content-['•']"
										>orange</span
									>
									and are related to foreign politics and conflict. followed by internal politics and economy –
									here in
									<span
										class="rounded-xl border border-[#FFBC35] px-2 before:pr-1 before:text-[#FFBC35] before:content-['•']"
										>yellow</span
									>
									. Miscellaneous topics like culture, health, society, and sports are represented in
									<span
										class="rounded-xl border border-[#FFDAB9] px-2 before:pr-1 before:text-[#FFDAB9] before:content-['•']"
										>pink</span
									>. Orange bubbles represent topics connected to foreign politics. Climate-related topics are
									<span
										class="rounded-xl border border-[#EAFFC0] px-2 before:pr-1 before:text-[#EAFFC0] before:content-['•']"
										>green</span
									>.
								</div>
							</div>
						</div>
					</div>
				</div>
				{#if selectionIsActive && !networkIsActive}
					<ClusterBarchart {selectedCluster} />
				{:else}
					<NetworkCard {selectedPair} {selectedIds} />
				{/if}
			</div>
		</div>
		<div class="sticky top-0 w-8/12">
			{#if selectionIsActive && !networkIsActive}
				<BubbleChart {TopicClusters} {selectNewCluster} {switchView} {selectedClusterLabel} />
			{:else}
				<ClusterNetwork
					{selectedCluster}
					{switchView}
					{selectedClusterColor}
					{selectNewNodesPair}
					{selectOverlappingArticleIds}
				/>
			{/if}
		</div>
	</div>
</div>
