<script lang="ts">
    import type { countryDataForComparison } from '../../types';
    import Dropdown from "$lib/common/Dropdown.svelte";
	import Network from './Network.svelte';
    let { data } = $props()

    // The first dropdown lets the user 
    // select the primary country for analysis
    let dropdownData = $state(
        data.map((d:countryDataForComparison) => {
            return {
                key: d.country,
                count: d.count_zeit + d.count_nyt
            }
        }).sort((a: { key: string }, b: { key: string }) => a.key.localeCompare(b.key)))

    // Set the primary country to calc overlaps
    let primaryCountry = $state(dropdownData[0].key)

    let nodes = $derived.by(() => {

        const a = data.find((d: {country:string}) => (d.country == primaryCountry))
        const overlaps: countryDataForComparison[] = [a]

        for (let index = 0; index < data.length; index++) {
            const b = data[index];
            if (a.country == b.country) continue

            const aArticlesNYT = new Set(a.ids_of_articles_nyt)
            const bArticlesNYT = new Set(b.ids_of_articles_nyt)
            const articlesNYT = [...aArticlesNYT].filter(k => bArticlesNYT.has(k))

            if(articlesNYT.length > 0) {
                overlaps.push(b)
            }
        }

        return overlaps
    })

    let links = $derived.by(() => {
        const links = []
        const seenPairs = new Set();

        const haveOverlap = (setA:Set<string>, setB:Set<string>) => {
            for (const id of setA) {
                if (setB.has(id)) return true;
            }
            return false;
        };

        const countOverlap = (setA:Set<string>, setB:Set<string>) => {
            let counter = 0
            for (const id of setA) {
                if (setB.has(id)) {
                    counter += 1
                }
            }
            return counter
        }

        for (let i = 0; i < nodes.length; i++) {
            for (let j = 0; j < nodes.length; j++) {
                if (i === j) continue;
                const idsA = new Set(nodes[i]["ids_of_articles_nyt"]);
                const idsB = new Set(nodes[j]["ids_of_articles_nyt"]);

                if (haveOverlap(idsA, idsB)) {
                    const countryA = nodes[i].country;
                    const countryB = nodes[j].country;
                    const pairKey = [countryA, countryB].sort().join("::");

                    if (!seenPairs.has(pairKey)) {
                        seenPairs.add(pairKey)
                        links.push({
                            source:nodes[i].country, 
                            target: nodes[j].country,
                            weight: countOverlap(idsA, idsB)
                        })
                    }
                }
            }
            
        }

        return links
    })
</script>
<div>
    <span>
        <Dropdown 
        availableFilter={dropdownData} 
        bind:selected={primaryCountry}
        />
    </span>
</div>
<div class="h-full">
    <Network {nodes} {links}/>
</div>
