<script lang="ts">
    import type { baseData } from '../../types';
    import Flow from "./Flow.svelte";
    // @ts-expect-error
    import * as d3 from "d3";


    let { data } = $props();
    const filterCategory = "Movies"
    const filteredData: baseData[] = $state(data.filter((d:baseData) => d.section_name == filterCategory));
    const groupedData: Partial<Record<number, baseData[]>> = $state(Object.groupBy(filteredData, (d:baseData) => d.pub_month));
    const monthsForFlows: number[] = $state(Object.keys(groupedData).map(Number))
    
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
    
    const globalDomain = [0, d3.max(maxValueForDomain)]

</script>

<div>
    <h1>Flows vis about {filterCategory}</h1>
    <div>
        {#each monthsForFlows as Month}
            <Flow month={Month} data={groupedData[Month]} globalDomain={globalDomain}></Flow>
        {/each}
    </div>
</div>