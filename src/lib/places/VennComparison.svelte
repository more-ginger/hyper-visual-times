<script lang="ts">
    import Dropdown from "$lib/common/Dropdown.svelte";
    import type { countryDataForComparison } from '../../types';
	import VennDiagram from "./VennDiagram.svelte";

    let {data} = $props()
    // The first dropdown lets the user select the primary country for analysis
    let dropdownData = $state(data.map((el:countryDataForComparison) => {
        return {
            key: el.country,
            count: el.count_zeit + el.count_nyt
        }
    }).sort((a: { count: number }, b: { count: number }) => (b.count - a.count)))

    let primaryCountry = $state(dropdownData[0])
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
                        ZeitShare: sharedZeit.length,
                        NYTShare: sharedNYT.length,
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

    const nytDropdownData = $derived(
        countriesOverlap
            .sort((a, b) => (b.NYTShare - a.NYTShare))
            .map((d) => { 
            return {
                key:d.country,
                count: d.NYTShare  
            }
        })
    )

    const zeitDropdownData = $derived(
        countriesOverlap
            .sort((a, b) => (b.ZeitShare - a.ZeitShare))
            .map((d) => { 
                return {
                    key:d.country,
                    count: d.ZeitShare  
                }
            })
    )

    // Set the  value for comparison to the first NYT data value
    // This could be switch around if we wanted the Zeit to be primary, 
    // which is likely a UX question
    $effect(() => {
        comparisonCountry = nytDropdownData[0];
    })

</script>
<div class="w-full">
    <div class="w-full mb-2">
        <div class="grid grid-flow-col justify-items-center">
                <div class="flex">
                    <p>First country:</p>
                    <Dropdown 
                    availableFilter={dropdownData} 
                    bind:selected={primaryCountry}
                    />
                </div>
        </div>
    </div>
    <div class="w-full flex bg-green-100">
        <div class="w-5/7">
            {#if comparisonCountry}
                <div class="flex">
                        <div class="mx-2">
                            <div>
                                <p class="text-center">The New York Times</p>
                                <Dropdown 
                                availableFilter={nytDropdownData} 
                                bind:selected={comparisonCountry}
                                />
                            </div>
                            <div>
                                <VennDiagram />
                            </div>
                        </div>
                        <div class="mx-2">
                            <div>
                                <p class="text-center">Die Zeit</p>
                                <Dropdown 
                                availableFilter={zeitDropdownData} 
                                bind:selected={comparisonCountry}
                                />
                            </div>
                            <div>
                                <VennDiagram />
                            </div>
                        </div>
                </div>
            {/if}
        </div>
        <div class="w-2/7">Headlines</div>
    </div>
</div>