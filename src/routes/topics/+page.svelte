<script lang="ts">
	import BubbleChart from '$lib/topics/BubbleChart.svelte';
	import ClusterBarchart from '$lib/topics/ClusterBarchart.svelte';
	import ClusterNetwork from '$lib/topics/ClusterNetwork.svelte';
	import TopicClusters from '../../content/data/topics/topics.json';

	let selectionIsActive = $state(true);
	let networkIsActive = $state(false);
	let selectedClusterLabel = $state(TopicClusters[0].manualLabel);
	let selectedClusterColor = $state('#000000');

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

<div class="base m-auto flex pt-20 md:w-full">
	<div class="flex h-[90vh] px-2 pb-2 md:w-full">
		<div class="w-4/12">
			<div>
				<h1 class="my-2 font-serif text-2xl md:text-2xl">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				</h1>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed viverra quam at est facilisis
					auctor. Etiam dui diam, sollicitudin eu ante a, ornare aliquam leo. Morbi et erat eros.
					Vivamus interdum leo a nibh sodales rutrum. Pellentesque dapibus, erat ut porta aliquet,
					purus purus sollicitudin risus, vitae ornare augue eros a magna. Maecenas vestibulum sit
					amet lectus ut aliquam. Curabitur pharetra ligula quis erat hendrerit accumsan. Phasellus
					eget risus varius lectus dignissim suscipit non pellentesque sem. Aenean vitae tempus
					turpis. Proin sagittis augue a vestibulum placerat. Nulla facilisi.
				</p>
			</div>
			<div>
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
