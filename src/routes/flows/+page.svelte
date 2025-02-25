<script lang="ts">
import FlowVis from "$lib/flows/FlowVis.svelte";

//this export gets the data from the +page.server page
export let data: { flowData: Record<string, any> }

</script>
<div class="base">
    {#await data.flowData}
            <div>Waiting</div>
        {:then flowData}
            <FlowVis data={flowData}/> 
    {/await}
</div>