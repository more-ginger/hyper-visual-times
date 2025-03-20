<script lang="ts">
    // @ts-expect-error
     import * as d3 from "d3";

    interface parsedCountryData {
        country: string,
        count_zeit: number,
        count_nyt: number
    }

    let {countryData} = $props();
    let fullWidth = $state(0); 
    let fullHeight = $state(0);
    let sum = 0;

    let currentPrimaryOutlet = "Zeit";
    let showHomeCountry = false;

    let dataWithoutPrimaryCountry = $derived(countryData.data.map((d) => { 
        return {
            country: d.country,
            count_zeit: !showHomeCountry && d.country == "Germany" ? 0 : d.count_zeit,
            count_nyt: !showHomeCountry && d.country == "United States" ? 0: d.count_nyt
        }
    }))
    
    let top20Countries = $derived(
        dataWithoutPrimaryCountry
            .sort((a:parsedCountryData, b:parsedCountryData) => {return currentPrimaryOutlet == "Zeit" ? 
                b.count_zeit - a.count_zeit
                : b.count_nyt - a.count_nyt
            })
            .slice(0, 20)
    )

    let visualizationData = $derived(
        top20Countries.map((d: parsedCountryData, i: number) => {
            
            let columnNumber = 0
            
            if (i % 5 !== 4) {
                columnNumber = sum
            } else {
                columnNumber = sum
                sum++
            }

            return {
                rowNumber: i % 5,
                columnNumber,
                country: d.country,
                count_zeit: d.count_zeit,
                count_nyt: d.count_nyt
            }
        })
    )

    const domainValues = $derived(visualizationData.map((d) => d.count_zeit).concat(visualizationData.map((d) => d.count_nyt)).sort((a,b) => { return b - a}))
    $inspect(domainValues)
    let polygonVertexYScale = $derived(d3.scaleLinear().domain(d3.extent(domainValues)).range([0, -190]))


    $inspect(visualizationData)
</script>
<div class="h-full">
    <div>
        <div><h3>Most common country keywords in comparison</h3></div>
        <div><p>Zeit vs. NYT</p></div>
    </div>
    <div class="h-9/10">
        <svg 
        width="100%" 
        height="100%" 
        bind:clientWidth={fullWidth} 
        bind:clientHeight={fullHeight}
    >
        <g class="axis">
            {#each {length: top20Countries.length/5}, pos}
                <line 
                    x1="0" 
                    x2={fullWidth} 
                    y1={fullHeight / 5 + pos * fullHeight / 5 + 50} 
                    y2={fullHeight / 5 + pos * fullHeight / 5 + 50} 
                    stroke="black">
                </line>
            {/each}
        </g>
        {#each visualizationData as country, i}
            <g transform={`translate(${country.rowNumber * fullWidth / 4}, ${fullHeight / 5 + country.columnNumber * fullHeight / 5 + 50})`}>
                <g transform="translate(20, 0)">
                    <polygon points={`25,${polygonVertexYScale(country.count_zeit)} 0,0 50,0`} fill="red" stroke="black"/>
                    <polygon transform="translate(50, 0)" points={`25,${polygonVertexYScale(country.count_nyt)} 0,0 50,0`} fill="yellow" stroke="black"/>
                </g>
                <text x="0" y="15">
                    {country.country}
                </text>
            </g>
        {/each}
    </svg>
    </div>
</div>