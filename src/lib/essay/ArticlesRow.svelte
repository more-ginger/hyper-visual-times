<script lang="ts">
    import { getRandomInt } from "$lib/utils/actions.svelte";
    let { article, a } = $props()
    const randomIntTranslate = getRandomInt(1, 50);
</script>
<div 
    class={`relative bg-white/75 backdrop-blur-xs rounded-sm border m-2 p-2 ${a % 2 === 0 ? "delay-150 animate-bounce-two" : "delay-700 animate-bounce"}`}  
    style="transform: translateY({randomIntTranslate}%)"
    >
        <div class="overflow-hidden max-h-55 w-full">
            <img class="mb-2" src={article.multimedia} alt="Pulled dynamically from the source outlet"/>
        </div>
        <h4 class="mb-2">{article.headline}</h4>
</div>

