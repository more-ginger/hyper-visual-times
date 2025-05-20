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
    let currentOutlet = $state("Zeit")
    let showFirstTenOnly = $derived(step === 6 || step === 7  ? true : false); 
    let showLastTenOnly = $derived(step === 8 || step === 9 ? true : false);  
    
    // Filter the data to remove Germany and the US from respective countries, avoids re-scaling  
    let dataWithoutPrimaryCountry = $derived(
        countryData.data.map((d:parsedCountryData) => { 
            return {
                country: d.country,
                count_zeit: !showHomeCountry && d.country == "Germany" ? 0 : d.count_zeit,
                count_nyt: !showHomeCountry && d.country == "United States" ? 0: d.count_nyt
            }
    }))
    
    // Sorts based on currentOutlet and slices to retain first 20 results
    let top20Countries = $derived(
        dataWithoutPrimaryCountry
            .sort((a:parsedCountryData, b:parsedCountryData) => {
                return currentOutlet == "Zeit" 
                ? b.count_zeit - a.count_zeit
                : b.count_nyt - a.count_nyt
            })
            .slice(0, 20)
    )

    //// Vis ////
    const domainValues = $derived(
        dataWithoutPrimaryCountry
            .map((d:parsedCountryData) => d.count_zeit)
            .concat(dataWithoutPrimaryCountry.map((d:parsedCountryData) => d.count_nyt))
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
    ////
    
    // Interactivity
    // controls how the data should be sorted on direct selection
    function switchPrimaryCountry () {
        if (currentOutlet === "NYT") {
            currentOutlet = "Zeit";
        } else {
            currentOutlet = "NYT";
        }
    }

    // controls data sorting on step
    $effect(() => {
        if (step === 6 || step === 8) {
            currentOutlet = "NYT"
        } else if (step === 7 || step === 9) {
            currentOutlet = "Zeit"
        }
    })

</script>
<div class="h-full">
    <div>
        <div class=border-b>
            <h4>
                What countries and geographic entities are mentioned the most?
            </h4>
        </div>
        <div>
            <p>
                The chart compares the use of geo-related keywords in 
                <span class="text-zeit-peach-dark">Zeit Online</span> 
                with 
                <span class="text-nyt-violet-dark">The New York Times</span>.
            </p>
        </div>
        <div>
            Countries are sorted based on
            {#if currentOutlet == "Zeit"}
                <button onclick={switchPrimaryCountry}>
                    <span class="text-zeit-peach-dark">Zeit Online</span>
                    <img class="inline" src="icons/ui-switch.svg" alt="Switch with The New York Times"/>
                </button>
            {:else}
                <button onclick={switchPrimaryCountry}>
                    <span class="text-nyt-violet-dark">The New York Times</span>
                    <img class="inline" src="icons/ui-switch.svg" alt="Switch with Zeit"/>
                </button>
            {/if}
            top 20 keywords.
        </div>
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
                <g transform={
                    `translate(
                        ${country.rowNumber * fullWidth / countriesPerRow}, 
                        ${fullHeight / countriesPerRow + country.columnNumber * fullHeight / countriesPerRow + 50}
                    )`}>
                    <g class={
                        showFirstTenOnly && i > 9 || 
                        showLastTenOnly && i < 10 ? 
                        "hidden" : 
                        ""
                    }>
                        <g>
                            {#each yAxis as tick}
                                {#if tick != 0}
                                    <g transform={`translate(0, ${polygonVertexYScale(tick)})`}>
                                        
                                        <line 
                                            class="stroke-yellow-600"
                                            x1={0} 
                                            x2={fullWidth / 5 - 10} 
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
                            {i + 1}. {country.country}
                        </text>
                    </g>
                    <g transform="translate(10, 0)">
                        <TotalCovSvgBar 
                            i={i} 
                            showFirstTenOnly={showFirstTenOnly}
                            showLastTenOnly={showLastTenOnly}
                            path={polygonVertexYScale(country.count_zeit)} 
                            transformFactor={"translate(0, 0)"} 
                            outlet="Zeit"
                            currentOutlet={currentOutlet}
                        />
                        <TotalCovSvgBar  
                            i={i}
                            showFirstTenOnly={showFirstTenOnly}
                            showLastTenOnly={showLastTenOnly}
                            path={polygonVertexYScale(country.count_nyt)}  
                            transformFactor={"translate(40, 0)"} 
                            outlet="NYT"
                            currentOutlet={currentOutlet}
                        />
                    </g>
                </g>
            {/each}
        </g>
    </svg>
    </div>
</div>