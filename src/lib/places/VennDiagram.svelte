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

    const secondaryDropdownData = $derived(
        countriesOverlap
            .sort((a, b) => (b.NYTShare - a.NYTShare))
            .map((d) => { 
            return {
                key:d.country,
                count: d.NYTShare  
            }
        })
    )


    let secondaryCountry: { key: string; count: number } | null = $state(null)
    // let secondaryCountryData: { key: any; shared: any; setsNYT?: any[]; setsZeit?: any[] } | null = $state(null)
    
    $effect(() => {
        secondaryCountry = secondaryDropdownData[1];
    })

    $inspect("data", data)
    let secondaryCountryData = $derived(countriesOverlap.find((d: {country:string}) => (secondaryCountry ? d.country == secondaryCountry.key : null)))
    const diagramArticlesNYT = $derived(secondaryCountryData ? layout(secondaryCountryData.articleSetsNYT) : null) 
    const diagramNYT = $derived(secondaryCountryData ? layout(secondaryCountryData.setsNYT) : null) 
    const diagramArticlesZeit = $derived(secondaryCountryData ? layout(secondaryCountryData.articleSetsZeit) : null) 
    const diagramZeit = $derived(secondaryCountryData ? layout(secondaryCountryData.setsZeit) : null) 


    $inspect(secondaryCountryData)
</script>
<div>
    <div>
        First country: 
        <Dropdown 
          availableFilter={dropdownData} 
          bind:selected={primaryCountry}
      />
  </div>
  {#if secondaryCountry}
        <div>
            Second country: 
            <Dropdown 
            availableFilter={secondaryDropdownData} 
            bind:selected={secondaryCountry}
        />
    </div>
  {/if}
  <div class="w-full flex">
        <div class="w-1/2">
            NYT Articles overlap:
            <svg class="bg-yellow-100" width="100%"  height="400px">
                {#if diagramArticlesNYT}
                    {#each diagramArticlesNYT as item}
                        <path d={item.path} fill="none" stroke="black" stroke-width="2" />
                        {#if item.data.sets.length <= 1}
                            {#each item.data.sets as country}
                                <text x={item.text.x} y={item.text.y} text-anchor="middle">{country}</text>
                            {/each}
                        {/if}
                    {/each}
                {/if}
            </svg>
            NYT Categories overlap:
            <svg class="bg-green-100" width="100%" height="400px">
                {#if diagramNYT}
                    {#each diagramNYT as item}
                        <path d={item.path} fill="none" stroke="black" stroke-width="2" />
                        {#if item.data.sets.length <= 1}
                            {#each item.data.sets as country}
                                <text x={item.text.x} y={item.text.y} text-anchor="middle">{country}</text>
                            {/each}
                        {/if}
                    {/each}
                {/if}
            </svg>
        </div>
        <div class="w-1/2">
            Zeit Articles overlap:
            <svg class="bg-violet-100" width="100%"  height="400px">
                {#if diagramArticlesZeit}
                    {#each diagramArticlesZeit as item}
                        <path d={item.path} fill="none" stroke="black" stroke-width="2" />
                        {#if item.data.sets.length <= 1}
                            {#each item.data.sets as country}
                                <text x={item.text.x} y={item.text.y} text-anchor="middle">{country}</text>
                            {/each}
                        {/if}
                    {/each}
                {/if}
            </svg>
            Zeit Categories overlap:
            <svg class="bg-blue-100" width="100%" height="400px">
                {#if diagramZeit}
                    {#each diagramZeit as item}
                        <path d={item.path} fill="none" stroke="black" stroke-width="2" />
                        {#if item.data.sets.length <= 1}
                            {#each item.data.sets as country}
                                <text x={item.text.x} y={item.text.y} text-anchor="middle">{country}</text>
                            {/each}
                        {/if}
                    {/each}
                {/if}
            </svg>
        </div>
  </div>
</div>