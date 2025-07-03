<script lang="ts">
    import ArticlesRow from "./ArticlesRow.svelte";
    let { data } = $props();

</script>
<div class="w-full h-full">
    <div class="z-20 h-full flex items-center">
        <img class="w-full m-2 sticky top-20" src="img/hvtms-main.svg" alt="The Hyper-Visual Times logo"/>
    </div>
</div>
<div class="w-full m-auto">
    <div class="w-fit absolute top-20 left-0">
        <div class="grid grid-cols-10 xl:grid-cols-12">
            {#await data.randomNYTSelection}
                <div></div>
            {:then randomNYTSelection}
                {#each randomNYTSelection as article, a}
                    <div class={`${a % 2 !== 0 ? "-z-10" : ""} col-start-${a * 2 + 2} xl:col-start-${a + 3} col-span-2`}>
                        <ArticlesRow {article} {a}/>
                    </div>
                {/each}
            {/await}
        </div>
    </div>
    <div class="w-fit absolute top-100 left-0">
        <div class="grid grid-cols-10 xl:grid-cols-12">
            {#await data.randomZeitSelection}
                <div></div>
            {:then randomZeitSelection}
                {#each randomZeitSelection as article, a}
                    <div class={`${a % 2 === 0 ? "-z-10" : ""} col-start-${a * 2 + 2} xl:col-start-${a + 3} col-span-2`}>
                        <ArticlesRow {article} {a}/>
                    </div>
                {/each}
            {/await}
        </div>
    </div>
</div>