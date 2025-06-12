<script lang="ts">
    let {nodes, primaryCountryKey, outlet} = $props()

    type Article = { countryName:string, headlines: string[] }
    let articles = $state<Article[]>([])

    async function fetchArticles(country:{country:string, shared_articles: string[]}) {
        if (country.shared_articles.length === 0) {
            return {countryName: country.country, headlines: []}
        }

        const sliced = country.shared_articles.slice(0, 1);
        const ids = sliced.map(id =>  encodeURIComponent(id)).join("&id=");

        try {
            const response = await fetch(`/api/articles?source=${outlet}&id=${ids}`);
            const data = await response.json();
            if (data.length > 0) {
                const headlines = data.map((d: {headline:string}) => d.headline);
                return { countryName: country.country, headlines }
            }
        } catch (error) {
            console.error("Error fetching article headlines:", error);
        }
    }

    const fetchAllArticles = async() => {
            articles = [];
            const articlePromises = nodes.map((country:{country:string, shared_articles: string[]}) => fetchArticles(country));
            const fetchedArticles = await Promise.all(articlePromises);
            articles = [...fetchedArticles]
    }

    $effect(() => {
        fetchAllArticles();
    })

</script>
<div class="">
    {#await articles}
        <div>Loading</div>
    {:then articles}
        {#each articles as country}
        {#if country.headlines.length > 0}
            <div class="flex">
                {primaryCountryKey} 
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                    <path fill-rule="evenodd" d="M2 8c0 .414.336.75.75.75h8.69l-1.22 1.22a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06l-2.5-2.5a.75.75 0 1 0-1.06 1.06l1.22 1.22H2.75A.75.75 0 0 0 2 8Z" clip-rule="evenodd" />
                </svg>
                {country.countryName}
            </div>
            {#each country.headlines as headline}
                <div>{headline}</div>
            {/each}
        {/if}
        {/each}
    {/await}
</div>