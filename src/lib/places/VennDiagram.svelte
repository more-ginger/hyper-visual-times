<script lang="ts">
    import { scaleSolution, venn } from "@upsetjs/venn.js";
    import countries from "i18n-iso-countries";
    import enLocale from 'i18n-iso-countries/langs/en.json';
    import type { solution } from '../../types';
    let {data, comparisonCountry, outlet} = $props()

    countries.registerLocale(enLocale);

    // variables to scale the circles
    let svgWidth = $state(400);
    const svgHeight = 300;
    const padding = 20; // optional
    const scaleToFit = false;

    const currentDataSelection = $derived(data.filter((d:{country:string}) => {return d.country == comparisonCountry.key}))

    function fromObjectNotation(solution: solution) {
        const setids = Object.keys(solution);
        return setids.map((id) => Object.assign(solution[id], { setid: id }));
    }

    // Unscaled solution for venns, return paths instead of circles coordinates
    // const diagramArticles = $derived(layout(currentDataSelection[0].articlesSet))
    // const diagramCategories = $derived(layout(currentDataSelection[0].categoriesSet))

    // creates a raw layout for the two types of Venns: one based on articles the other based on categoroes
    const rawVennArticles = $derived(currentDataSelection.length > 0 ? venn(currentDataSelection[0].articlesSet) : {})
    const rawVennKws = $derived(currentDataSelection.length > 0 ? venn(currentDataSelection[0].categoriesSet) : {})

    // given width, height and padding 
    // scales the diagrams to fit the svg size
    const scaledLayoutArticles = $derived(
            scaleSolution(
                rawVennArticles, 
                svgWidth, 
                svgHeight, 
                padding, 
                scaleToFit
            )
        );

    const scaledLayoutKws = $derived(
        scaleSolution(
            rawVennKws, 
            svgWidth, 
            svgHeight, 
            padding, 
            scaleToFit
            )
        );

    // This is expected to work, because the radius of circle will be always be zero
    // if no data point exist for one of the publications
    function checkForOverlaps(solution: solution) {
        const circles = fromObjectNotation(solution);
        for (let c = 0; c < circles.length; c++) {
            const element = circles[c];
            if (element.radius > 0) { 
                return true;
            }
        }
        return false;
    }

    function findISOCode(countryName:string) {
        return countries.getAlpha3Code(countryName, "en") ? countries.getAlpha3Code(countryName, "en") : countryName
    }

</script>
{#if currentDataSelection.length > 0}
<div> 
    {#if scaledLayoutArticles && checkForOverlaps(rawVennArticles)}
    <div class="text-sm text-center">by {currentDataSelection[0].articlesOverlapSize} articles</div>
    <svg 
        width={svgWidth} 
        height={svgHeight} 
        class={`visualization venn ${outlet} mb-2`} 
        bind:clientWidth={svgWidth}
    >   
        <g>
            {#each Object.keys(scaledLayoutArticles) as key, k}
                {#if scaledLayoutArticles[key].radius > 0}
                    <circle 
                        cx={scaledLayoutArticles[key].x} 
                        cy={scaledLayoutArticles[key].y} 
                        r={scaledLayoutArticles[key].radius}
                    />
                    <text 
                        class={`${outlet}`} 
                        x={scaledLayoutArticles[key].x} 
                        y={scaledLayoutArticles[key].y  + 3} 
                    >
                        {findISOCode(key)}
                    </text>
                {/if}
            {/each}
        </g>
    </svg>
    {:else}
        <div>No data</div>
    {/if}
</div>
<div>
    {#if scaledLayoutKws && checkForOverlaps(rawVennKws)}
    <div class="text-sm text-center mt-8">
        by {currentDataSelection[0].keywordsOverlapSize} keywords
    </div>
    <svg 
        width="100%" 
        height={svgHeight} 
        class={`visualization venn ${outlet}`}
        bind:clientWidth={svgWidth}
    >    
        <g>
            {#each Object.keys(scaledLayoutKws) as key, k}
                {#if scaledLayoutKws[key].radius > 0}
                    <circle 
                        cx={scaledLayoutKws[key].x} 
                        cy={scaledLayoutKws[key].y} 
                        r={scaledLayoutKws[key].radius}
                    />
                    <text 
                        class={`${outlet}`}
                        x={scaledLayoutArticles[key].x} 
                        y={scaledLayoutArticles[key].y + 3} 
                    >
                        {findISOCode(key)}
                    </text>
                {/if}
            {/each}
        </g>
    </svg>

    {:else}
         <div>No data</div>
    {/if}
</div>
{/if}