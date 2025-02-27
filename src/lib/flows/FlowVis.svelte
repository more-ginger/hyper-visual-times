<script lang="ts">
    import type { baseData } from '../../types';
    import Flow from "./Flow.svelte";
    import Dropdown from '$lib/common/Dropdown.svelte';
    // @ts-expect-error
    import * as d3 from "d3";


    let { data } = $props();
    let globalDomain = $state([0, 0])
    const keysForFilter = [...new Set(data.map((d:baseData) => d.section_name))].map((d) => { 
        return {
            key: d
        }
    })

    let filterCategory = $state(keysForFilter[0])
    
    let filteredData: baseData[] = $derived(data.filter((d:baseData) => d.section_name == filterCategory.key));
    const groupedData: Partial<Record<number, baseData[]>> = $derived(Object.groupBy(filteredData, (d:baseData) => d.pub_month));
    const monthsForFlows: number[] = $derived(Object.keys(groupedData).map(Number))
   
    $effect(() => {
        // I define a global domain to have a even representation of the coverage throughout the months
        const maxValueForDomain: number[] = []
        Object.keys(groupedData).forEach((key) => {
            const numKey = Number(key)
            const currentMonthData = groupedData[numKey]
        
            if (!currentMonthData) return;

            const GroupByDay = Object.groupBy(currentMonthData, (d:baseData) => d.pub_date)

            Object.keys(GroupByDay).forEach((day) => {
                const dayKey = Number(day)
                const maxDailyValue = d3.sum(GroupByDay[dayKey]?.map((d:baseData) => d.count))
                maxValueForDomain.push(maxDailyValue)
            }) 
        })

        globalDomain = [0, d3.max(maxValueForDomain)]
    })

</script>

<div>
    <div class="mx-4">
        <h1>
            Flows vis about 
            <span>
            <Dropdown availableFilter={keysForFilter} bind:selected={filterCategory}/>
            </span>
            in the NYT 2024 Coverage
        </h1>
    </div>
    <div>
        {#each monthsForFlows as Month}
            <Flow month={Month} data={groupedData[Month]} globalDomain={globalDomain}></Flow>
        {/each}
    </div>
</div>