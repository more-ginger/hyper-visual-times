<script lang="ts">
    import { getRandomInt } from "$lib/utils/actions.svelte";
	import ArticleTile from "./ArticleTile.svelte";

    let {data, index} = $props();
    const keysOfSamples = $derived(Object.keys(data))
    const randomInt = getRandomInt(1, 10);

</script>
<div class="w-full h-full border-r border-gray-200">
    <div class="m-2 relative" style="transform: translateY({randomInt}%)">
        {#each keysOfSamples as key}
            <ArticleTile article={data[key]} rowIndex={key} columnIndex={index}/>
        {/each}
    </div>
</div>