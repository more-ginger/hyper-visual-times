<script lang="ts">
    import ArticlesColumn from "./ArticlesColumn.svelte";
    import Illustration from "./Illustration.svelte"
    let { data, step } = $props();
    
    let shuffledZeitArticles = $derived(data.zeit_all.sort(() => 0.5 - Math.random()))
    let randomZeitSelection = $derived(shuffledZeitArticles.slice(0, 6));
    
    let shuffledNYTArticles = $derived(data.nyt_all.sort(() => 0.5 - Math.random()))
    let randomNYTSelection = $derived(shuffledNYTArticles.slice(0, 6));

    let dataSampleForRow = $derived(
        randomNYTSelection.map((article: { /* define the article type here */ }, a: number) => {
        return {
            nyt: article,
            zeit: randomZeitSelection[a]
        }
    }))
</script>

<figure class="">
    {#if step === 0}
    <div class="h-dvh">
        <div class="relative bg-red-100 z-10 w-1/2 top-100">text</div>
        <div class="relative h-dvh flex z-40">
            {#each dataSampleForRow as articlesPair, a}
                <ArticlesColumn data={articlesPair} index={a + 1}/>
            {/each}
        </div>
    </div>
    {/if}
    {#if step === 1}
        <div>
            <Illustration/>
        </div>
    {/if}
</figure>
