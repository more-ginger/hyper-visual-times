<script lang="ts">
    import Dropdown from "$lib/common/Dropdown.svelte";
    import type { countryDataType } from '../../types';
    import { layout } from "@upsetjs/venn.js";
    import { setContext } from 'svelte';

    let {data} = $props()
    let currentOutlet = "nyt"
    // The first dropdown lets the user select the primary country for analysis
    let dropdownData = $state(data.map((el:countryDataType) => {
        return {
            key: el.country,
            count: el.count_zeit + el.count_nyt
        }
    }).sort((a: { count: number }, b: { count: number }) => (b.count - a.count)))

    let primaryCountry = $state(dropdownData[0])
    let nytComparisonCountry: { key: string; count: number } | null = $state(null)
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

    
    $effect(() => {
        if (nytComparisonCountry == null) {
            nytComparisonCountry = nytDropdownData[0];
        }
    })

    $effect(() => {
        comparisonCountry = zeitDropdownData
            .find((el) => nytComparisonCountry ? el.key == nytComparisonCountry.key : null) || null;
    })

    // needed for NYT venns
    let nytCountryData = $derived(
        countriesOverlap
            .find((d: {country:string}) => (
                nytComparisonCountry 
                ? d.country == nytComparisonCountry.key 
                : null)
            )
        )

</script>
<div>
    <div>
        First country: 
        <Dropdown 
          availableFilter={dropdownData} 
          bind:selected={primaryCountry}
      />
  </div>
  <div class="flex">
    {#if comparisonCountry}
        <div>
            NYT country: 
            <Dropdown 
            availableFilter={nytDropdownData} 
            bind:selected={comparisonCountry}
        />
        </div>
    {/if}
    {#if comparisonCountry}
        <div>
            Zeit country: 
            <Dropdown 
            availableFilter={zeitDropdownData} 
            bind:selected={comparisonCountry}
        />
        </div>
    {/if}
  </div>

</div>