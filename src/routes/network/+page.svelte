<script lang="ts">
 import NetworkVis from "$lib/network/NetworkVis.svelte";

//this export gets the data from the +page.server page
export let data: { networkData: Record<string, any> }

</script>
<div class="base">
    {#await data.networkData}
            <div>Waiting</div>
        {:then networkData}
            <NetworkVis data={networkData}/> 
    {/await}
</div>