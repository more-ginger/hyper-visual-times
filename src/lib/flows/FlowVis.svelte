<script lang="ts">
    import type { baseData } from '../../types';
    import Flow from "./Flow.svelte";

    let { data } = $props();

    const filteredData: baseData[] = $state(data.filter((d: baseData) => d.section_name == "Movies"));
    const groupedData = $state(Object.groupBy(filteredData, (d: baseData) => d.pub_month));
    const monthsForFlows: number[] = $state(Object.keys(groupedData).map(Number))
    
</script>

<div>
    <h1>Flows vis</h1>
    <div>
        {#each monthsForFlows as Month}
            <Flow month={Month} data={groupedData[Month]}></Flow>
        {/each}
    </div>
</div>