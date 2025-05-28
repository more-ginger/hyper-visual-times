<script lang="ts">
    let {data, comparisonCountry} = $props()
    let sources = ["nyt", "zeit"]
    let isArticles = $state(true)
    let nytArticles = $state<any[]>([])
    let zeitArticles = $state<any[]>([])

    function changeOverlapVariable() {
        isArticles = !isArticles
    }
    
    const currentDataSelection = $derived(
        comparisonCountry ? 
        data.filter((d:{country:string}) => {return d.country == comparisonCountry.key}) 
        : null
    )

    const currentArticlesSelection = $derived.by<null | any[]>(() => {
            let currentNYTSelection = currentDataSelection && currentDataSelection.length > 0 
                ? currentDataSelection[0].articleSetsNYT 
                : null
            
            let currentZeitSelection = currentDataSelection && currentDataSelection.length > 0 
                ? currentDataSelection[0].articleSetsZeit 
                : null

            let vennSelection = currentNYTSelection || currentZeitSelection 
                ? currentNYTSelection.concat(currentZeitSelection) 
                : null
            
                return vennSelection;
        }
    )

    const currentZeitKeywordsSelection = $derived.by(() => {
        let keywords: any[] = []
        let currentZeitSelection = currentDataSelection && currentDataSelection.length > 0 
                ? currentDataSelection[0].setsZeit 
                : null

        if (currentZeitSelection) {
            currentZeitSelection.forEach((set) => {
                if (set.sets.length > 1) {
                    keywords.push(...set.shared)
                }
            })
        }
        return keywords
    })

    const currentNYTKeywordsSelection = $derived.by(() => {
        let keywords: any[] = []
        let currentNYTSelection = currentDataSelection && currentDataSelection.length > 0 
                ? currentDataSelection[0].setsNYT
                : null

        if (currentNYTSelection) {
            currentNYTSelection.forEach((set) => {
                if (set.sets.length > 1) {
                    keywords.push(...set.shared)
                }
            })
        }
        return keywords
    })

    $effect(() => {
        nytArticles = []
        zeitArticles = []
        if (currentArticlesSelection)
        currentArticlesSelection.forEach((set: {sets: [], shared:[]}) => {
            if (set.sets.length > 1) {
                set.shared.forEach((id:string) => {
                    let source = id.includes("nyt") ? sources[0]: sources[1]
                    fetch(`/api/articles?source=${source}&id=${encodeURIComponent(id)}`)
                    .then(res => res.json())
                    .then(data => {
                        const headline = data.headline
                        const pub_date = Date.parse(data.pub_date) 
                        if (data.source == "ZEIT ONLINE") {
                            zeitArticles.push({
                                headline: headline, 
                                pub_date: data.pub_date, 
                                parsed_pub_date: pub_date
                            })
                        } else {
                            nytArticles.push(
                                {
                                    headline: headline, 
                                    pub_date: data.pub_date,
                                    parsed_pub_date: pub_date
                                })
                        }
                    })

                })
            }
        })
    })
</script>

<div class="h-full">
    <button class="m-2 cursor-pointer" onclick={changeOverlapVariable}>
        {#if isArticles}
            <p>Show shared keywords instead of articles</p>
        {:else}
            <p>Show shared articles instead of keywords</p>
        {/if}
    </button>
    <div class="bg-nyt-light h-full max-h-80 overflow-auto px-2 m-2 rounded-sm border border-nyt-dark">
        {#await nytArticles}
            <p>Loading NYT Articles...</p>
        {:catch error}
            <p>{error.message}</p>
        {:then nytArticles} 
            <div>
                <p class="sticky top-2 bg-nyt-light nyt-dark border border-nyt-dark my-2 px-2 rounded-sm size-fit bg-nyt-light">The New York Times</p>
                <div class="mt-4">
                    {#if isArticles}
                    {#each nytArticles as article}
                        <p class="text-xs mt-2 border-b border-dotted border-nyt-dark">
                            {article.headline}
                        </p>
                    {/each}
                    {:else}
                        <div>
                            {#each currentNYTKeywordsSelection as keyword}
                                <p>{keyword}</p>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        {/await}
    </div>
    <div class="bg-zeit-light h-full max-h-80 overflow-auto px-2 m-2 rounded-sm border border-zeit-dark">
        {#await zeitArticles}
            <p>Loading Zeit Articles...</p>
        {:catch error}
            <p>{error.message}</p>
        {:then zeitArticles}
                <div>
                    <p class="sticky top-2 bg-zeit-light border border-zeit-dark my-2 px-2 rounded-sm size-fit">Zeit Online</p>
                    <div class="mt-4">
                        {#if isArticles} 
                            {#each zeitArticles as article}
                                <p class="text-xs mt-2 border-b border-dotted border-zeit-dark">
                                    {article.headline}
                                </p>
                            {/each}
                        {:else}
                        <div>
                            {#each currentZeitKeywordsSelection as keyword}
                                <p>{keyword}</p>
                            {/each}
                        </div>
                        {/if}
                    </div>
                </div>      
        {/await}
    </div>
</div>