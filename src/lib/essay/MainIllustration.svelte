<script lang="ts">
    import ArticlesColumn from "./ArticlesColumn.svelte";
    let { data } = $props();
    
    let shuffledZeitArticles = $derived(data.zeit_all.sort(() => 0.5 - Math.random()))
    let randomZeitSelection = $derived(shuffledZeitArticles.slice(0, 4));
    
    let shuffledNYTArticles = $derived(data.nyt_all.sort(() => 0.5 - Math.random()))
    let randomNYTSelection = $derived(shuffledNYTArticles.slice(0, 4));

    let dataSampleForRow = $derived(randomNYTSelection.map((article: { /* define the article type here */ }, a: number) => {
        return {
            nyt: article,
            zeit: randomZeitSelection[a]
        }
    }))
</script>
<div class="w-full h-full flex">
    {#each dataSampleForRow as articlesPair, a}
        <ArticlesColumn data={articlesPair} index={a + 1}/>
    {/each}
</div>