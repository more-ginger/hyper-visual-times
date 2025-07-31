<script lang="ts">
	import NetworksData from '../../content/data/topics/networks.json';
	let { selectedCluster, switchView } = $props();
	let width = $state(0);
	let height = $state(0);
	let currentNetworkData = $derived(
		NetworksData.filter((network) => {
			return selectedCluster[0].id === network.topic;
		})
	);
	$inspect(currentNetworkData);

	function handleClusterReset() {
		switchView({
			selectionIsActive: true,
			networkIsActive: false
		});
	}
</script>

<div class="h-full w-full" bind:clientWidth={width} bind:clientHeight={height}>
	<div class="absolute m-2">
		<button
			onclick={() => {
				handleClusterReset();
			}}>Back to clusters</button
		>
	</div>
	<svg {width} {height} class="bg-red-100"></svg>
</div>
