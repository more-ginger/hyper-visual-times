<script lang="ts">
    import type { baseData } from '../../types';
    // @ts-expect-error
    import * as d3 from "d3";
    ////
    // Interfaces and data
    let innerWidth = $state(0)
    let innerHeight = $state(0)

    let visWidth = $derived(innerWidth - 100)

    interface HybridArray extends Array<number> {
        data: [Date, unknown];
    }

    interface NestedHybridArray extends Array<HybridArray> {
        key: string
    }

    let { data, month } = $props();
    
    // Retrieve the first and last day of the month
    const firstDay = new Date(2024, month - 1, 1);
    const lastDay = new Date(2024, month, 0);

    // Parse data to return valid date and sort them
    const dataWithParsedDate = data.map((d:baseData) => {
            return {
                count: d.count,
                pub_date: new Date(d.pub_date),
                keyword: d.keyword,
                pub_month: d.pub_month
            }
        }).sort((a:baseData, b:baseData) => a.pub_date - b.pub_date)

    // Generates stack for area charts
    const uniqueKeysForStack = d3.union(dataWithParsedDate.map((d:baseData) => d.keyword))
    const stack = d3.stack()
        .keys(uniqueKeysForStack)
        .value(([, group]: [any, Map<string, baseData>], key: string) => group.get(key)?.count || 0)
        .order(d3.stackOrderDescending)
    
    // d3.index makes a two level nest, first on publication date and then on keyword
    const stackedData = stack(d3.index(dataWithParsedDate, (d: baseData) => d.pub_date, (d: baseData) => d.keyword))
    ////

    ////
    // Scales and constructors
    const domainXscale = [firstDay, lastDay]
    const domainYScale = d3.extent(stackedData.flat(2))
    
    const xScale = $derived(d3.scaleLinear().range([0, visWidth]).domain(domainXscale))
    const yScale = d3.scaleLinear().range([0, 300]).domain(domainYScale)
    const area = $derived(d3.area()
        .x((d:HybridArray) => xScale(d.data[0]))
        .y0((d:NestedHybridArray) => 300 - yScale(d[0]))
        .y1((d:NestedHybridArray) => 300 - yScale(d[1]))
        .curve(d3.curveBumpX))
    ////
    
    ////
    // Computed data, ready to render
    const computedFlowData = $derived(stackedData.map((group:NestedHybridArray) => {
        return {
            area: area(group),
            keyword: group.key
        }
    }))

</script>

<svelte:window bind:innerWidth bind:innerHeight />

<main>
    <div>{month}</div>
    <svg width={visWidth} height="300" class="m-auto my-[-50px] ">
        <g>
            {#each computedFlowData as flow}
                <path d={flow.area} fill="white" stroke="#9494b8" id={flow.keyword}/>
            {/each}
        </g>
        <g>
            <line x1={xScale(firstDay)} x2={xScale(lastDay)} y1={300} y2={300} stroke="black" stroke-width="2"/>
        </g>
    </svg>
</main>