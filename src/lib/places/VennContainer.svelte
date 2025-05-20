<script lang="ts">
    import { venn, scaleSolution } from "@upsetjs/venn.js";
	import VennDiagram from "./VennDiagram.svelte";

    let {data, comparisonCountry} = $props()
    let svgWidth = $state(400);
    const svgHeight = 500;
    const padding = 20; // optional
    const scaleToFit = false;

    const currentDataSelection = $derived(data.filter((d:{country:string}) => {return d.country == comparisonCountry.key}))

    const commonSets = $derived.by(() => {
        const domainValues = currentDataSelection[0]
            .setsNYT.map((set:{}) => set)
            .concat(
                currentDataSelection[0]
                .setsZeit.map((set:{}) => set)
            ) 
        return domainValues
    })

    const rawVenns = $derived(currentDataSelection.length > 0 ? venn(commonSets) : {})
    
    const scaledSets = $derived.by(() => {
        let scaledSets: { [key: string]: any } = {};
        Object.keys(rawVenns).forEach((key) => {
                const dataPoint = { ...rawVenns[key], key }; // optionally include key in object
                scaledSets[key] = dataPoint;
        })

        return scaledSets
    })

    const scaledLayoutNYT = $derived(
        scaleSolution(
            rawVenns, 
            svgWidth, 
            svgHeight, 
            padding, 
            scaleToFit
        )
    );    
</script>
<div class="w-full flex">
    <div class="w-full" bind:clientWidth={svgWidth}>
        <VennDiagram 
            data={scaledLayoutNYT} 
            rawData={scaledSets}
        />
    </div>
</div>