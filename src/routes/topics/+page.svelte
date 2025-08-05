<script lang="ts">
	import BubbleChart from '$lib/topics/BubbleChart.svelte';
	import ClusterBarchart from '$lib/topics/ClusterBarchart.svelte';
	import ClusterNetwork from '$lib/topics/ClusterNetwork.svelte';
	import TopicClusters from '../../content/data/topics/topics.json';

	let selectionIsActive = $state(true);
	let networkIsActive = $state(false);
	let selectedClusterLabel = $state(TopicClusters[0].manualLabel);
	let selectedClusterColor = $state('#FF805B');

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
</script>

<div class="base m-auto flex h-dvh pt-20 md:w-full">
	<div class="flex h-full px-2 pb-2 md:w-full">
		<div class="w-4/12">
			<div class="">
				<p class="text-sm">
					One bubble represents a topic, a cluster of common words extracted from The New York
					Times' articles. The most common topics are related to foreign politics and conflict,
					followed by internal politics and economy – here in yellow. Miscellaneous topics like
					culture, health, society, and sports are represented in pink. Orange bubbles represent
					topics connected to foreign politics. Climate-related topics are green.
				</p>
			</div>
			<div class="2xl:mt-10 2xl:rounded-xl 2xl:border 2xl:p-2 2xl:pb-15">
				<div class="mt-2 mb-6">
					<p class="text-sm">Currently selected:</p>
					<h1 class="my-2 font-serif text-xl md:text-2xl">
						{selectedCluster[0].manualLabel}
					</h1>
					<p>
						{selectedCluster[0].description}
					</p>
				</div>
				{#if selectionIsActive && !networkIsActive}
					<ClusterBarchart {selectedCluster} {switchView} />
				{/if}
			</div>
		</div>
		<div class="w-8/12">
			{#if selectionIsActive && !networkIsActive}
				<BubbleChart {TopicClusters} {selectNewCluster} {switchView} {selectedClusterLabel} />
			{:else}
				<ClusterNetwork {selectedCluster} {switchView} {selectedClusterColor} />
			{/if}
		</div>
	</div>
</div>
