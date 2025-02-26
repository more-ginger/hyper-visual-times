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

    let { data, month, globalDomain } = $props();
    
    function daysInMonth (month:number, year:number) {
        return new Date(year, month, 0).getDate();
    }
    // Retrieve the first and last day of the month
    const firstDay = new Date(2024, month - 1, 1);
    const lastDay = new Date(2024, month, 0);
    const pixelBufferForShorterMonths = (31 - daysInMonth(month, 2024)) * 50

    // Parse data to return valid date
    const dataWithParsedDate = data.map((d:baseData) => {
            
        const pub_date = new Date(d.pub_date)
        const year = pub_date.getFullYear()
        const month = pub_date.getMonth()
        const day = pub_date.getDate()
        const date_no_time = new Date(year, month, day);

        return {
            count: d.count,
            pub_date: date_no_time,
            keyword: d.keyword,
            pub_month: d.pub_month
        }
    })    

    // Push 0 values for dates that do not exist in the original dataset
    const uniqueKeywords = [...new Set(data.map((d:baseData) => d.keyword))]
    uniqueKeywords.forEach((keyword) => {
        const currentKeyword = dataWithParsedDate.filter((d: baseData) => d.keyword == keyword)
        
        const dateHash = currentKeyword.reduce(function(agg: any, d: any) {
            agg[d.pub_date] = true;
            return agg;
        }, {})

        d3.timeDay.range(firstDay, lastDay)
        .filter(function(date: Date){
            return !dateHash[date.toString()]
        })
        .forEach(function(date: Date) {
            var emptyRow = { 
                count: 0,
                pub_date: date,
                keyword: keyword,
                pub_month: month
                };

            dataWithParsedDate.push(emptyRow);
        });
    })

    // sort data based on date
    dataWithParsedDate.sort((a:baseData, b:baseData) => a.pub_date - b.pub_date)

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
    
    const xScale = $derived(d3.scaleLinear().range([0, visWidth - pixelBufferForShorterMonths]).domain(domainXscale))
    const yScale = d3.scaleLinear().range([0, 300]).domain(globalDomain)

    const xAxis = $derived(xScale.ticks())
    const yAxis = yScale.ticks(5)


    const area = $derived(d3.area()
        .x((d:HybridArray) => xScale(d.data[0]))
        .y0((d:NestedHybridArray) => 300 - yScale(d[0]))
        .y1((d:NestedHybridArray) => 300 - yScale(d[1]))
        .curve(d3.curveBumpX))
    ////
    
    ////
    // Computed data, ready to render
    const computedFlowData = $derived(
        stackedData.map((group:NestedHybridArray) => {
            return {
                area: area(group),
                keyword: group.key
            }
        })
    )

</script>

<svelte:window bind:innerWidth bind:innerHeight />

<main class="border-t border-2 border-black">
    <div>{month}</div>
    <svg width={visWidth} height="300" class="m-auto">
        <g>
            {#each xAxis as tick}
                <line x1={xScale(tick)} x2={xScale(tick)} y1={300} y2={0} stroke="black"/>
            {/each}
         </g>
         <g>
            {#each yAxis as tick}
                <line x1="0" x2={innerWidth - pixelBufferForShorterMonths} y1={yScale(tick)} y2={yScale(tick)} stroke="black"/>
            {/each}
         </g>
        <g>
            {#each computedFlowData as flow}
                <path 
                    d={flow.area} 
                    fill="white" 
                    stroke="#9494b8" 
                    id={flow.keyword}
                />
            {/each}
        </g>
        <g>

        </g>
        <!-- <g>
            <line 
                x1={xScale(firstDay)} 
                x2={xScale(lastDay)} 
                y1={300} 
                y2={300} 
                stroke="black" 
                stroke-width="2"
            />
        </g> -->
    </svg>
</main>