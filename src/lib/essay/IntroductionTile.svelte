<script lang="ts">
    import ArticlesRow from "./ArticlesRow.svelte";
    let { data } = $props();

    const colClasses: Record<number, string> = {
        0: "col-start-2 xl:col-start-3 2xl:col-start-6 col-span-2",
        1: "col-start-4 xl:col-start-5 2xl:col-start-8 col-span-2",
        2: "col-start-6 xl:col-start-7 2xl:col-start-10 col-span-2",
        3: "col-start-8 xl:col-start-9 2xl:col-start-12 col-span-2"
    }

</script>
<div class="w-full h-full">
    <div class="z-20 h-full flex items-center">
        <img class="w-full m-2 sticky top-20" src="img/hvtms-main.svg" alt="The Hyper-Visual Times logo"/>
    </div>
</div>
<div class="w-11/12 m-auto">
    <div class="w-fit absolute top-20 left-0">
        <div class="grid grid-cols-10 xl:grid-cols-12 2xl:grid-cols-18">
            {#await data.randomNYTSelection}
                <div></div>
            {:then randomNYTSelection}
                {#each randomNYTSelection as article, a}
                    <div class={`${a % 2 !== 0 ? "-z-10" : ""} ${colClasses[a]}`}>
                        <ArticlesRow {article} {a}/>
                    </div>
                {/each}
            {/await}
        </div>
    </div>
    <div class="absolute top-100 left-0">
        <div class="grid grid-cols-10 xl:grid-cols-12 2xl:grid-cols-18">
            {#await data.randomZeitSelection}
                <div></div>
            {:then randomZeitSelection}
                {#each randomZeitSelection as article, a}
                    <div class={`${a % 2 === 0 ? "-z-10" : ""} ${colClasses[a]}`}>
                        <ArticlesRow {article} {a}/>
                    </div>
                {/each}
            {/await}
        </div>
    </div>
</div>