<script lang="ts">
    import ArticlesRow from "./ArticlesRow.svelte";
    let { data } = $props();
    let w = $state(0);
    let NYTSelectionBasedOnW = $derived(w <= 400 ? data.randomNYTSelection.slice(0, 2) : data.randomNYTSelection)
    let ZeitSelectionBasedOnW = $derived(w <= 400 ? data.randomZeitSelection.slice(0, 2) : data.randomZeitSelection)


    const colClasses: Record<number, string> = {
        0: "md:col-start-2 xl:col-start-3 2xl:col-start-6 col-span-2",
        1: "md:col-start-4 xl:col-start-5 2xl:col-start-8 col-span-2",
        2: "md:col-start-6 xl:col-start-7 2xl:col-start-10 col-span-2",
        3: "md:col-start-8 xl:col-start-9 2xl:col-start-12 col-span-2"
    }
</script>
<div class="w-full h-full" bind:clientWidth={w}>
    <div class="z-20 h-full flex items-center">
        <img class="w-full m-2 sticky top-20 " src="img/hvtms-main.svg" alt="The Hyper-Visual Times logo"/>
    </div>
    <div class="absolute top-15 md:left-0 md:w-full w-full md:w-11/12 h-full m-auto">
        <div class="relative w-full h-full -z-10 2xl:max-h-[76.6vh]">
             <div class="h-full grid grid-cols-4 md:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-18">
                {#each NYTSelectionBasedOnW as article, a}
                    <div class={` border-ivory-dark/20 ${colClasses[a]} ${a === NYTSelectionBasedOnW.length - 1 ? "border-r border-l" : "border-l"}`}></div>
                {/each}
             </div>
        </div>
        <div class="absolute w-fit top-10 md:top-25 md:left-0">
            <div class="w-11/12 m-auto grid grid-cols-4 md:w-full md:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-18">
                {#await NYTSelectionBasedOnW}
                    <div></div>
                {:then NYTSelectionBasedOnW}
                    {#each NYTSelectionBasedOnW as article, a}
                        <div class={`${a % 2 !== 0 ? "-z-10" : ""} ${colClasses[a]}`}>
                            <ArticlesRow {article} {a}/>
                        </div>
                    {/each}
                {/await}
            </div>
        </div>
        <div class="absolute w-fit top-65 md:top-120 md:left-0">
            <div class="w-11/12 m-auto grid grid-cols-4 md:w-full md:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-18">
                {#await ZeitSelectionBasedOnW}
                    <div></div>
                {:then ZeitSelectionBasedOnW}
                    {#each ZeitSelectionBasedOnW as article, a}
                        <div class={`${a % 2 === 0 ? "-z-10" : ""} ${colClasses[a]}`}>
                            <ArticlesRow {article} {a}/>
                        </div>
                    {/each}
                {/await}
            </div>
        </div>
    </div>
</div>
