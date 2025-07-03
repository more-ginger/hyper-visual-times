<script lang="ts">
    import ArticlesRow from "./ArticlesRow.svelte";
    let { data } = $props();
    let shuffledZeitArticles = $derived(data.zeit_all.sort(() => 0.5 - Math.random()))
    let randomZeitSelection = $derived(shuffledZeitArticles.slice(0, 5));
    
    let shuffledNYTArticles = $derived(data.nyt_all.sort(() => 0.5 - Math.random()))
    let randomNYTSelection = $derived(shuffledNYTArticles.slice(0, 5));

     console.log(data)
</script>
<div class="w-full h-full">
    <div class="z-20 h-full flex items-center">
        <img class="w-full bg-green-100" src="img/hvtms-main.svg" alt="The Hyper-Visual Times logo"/>
    </div>
    <!-- <div class="flex absolute top-1 z-40">
        {#await randomNYTSelection}
            <div></div>
        {:then randomNYTSelection}
            {#each randomNYTSelection as article}
                <ArticlesRow {article}/>
            {/each}
        {/await}
    </div>
    <div class="flex absolute z-10">
        {#await randomZeitSelection}
            <div></div>
        {:then randomZeitSelection}
            {#each randomZeitSelection as article}
                <ArticlesRow {article}/>
            {/each}
        {/await}
    </div> -->
</div>