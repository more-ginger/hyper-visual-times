<script lang="ts">
    let {nodes, primaryCountryKey, outlet} = $props()

    type Article = { countryName:string, headlines: string[], count:number }
    let articles = $state<Article[]>([])

    async function fetchArticles(country:{country:string, shared_articles: string[]}) {
        if (country.shared_articles.length === 0) {
            return {countryName: country.country, headlines: [], count: country.shared_articles.length}
        }

        const sliced = country.shared_articles.slice(0, 3);
        const ids = sliced.map(id =>  encodeURIComponent(id)).join("&id=");

        try {
            const response = await fetch(`/api/articles?source=${outlet}&id=${ids}`);
            const data = await response.json();
            if (data.length > 0) {
                const headlines = data.map((d: {headline:string}) => d.headline);
                return { countryName: country.country, headlines, count: country.shared_articles.length }
            }
        } catch (error) {
            console.error("Error fetching article headlines:", error);
        }
    }

    const fetchAllArticles = async() => {
            articles = [];
            const articlePromises = nodes.map((country:{country:string, shared_articles: string[]}) => fetchArticles(country));
            const fetchedArticles = await Promise.all(articlePromises);
            // Sort articles by count before setting state
            articles = [...fetchedArticles].sort((a, b) => b.count - a.count);
    }

    $effect(() => {
        fetchAllArticles();
    })
</script>
<div>
    {#await nodes && articles}
        <div>Loading</div>
    {:then articles}
        <div class={`h-100 border rounded-md overflow-auto mx-2 my-2 border-${outlet}-dark`}>
        {#each articles as country, c}
        {#if country.headlines.length > 0}
            <div class={`w-full flex ${c !== 0 && "border-t"} border-${outlet}-dark border-b p-2 text-${outlet}-dark`}>
                <div class="w-1/2 flex grow">
                    <h4 class="pb-0">{primaryCountryKey}</h4>
                    <div class="grid place-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M2 8c0 .414.336.75.75.75h8.69l-1.22 1.22a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06l-2.5-2.5a.75.75 0 1 0-1.06 1.06l1.22 1.22H2.75A.75.75 0 0 0 2 8Z" clip-rule="evenodd" />
                    </svg>
                    </div>
                    <h4 class="pb-0">{country.countryName}</h4>
                </div>
                <div>
                    preview 3 of {country.count} articles
                </div>
            </div>
            <div class="my-2">
                {#each country.headlines as headline}
                    <div class={`border-b border-dotted px-2 border-${outlet}-light text-${outlet}-dark`}>{headline}</div>
                {/each}
            </div>
        {/if}
        {/each}
        </div>
    {/await}
</div>