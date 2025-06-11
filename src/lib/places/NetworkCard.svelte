<script lang="ts">
    import { onMount } from 'svelte';
    let {nodes, primaryCountryKey, outlet} = $props()

    type Article = { headline: string }
    let articles = $state<Article[]>([])

    $effect(() => {
        articles = []
        nodes.forEach((country:{shared_articles: string[]}) => {
            if (country.shared_articles.length > 0) {
                country.shared_articles.forEach(id => {
                    const sliced = country.shared_articles.slice(0, 1);
                    const ids = sliced.map(id =>  encodeURIComponent(id)).join("&id=")
                    fetch(`/api/articles?source=${outlet}&id=${ids}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.length > 0) {
                            data.map((d) => {
                                const headline = d.headline
                                articles.push({headline})
                            })
                        }
                    })
                })
            }
        })
    })
</script>
<div class="">
    {#await articles}
        <div>Loading</div>
    {:then articles}
        {#each articles as article}
            <div>{article.headline}</div>
        {/each}
    {/await}
</div>