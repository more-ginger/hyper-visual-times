<script lang="ts">
    import Dropdown from "$lib/common/Dropdown.svelte";
    import type { countryDataForComparison } from '../../types';
    import VennContainer from "./VennContainer.svelte";


    let {data} = $props()
    let isArticles = $state(true)

    function changeComparisonVariable () {
        isArticles = !isArticles
    }
     
    // The first dropdown lets the user 
    // select the primary country for analysis
    let dropdownData = $state(
        data.map((d:countryDataForComparison) => {
            return {
                key: d.country,
                count: d.count_zeit + d.count_nyt
            }
        }).sort((a: { count: number }, b: { count: number }) => (b.count - a.count)))

    // Set the primary country to calc overlaps
    let primaryCountry = $state(dropdownData[0])
    // Init the comparison country to avoid issues
    let comparisonCountry: { key: string; count: number } | null = $state(null)

    let countriesOverlap = $derived.by(
        () => {
            const overlaps: any[] = []
            let variableForComparison = isArticles ? "ids_of_articles" : "keywords"
            const a = data.find((d: {country:string}) => (d.country == primaryCountry.key))
            const aSetNyt = {
                sets: [a.country + "_nyt"],
                label: [a.country], 
                size: a[`${variableForComparison}_nyt`].length, 
                shared: a[`${variableForComparison}_nyt`],
            }
            
            const aSetZeit = {
                sets: [a.country + "_zeit"],
                label: [a.country], 
                size: a[`${variableForComparison}_zeit`].length, 
                shared: a[`${variableForComparison}_zeit`]
            }
            
            
            for (let i = 0; i < data.length; i++) {
                const b = data[i];
                const bSetNyt = {
                    sets: [b.country + "_nyt"], 
                    label: [b.country],
                    size: Object.keys(b.keywords_nyt).length, 
                    shared: b[`${variableForComparison}_nyt`]
                }

                
                const bSetZeit = {
                    sets: [b.country + "_zeit"],
                    label: [b.country],
                    size: Object.keys(b.keywords_zeit).length, 
                    shared: b[`${variableForComparison}_zeit`]
                }

                if (a.country == b.country) continue
            
                const aOverlappingNYT = new Set(a[`${variableForComparison}_nyt`])
                const bOverlappingsNYT = new Set(b[`${variableForComparison}_nyt`])
                const sharedNYT = [...aOverlappingNYT].filter(k => bOverlappingsNYT.has(k))

                const aOverlappingZeit = new Set(a[`${variableForComparison}_zeit`])
                const bOverlappingZeit = new Set(b[`${variableForComparison}_zeit`])
                const sharedZeit = [...aOverlappingZeit].filter(k => bOverlappingZeit.has(k))

                const totalOverlapCount = (bOverlappingsNYT.size + bOverlappingZeit.size) - (sharedNYT.length + sharedZeit.length)
                
                if (sharedZeit.length > 0 || sharedNYT.length > 0) {
                    overlaps.push({
                        country: b.country,
                        totalOverlapCount,
                        setsSizeZeit: sharedZeit.length,
                        setsSizeNYT: sharedNYT.length,
                        setsZeit: [
                            aSetZeit,
                            bSetZeit,
                            {
                                sets: [a.country + "_zeit", b.country + "_zeit"],
                                size: sharedZeit.length,
                                shared: sharedZeit
                            }
                        ],
                        setsNYT: [
                            aSetNyt,
                            bSetNyt,
                            {
                            sets: [a.country + "_nyt", b.country +  "_nyt"],
                            size: sharedNYT.length,
                            shared: sharedNYT
                            }
                        ]
                    })
                }
            }

            return overlaps
        }
    )

    $inspect(countriesOverlap)

    // The secondary dropdown data are calculated based on the overlaps
    // to avoid listing empty comparisons
    let secondaryDropDownData = $derived(
        countriesOverlap.map((d:{country: string, ZeitShare:number, NYTShare:number}) => {
            return {
                key: d.country,
                count: d.ZeitShare + d.NYTShare
            }
        }).filter((d:{key:string}) => 
            primaryCountry 
            && d.key 
            !== primaryCountry.key
        )
    )

    // Set the  value for comparison to the first data value
    // in the array of secondary data for dropdown number two.
    $effect(() => {
        comparisonCountry = secondaryDropDownData[0];
    })
</script>
<div class="w-full max-h-1/2">
    <div class="w-full flex">
        <div class="w-5/7">
                <div class="flex">
                    <h4 class="mx-2">
                        How much does the coverage about:
                        <span>
                        <Dropdown 
                        availableFilter={dropdownData} 
                        bind:selected={primaryCountry}
                        />
                        </span>
                        {#if comparisonCountry}
                        <span>
                        overlaps with the one about:
                        <Dropdown 
                            availableFilter={secondaryDropDownData} 
                            bind:selected={comparisonCountry}
                        />
                    </span>
                    ?
                    {/if}
                </h4>
                </div>
        </div>
        <div class="w-2/7">
            <h4 class="mx-2">Is articles? 
                <button class="cursor-pointer" onclick={changeComparisonVariable}>
                    {isArticles}
                </button>
            </h4>
         </div>
    </div>
    <div>
        {#if comparisonCountry}
            <VennContainer 
                data={countriesOverlap} 
                comparisonCountry={comparisonCountry}
            />
        {/if}
    </div>
</div>