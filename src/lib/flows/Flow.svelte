<script lang="ts">
    import type { baseData } from '../../types';
    // @ts-expect-error
    import * as d3 from "d3";


    interface HybridArray extends Array<number> {
        data: [Date, unknown];
    }

    interface NestedHybridArray extends Array<HybridArray> {
        key: string
    }

    let { data, month } = $props();
    
    var firstDay = new Date(2024, month - 1, 1);
    var lastDay = new Date(2024, month, 0);

    const dataWithParsedDate = data.map((d:baseData) => {
            return {
                count: d.count,
                pub_date: new Date(d.pub_date),
                keyword: d.keyword,
                pub_month: d.pub_month
            }
        }).sort((a:baseData, b:baseData) => a.pub_date - b.pub_date)

    const uniqueKeysForStack = d3.union(dataWithParsedDate.map((d:baseData) => d.keyword))
    const stack = d3.stack()
        .keys(uniqueKeysForStack)
        .value(([, group]: [any, Map<string, baseData>], key: string) => group.get(key)?.count || 0)
        .order(d3.stackOrderDescending)

    const stackedData = stack(d3.index(dataWithParsedDate, (d: baseData) => d.pub_date, (d: baseData) => d.keyword))

    const domainXscale = [firstDay, lastDay]
    const domainYScale = d3.extent(stackedData.flat(2))
    
    const xScale = d3.scaleLinear().range([0, 1000]).domain(domainXscale)
    const yScale = d3.scaleLinear().range([0, 300]).domain(domainYScale)
    const area = d3.area()
        .x((d:HybridArray) => xScale(d.data[0]))
        .y0((d:NestedHybridArray) => 300 - yScale(d[0]))
        .y1((d:NestedHybridArray) => 300 - yScale(d[1]))
        .curve(d3.curveBumpX)
        
    const computedFlowData = stackedData.map((group:NestedHybridArray) => {

        console.log(group)
        return {
            area: area(group),
            keyword: group.key,
            group
        }
    })

</script>

<main>
    <svg width="1000" height="300" class="m-auto bg-red-100">
        <g>
            {#each computedFlowData as flow}
                <path d={flow.area} fill="white" stroke="gray" id={flow.keyword}/>
            {/each}
        </g>
    </svg>
</main>