<script lang="ts">
    import type { baseData } from '../../types';
    import { tooltip } from './tooltip'
    // @ts-expect-error
    import * as d3 from "d3";
    ////
    // Interfaces and data
    let { data, month, globalDomain } = $props();

    interface HybridArray extends Array<number> {
        data: [Date, unknown];
    }

    interface NestedHybridArray extends Array<HybridArray> {
        key: string
    }

    let innerWidth = $state(0)
    let innerHeight = $state(0)
    let visWidth = $derived(innerWidth - 100)
    let active = $state(false)
    let flowIndex = $state(0)

    function daysInMonth (month:number, year:number) {
        return new Date(year, month, 0).getDate();
    }
    // Retrieve the first and last day of the month
    const firstDay = $derived(new Date(2024, month - 1, 1));
    const lastDay = $derived(new Date(2024, month, 0));
    const pixelBufferForShorterMonths = $derived((31 - daysInMonth(month, 2024)) * 50)
    const allDays = $derived(d3.timeDay.range(firstDay, lastDay))

    let currentMonth = $derived(new Date(2024, month, 0))
    let monthInString = $derived(currentMonth.toLocaleString('default', { month: 'long' }))

    // Parse data to return valid date
    const dataWithParsedDate = $derived(data.map((d:baseData) => {
            
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
    }))

    // Push 0 values for dates that do not exist in the original dataset
    $effect.pre(() => {
        const uniqueKeywords = [...new Set(data.map((d:baseData) => d.keyword))]
        uniqueKeywords.forEach((keyword) => {
            // Get current keyword
            const currentKeyword = dataWithParsedDate.filter((d: baseData) => d.keyword == keyword)
            
            // New object that only contains existing dates, use dates as key
            const dateHash = currentKeyword.reduce(function(agg: any, d: any) {
                agg[d.pub_date] = true;
                return agg;
            }, {})

            // Get every day in the year
            d3.timeDay.range(firstDay, lastDay)
            .filter(function(date: Date){
                // Keep all dates that do not exist
                return !dateHash[date.toString()]
            })
            .forEach(function(date: Date) {
                
                // Generate a dummy entry with count: 0 that matches the correct date
                var emptyRow = { 
                    count: 0,
                    pub_date: date,
                    keyword: keyword,
                    pub_month: month
                    };
                // Push the new data in the existing dataset
                dataWithParsedDate.push(emptyRow);
            });
        })

        dataWithParsedDate.sort((a:baseData, b:baseData) => a.pub_date - b.pub_date)
    })

    // Generates stack for area charts
    const uniqueKeysForStack = $derived(d3.union(dataWithParsedDate.map((d:baseData) => d.keyword)))
    const stack = $derived(d3.stack()
        .keys(uniqueKeysForStack)
        .value(([, group]: [any, Map<string, baseData>], key: string) => group.get(key)?.count || 0)
        .order(d3.stackOrderDescending))
    
    // d3.index makes a two level nest, first on publication date and then on keyword
    const stackedData = $derived(stack(d3.index(dataWithParsedDate, (d: baseData) => d.pub_date, (d: baseData) => d.keyword)))
    ////

    // Scales and constructors
    const domainXscale = $derived([firstDay, lastDay])
    
    const xScale = $derived(
        d3.scaleLinear()
        .range([0, visWidth - pixelBufferForShorterMonths])
        .domain(domainXscale)
    )
    
    const yScale = $derived(d3.scaleLinear()
    .range([0, 300])
    .domain(globalDomain))

    const xAxis = $derived(xScale.ticks(5).map((tick:number) => {
        const pub_date = new Date(tick)
        const month = pub_date.getMonth()
        const day = pub_date.getDate()
        
        return {
            raw: tick,
            formatted: `${day}.${month + 1}`
        }
    }))
    const yAxis = $derived(yScale.ticks(5))

    const area = $derived(
        d3.area()
        .x((d:HybridArray) => xScale(d.data[0]))
        .y0((d:NestedHybridArray) => 300 - yScale(d[0]))
        .y1((d:NestedHybridArray) => 300 - yScale(d[1]))
        .curve(d3.curveStep)
    )
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

    
    function handleActiveFlow (f:number) {
        flowIndex = f;
        active = true;
    }

    function handleInactiveFlow() {
        active = false;
    }
</script>

<svelte:window bind:innerWidth bind:innerHeight />
{#await computedFlowData}
    <div>Waiting for data to be loaded</div>
{:then computedFlowData}
<main class="">
    <div class="px-12">{monthInString}</div>
    <div>
        <svg width={visWidth} height="310" class="m-auto">
            <g class="back-annotations">
                {#each allDays as tick}
                        <line
                        x1={xScale(tick)} 
                        x2={xScale(tick)} 
                        y1={0} 
                        y2={300} 
                        stroke="#d69539"
                        stroke-width=0.75
                        stroke-dasharray="2 1"
                    />
                {/each}
                {#each yAxis as tick}
                    <g>
                        <line 
                            x1="0" 
                            x2={innerWidth - pixelBufferForShorterMonths} 
                            y1={270 - yScale(tick)} 
                            y2={270 - yScale(tick)} 
                            stroke="#d69539"
                        />
                    </g>
                {/each}
            </g>
            <g class="flow-chart">
                {#each computedFlowData as flow, f}
                <g 
                    use:tooltip={flow.keyword}
                    onmouseenter={() => handleActiveFlow(f)}
                    onmouseleave={() => handleInactiveFlow()}
                    role="none"
                    >
                    <path 
                        d={flow.area} 
                        fill={active && f == flowIndex? "red" : "white"} 
                        stroke="rgb(72, 76, 88)"
                        stroke-width="0.75"
                        id={flow.keyword}
                    />
                </g>
                {/each}
            </g>
            <g class="front-annotations">
                <g>
                    <line
                        x1={xScale(firstDay)} 
                        x2={innerWidth - pixelBufferForShorterMonths} 
                        y1={300} 
                        y2={300} 
                        stroke="#946017"
                        stroke-width=4
                    />
                    <line
                    x1={xScale(firstDay)} 
                    x2={innerWidth - pixelBufferForShorterMonths} 
                    y1={2} 
                    y2={2} 
                    stroke="#946017"
                    stroke-width=4
                />
                </g>
                <g class="x-axis">
                    {#each xAxis as tick}
                        <text
                            y={295} 
                            x={xScale(tick.raw) + 10}
                            fill="none"
                            stroke="white"
                            stroke-width=4
                            >
                                {tick.formatted}
                        </text>
                        <text
                            y={295} 
                            x={xScale(tick.raw) + 10}
                            fill="#946017"
                            >
                                {tick.formatted}
                        </text>
                        <line
                            x1={xScale(tick.raw)} 
                            x2={xScale(tick.raw)} 
                            y1={290} 
                            y2={300} 
                            stroke="#946017"
                            stroke-width=2
                        />
                    {/each}
                </g>
                <g class="y-labels">
                    {#each yAxis as tick}
                        <text
                        x={0} 
                        y={300 - yScale(tick) - 10}
                        fill="#946017"
                        >
                            {tick}
                        </text>
                    {/each}
                </g>
            </g>
        </svg>
    </div>
    <div id="tooltip-container"></div>
</main>
{/await}