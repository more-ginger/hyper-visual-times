<script lang="ts">
    import Dropdown from "$lib/common/Dropdown.svelte";
	import { text } from "@sveltejs/kit";
    import type { countryDataType } from '../../types';
    import { layout } from "@upsetjs/venn.js";

    let {data} = $props()
    
    let dropdownData = $state(data.map((el) => {
        return {
            key: el.country
        }
    }))

    let firstCountrySelected = $state(dropdownData[0])
    let secondCountrySelected = $state(dropdownData[1])
    let thirdCountrySelected = $state(dropdownData[2])
    let selectedCountries = $state<any[]>([])

    function toggleSelection(countries: string[]) {
        const selectedDataPoints = countries.map((c) => {
            return data.find((el:countryDataType) => el.country === c)
        })

        selectedCountries = [...selectedDataPoints]
    }

    let results = $derived.by(
        () => {
            const sets = []
            for (let i = 0; i < selectedCountries.length; i++) {
                for (let j = i; j < selectedCountries.length; j++) {
                    const a = selectedCountries[i];
                    const b = selectedCountries[j];
                    if (!a || !b) continue;
                    const aKeywords = new Set(Object.keys(a.keywords_nyt))
                    const bKeywords = new Set(Object.keys(b.keywords_nyt))
                    const shared = [...aKeywords].filter(k => bKeywords.has(k));
    
                    if (shared.length > 0) {
                        sets.push({
                            sets: a.country === b.country 
                                ? [a.country] 
                                : [a.country, b.country],
                            size: shared.length,
                            shared
                        })
                    }
                }
            }

            return sets.sort((a, b) => b.size - a.size)
        }
    )

    $effect(() => {
        toggleSelection(
            [
                firstCountrySelected.key, 
                secondCountrySelected.key,
                thirdCountrySelected.key
            ]
        )
    })

    const diagram = $derived(selectedCountries.length > 0 ? layout(results) : null)
    $inspect(diagram)
    
</script>
<div class="w-full">
    <div>
          First country: 
          <Dropdown 
            availableFilter={dropdownData} 
            bind:selected={firstCountrySelected}
        />
    </div>
    <div>
        Second country: 
        <Dropdown 
            availableFilter={dropdownData} 
            bind:selected={secondCountrySelected}
        />
    </div>
    <div>
        Second country: 
        <Dropdown 
            availableFilter={dropdownData} 
            bind:selected={thirdCountrySelected}
        />
    </div>
  <svg width="100vw" height="100vh">
    {#if diagram}
        {#each diagram as item}
            <path d={item.path} fill="none" stroke="black" stroke-width="2" />
            {#if item.data.sets.length <= 1}
                {#each item.data.sets as country}
                    <svg:text x={item.text.x} y={item.text.y} text-anchor="middle">{country}</svg:text>
                {/each}
            {/if}
        {/each}
    {/if}
  </svg>
</div>