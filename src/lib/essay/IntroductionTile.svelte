<script lang="ts">
    import ArticlesRow from "./ArticlesRow.svelte";
    let { data } = $props();

</script>
<div class="w-full h-full">
    <div class="z-20 h-full flex items-center">
        <img class="w-full m-2 sticky top-20" src="img/hvtms-main.svg" alt="The Hyper-Visual Times logo"/>
    </div>
</div>
<div class="absolute w-full h-dvh top-0 left-0 mb-100">
    <div class="w-fit absolute top-20 left-0">
        <div class="grid grid-cols-10 xl:grid-cols-12">
            {#await data.randomNYTSelection}
                <div></div>
            {:then randomNYTSelection}
                {#each randomNYTSelection as article, a}
                    <div class={`${a % 2 !== 0 ? "-z-10" : ""} col-start-${a * 2 + 2} col-span-2 xl:col-start-${a * 2 + 3}`}><ArticlesRow {article} {a}/></div>
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
                    <div class={`${a % 2 === 0 ? "-z-10" : ""} col-start-${a * 2 + 2} col-span-2 xl:col-start-${a * 2 + 3}`}><ArticlesRow {article} {a}/></div>
                {/each}
            {/await}
        </div>
    </div>
</div>