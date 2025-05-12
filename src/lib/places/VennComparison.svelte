<script lang="ts">
    import Dropdown from "$lib/common/Dropdown.svelte";
    import type { countryDataForComparison } from '../../types';
	import VennDiagram from "./VennDiagram.svelte";
    import VennOverlapItems from "./VennOverlapItems.svelte";

    let {data} = $props()
    
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
            const a = data.find((d: {country:string}) => (d.country == primaryCountry.key))
            const aSetNyt = {
                sets: [a.country], 
                size: Object.keys(a.keywords_nyt).length, 
                shared: a.keywords_nyt,
            }
            
            const aSetZeit = {
                sets: [a.country], 
                size: Object.keys(a.keywords_zeit).length, 
                shared: a.keywords_zeit
            }

            const aSetArticlesNyt = {
                sets: [a.country], 
                size: a.ids_of_articles_nyt.length, 
                shared: a.ids_of_articles_nyt,
            }
            
            const aSetArticlesZeit = {
                sets: [a.country], 
                size: a.ids_of_articles_zeit.length, 
                shared: a.ids_of_articles_zeit
            }
            
            
            for (let i = 0; i < data.length; i++) {
                const b = data[i];
                const bSetNyt = {
                    sets: [b.country], 
                    size: Object.keys(b.keywords_nyt).length, 
                    shared: b.keywords_nyt
                }
                
                const bSetZeit = {
                    sets: [b.country], 
                    size: Object.keys(b.keywords_zeit).length, 
                    shared: b.keywords_zeit
                }

                const bSetArticlesNyt = {
                    sets: [b.country], 
                    size: b.ids_of_articles_nyt.length, 
                    shared: b.ids_of_articles_nyt
                }
                
                const bSetArticlesZeit = {
                    sets: [b.country], 
                    size: b.ids_of_articles_zeit.length, 
                    shared: b.ids_of_articles_zeit
                }

                if (a.country == b.country) continue
            
                const aKeywordsNYT = new Set(Object.keys(a.keywords_nyt))
                const bKeywordsNYT = new Set(Object.keys(b.keywords_nyt))
                const sharedNYT = [...aKeywordsNYT].filter(k => bKeywordsNYT.has(k))

                const aArticlesNYT = new Set(a.ids_of_articles_nyt)
                const bArticlesNYT = new Set(b.ids_of_articles_nyt)
                const articlesNYT = [...aArticlesNYT].filter(k => bArticlesNYT.has(k))

                const aKeywordsZeit = new Set(Object.keys(a.keywords_zeit))
                const bKeywordsZeit = new Set(Object.keys(b.keywords_zeit))
                const sharedZeit = [...aKeywordsZeit].filter(k => bKeywordsZeit.has(k))

                const aArticlesZeit = new Set(a.ids_of_articles_zeit)
                const bArticlesZeit = new Set(b.ids_of_articles_zeit)
                const articlesZeit = [...aArticlesZeit].filter(k => bArticlesZeit.has(k))

                const totalOverlapCount = (bKeywordsNYT.size + bKeywordsZeit.size) - (sharedNYT.length + sharedZeit.length)
                
                if (articlesNYT.length > 0 || articlesZeit.length > 0) {
                    overlaps.push({
                        country: b.country,
                        totalOverlapCount,
                        ZeitKwsShare: sharedZeit.length,
                        NYTKwsShare: sharedNYT.length,
                        ZeitArticlesShare: articlesZeit.length,
                        NYTArticlesShare: articlesNYT.length,
                        setsZeit: [
                            aSetZeit,
                            bSetZeit,
                            {
                                sets: [a.country, b.country],
                                size: sharedZeit.length,
                                shared: sharedZeit
                            }
                        ],
                        articleSetsZeit: [
                            aSetArticlesZeit,
                            bSetArticlesZeit,
                            {
                                sets: [a.country, b.country],
                                size: articlesZeit.length,
                                shared: articlesZeit
                            } 
                        ],
                        setsNYT: [
                            aSetNyt,
                            bSetNyt,
                            {
                            sets: [a.country, b.country],
                            size: sharedNYT.length,
                            shared: sharedNYT
                            }
                        ],
                        articleSetsNYT: [
                            aSetArticlesNyt,
                            bSetArticlesNyt,
                            {
                                sets: [a.country, b.country],
                                size: articlesNYT.length,
                                shared: articlesNYT
                            } 
                        ],
                    })
                }
            }

            return overlaps
        }
    )

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

    let overlapsNYT = $derived(countriesOverlap.map((d) => {
        return {
            country:d.country,
            categoriesSet: d.setsNYT,
            keywordsOverlapSize: d.NYTKwsShare,
            articlesSet: d.articleSetsNYT,
            articlesOverlapSize: d.NYTArticlesShare
        }
    }))

    let overlapsZeit = $derived(countriesOverlap.map((d) => {
        return {
            country:d.country,
            categoriesSet: d.setsZeit,
            keywordsOverlapSize: d.ZeitKwsShare,
            articlesSet: d.articleSetsZeit,
            articlesOverlapSize: d.ZeitArticlesShare
        }
    }))

</script>
<div class="w-full">
    <div class="w-full mb-10">
        <div class="grid grid-flow-col justify-items-center">
                <div class="flex">
                    <p class="mx-2">Coverage about:</p>
                    <Dropdown 
                    availableFilter={dropdownData} 
                    bind:selected={primaryCountry}
                    />
                    {#if comparisonCountry}
                    <p class="mx-2">overlaps with:</p>
                    <Dropdown 
                        availableFilter={secondaryDropDownData} 
                        bind:selected={comparisonCountry}
                    />
                    {/if}
                </div>
        </div>
    </div>
    <div class="w-full flex">
        <div class="w-5/7">
            {#if comparisonCountry}
                <div class="flex w-full">
                        <div class="mx-2 w-1/2">
                            <div>
                                <p class="text-sm text-center">In <span class="text-nyt-violet-dark">The New York Times</span></p>
                            </div>
                            <div>
                                <VennDiagram 
                                    data={overlapsNYT} 
                                    comparisonCountry={comparisonCountry}
                                    outlet={"NYT"}
                                />
                            </div>
                        </div>
                        <div class="mx-2 w-1/2">
                            <div>
                                <p class="text-sm text-center">In <span class="text-zeit-peach-dark">Zeit Online</span></p>
                            </div>
                            <div>
                                <VennDiagram 
                                    data={overlapsZeit} 
                                    comparisonCountry={comparisonCountry}
                                    outlet={"Zeit"}
                                />
                            </div>
                        </div>
                </div>
            {/if}
        </div>
        <div class="w-2/7 text-center px-10">
            <VennOverlapItems />
        </div>
    </div>
</div>