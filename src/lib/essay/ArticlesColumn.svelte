<script lang="ts">
	import ArticleTile from "./ArticleTile.svelte";

    let {data, index} = $props();
    const keysOfSamples = $derived(Object.keys(data))
</script>
<div class="bg-red-100 border w-full">
    <div class="m-2">
        {#each keysOfSamples as key}
            <ArticleTile article={data[key]}/>
        {/each}
    </div>
</div>