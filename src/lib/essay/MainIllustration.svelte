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
<figure class="w-full">
    <div class="w-full h-dvh flex">
        {#each dataSampleForRow as articlesPair, a}
            <ArticlesColumn data={articlesPair} index={a + 1}/>
        {/each}
    </div>
    <div>
        <img src="img/pn-news-illustration.svg"/>
    </div>
    <div>
        <img src="img/pn-news-illustration_step2.svg"/>
    </div>
        <div>
        <img src="img/pn-news-illustration_step3.svg"/>
    </div>
        <div>
        <img src="img/pn-news-illustration_step4.svg"/>
    </div>
</figure>
