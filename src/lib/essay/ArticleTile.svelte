<script lang="ts">
    import { getRandomInt } from "$lib/utils/actions.svelte";
    let { article, rowIndex, columnIndex } = $props();
    const randomIntTranslate = getRandomInt(1, 5);
    const randomIntDelay = getRandomInt(1, 10);

</script>
<div 
    class={`${columnIndex % 2 === 0 ? "delay-150 animate-bounce-two" : "delay-700 animate-bounce"}`} 
    style="transform: translateY({rowIndex === "zeit" ? randomIntTranslate*10 : 0}%)"
>
    <div>
        <img class="rounded-sm border my-2" src={article.multimedia} alt="Pulled dynamically from the source outlet"/>
        <h4 class="mb-2">{article.headline}</h4>
        <p class="text-xs mb-2">{article.snippet}</p>
        <!-- <p class="">
            {#each JSON.parse(article.keywords) as keyword}
                <span class="inline text-xs">{keyword}</span>
            {/each}
        </p> -->
    </div>
    <div>

    </div>
</div>