<script lang="ts">
    // @ts-expect-error
     import * as d3 from "d3";
     import TotalCovSvgBar from "./totalCovSvgBar.svelte";

    interface parsedCountryData {
        country: string,
        count_zeit: number,
        count_nyt: number
    }

    let {countryData, step} = $props();
    let fullWidth = $state(0); 
    let fullHeight = $state(0);
    let sum = 0;
    let showHomeCountry = false;
    let countriesPerRow = 5;

    let currentPrimaryOutlet = $derived(step === 1 || step === 3  ? "NYT" : "Zeit"); 
    let showFirstTenOnly = $derived(step === 1 || step === 2 ? true : false); 
    
    let dataWithoutPrimaryCountry = $derived(
        countryData.data.map((d:parsedCountryData) => { 
            return {
                country: d.country,
                count_zeit: !showHomeCountry && d.country == "Germany" ? 0 : d.count_zeit,
                count_nyt: !showHomeCountry && d.country == "United States" ? 0: d.count_nyt
            }
    }))
    
    let top20Countries = $derived(
        dataWithoutPrimaryCountry
            .sort((a:parsedCountryData, b:parsedCountryData) => {
                return currentPrimaryOutlet == "Zeit" 
                ? b.count_zeit - a.count_zeit
                : b.count_nyt - a.count_nyt
            })
            .slice(0, 20)
    )

    const domainValues = $derived(
        top20Countries
            .map((d:parsedCountryData) => d.count_zeit)
            .concat(top20Countries.map((d:parsedCountryData) => d.count_nyt))
            .sort((a:number,b:number) => { return b - a})
    )


    let visualizationData = $derived(
        top20Countries.map((d: parsedCountryData, i: number) => {
            let columnNumber = 0
            sum = sum >= 4 ? 0 : sum;
            if (i % countriesPerRow !== 4) {
                columnNumber = sum
            } else {
                columnNumber = sum
                sum++
            }

            const maxZeitValue = dataWithoutPrimaryCountry.map((d:parsedCountryData) => d.count_zeit)
            const maxNytValue = dataWithoutPrimaryCountry.map((d:parsedCountryData) => d.count_nyt)
            
            return {
                rowNumber: i % countriesPerRow,
                columnNumber,
                country: d.country,
                count_zeit: d.count_zeit,
                count_nyt: d.count_nyt,
                max_zeit: d3.max(maxZeitValue) === d.count_zeit ? true : false,
                max_nyt:  d3.max(maxNytValue) === d.count_nyt ? true : false,
            }
        })
    )



    const polygonVertexYScale = $derived(
        d3.scaleLinear()
            .domain(d3.extent(domainValues))
            .range([0, -190])
    )

    const yAxis = $derived(polygonVertexYScale.ticks(5).slice(0, 3))

</script>
<div class="h-full">
    <div>
        <div class=border-b><h4>What countries and geographic entities are mentioned the most?</h4></div>
        <div><p>Comparing <span class="text-zeit-peach-default">Die Zeit</span> with <span class="text-nyt-violet-default">The New York Times</span></p></div>
    </div>
    <div class="h-9/10">
        <svg 
        width="100%" 
        height="100%" 
        bind:clientWidth={fullWidth} 
        bind:clientHeight={fullHeight}
    >
        <g class="translate-y-16">
            <g class="axis">
                {#each {length: top20Countries.length/countriesPerRow}, pos}
                    <g>
                        <line 
                            x1="0" 
                            x2={fullWidth} 
                            y1={fullHeight / countriesPerRow + pos * fullHeight / countriesPerRow + 50} 
                            y2={fullHeight / countriesPerRow + pos * fullHeight / countriesPerRow + 50} 
                            stroke="black">
                        </line>
                    </g>
                {/each}
            </g>
            {#each visualizationData as country, i}
                <g transform={`translate(${country.rowNumber * fullWidth / countriesPerRow}, ${fullHeight / countriesPerRow + country.columnNumber * fullHeight / countriesPerRow + 50})`}>
                    <g class={showFirstTenOnly && i > 9 ? "hidden" : ""}>
                        <g>
                            {#each yAxis as tick}
                                {#if tick != 0}
                                    <g transform={`translate(0, ${polygonVertexYScale(tick)})`}>
                                        
                                        <line 
                                            class="stroke-yellow-600"
                                            x1={0} 
                                            x2={100} 
                                            y1="0" 
                                            y2="0" 
                                            stroke-dasharray="4 2"
                                        />
                                        <text 
                                            x="0" 
                                            y="-5"
                                            font-size="10" 
                                            class="fill-yellow-600"
                                        >
                                            {tick}
                                        </text>
                                    </g>
                                {/if}
                            {/each}
                        </g>
                        <text x="0" y="15" font-size="14">
                            {country.country}
                        </text>
                    </g>
                    <g transform="translate(10, 0)">
                        <TotalCovSvgBar 
                            i={i} 
                            showFirstTenOnly={showFirstTenOnly} 
                            path={polygonVertexYScale(country.count_zeit)} 
                            transformFactor={"translate(0, 0)"} 
                            outlet="zeit"
                        />
                        <TotalCovSvgBar  
                            i={i}
                            showFirstTenOnly={showFirstTenOnly}
                            path={polygonVertexYScale(country.count_nyt)}  
                            transformFactor={"translate(40, 0)"} 
                            outlet="nyt"
                        />
                    </g>
                    <!-- {#if country.max_zeit}
                        <g transform="translate(50, 0)">
                            <text 
                            class="fill-zeit-peach-dark"
                            x="0"
                            y={polygonVertexYScale(country.count_zeit) - 30} 
                            font-size="10" 
                            text-anchor="middle">
                                Most covered by Zeit
                            </text>
                            <text
                            class="fill-zeit-peach-dark"
                            x="0" 
                            y={polygonVertexYScale(country.count_zeit) - 10} 
                            text-anchor="middle">
                                {country.count_zeit}
                            </text>
                        </g>
                    {/if}
                    {#if country.max_nyt}
                        <g transform="translate(100, 0)">
                            <text 
                            class="fill-nyt-violet-dark"
                            x="0"
                            y={polygonVertexYScale(country.count_nyt) - 30} 
                            font-size="10" 
                            text-anchor="middle">
                                Most covered by NYT
                            </text>
                            <text
                            class="fill-nyt-violet-dark"
                            x="0" 
                            y={polygonVertexYScale(country.count_nyt) - 10} 
                            text-anchor="middle">
                                {country.count_nyt}
                            </text>
                        </g>
                    {/if} -->
                </g>
            {/each}
        </g>
    </svg>
    </div>
</div>