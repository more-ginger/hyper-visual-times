<script lang="ts">
    import { getRandomInt } from "$lib/utils/actions.svelte";
    let { article, a } = $props()
    const randomIntTranslate = getRandomInt(1, 50);
    let src = $state(article.multimedia)

    function handleImgError() {
        if (src.includes("zeit")) {
            src = "img/placeholder-zeit.png"
        } else {
            src = "img/placeholder-nyt.png"
        }        
    }

</script>
<div 
    class={`relative bg-white/75 backdrop-blur-xs rounded-sm border m-2 p-2 ${a % 2 !== 0 ? "delay-150 animate-bounce-two" : "delay-700 animate-bounce"}`}
    
    >
        <div class="overflow-hidden max-h-45 w-full">
            <img 
                class="mb-2 w-full" 
                src={src} 
                alt="Pulled dynamically from the source outlet"
                onerror={handleImgError}
            />
        </div>
        <h4 class="pb-0 text-xs md:text-lg">{article.headline}</h4>
</div>

