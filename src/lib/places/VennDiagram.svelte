<script lang="ts">
    import Dropdown from "$lib/common/Dropdown.svelte";
    import type { countryDataType } from '../../types';

    let {data} = $props()
    
    let dropdownData = $state(data.map((el) => {
        return {
            key: el.country
        }
    }))

    let firstCountrySelected = $state(dropdownData[0])
    let secondCountrySelected = $state(dropdownData[1])
    let selectedCountries = $state<string[]>([])
    let results = $state([])


    function toggleSelection(countries: string[]) {
        const selectedDataPoints = countries.map((c) => {
            return data.find((el:countryDataType) => el.country === c)
        })

        selectedCountries = [...selectedDataPoints]
    }

    $effect(() => {
        toggleSelection(
            [firstCountrySelected.key, 
            secondCountrySelected.key
        ])
    })

    

</script>
<div>
    <div>
          First country: <Dropdown availableFilter={dropdownData} bind:selected={firstCountrySelected}/>
    </div>
    <div>
        Second country: <Dropdown availableFilter={dropdownData} bind:selected={secondCountrySelected}/>
  </div>
</div>