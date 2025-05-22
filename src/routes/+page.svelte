<script lang="ts">
    import TextRenderer from "$lib/essay/TextRenderer.svelte";
    import MainIllustration from "$lib/essay/MainIllustration.svelte";
    import rawIntroText from "@/content/main-essay.md?raw";
    import scrollama from "scrollama";
	import BlocksRenderer from "$lib/essay/BlocksRenderer.svelte";

    let { data } = $props();

    const scroller = scrollama();
    let step = $state(0);
    let essayIsRendered = $state(false);
    
    function onEssayRender(data:{isEssayRendered:boolean}) {
        essayIsRendered = data.isEssayRendered
    }

    $effect(() => {
        if (essayIsRendered) {
            scroller
            .setup({
                step: ".step",
                debug: false,
                offset: 0.7
            })
            .onStepEnter((response) => {
                step = response.index
                console.log("step", step)
                // { element, index, direction }
            })
            .onStepExit((response) => {
                //
            }) 
        }
    })
</script>

<main>
    <div class="w-11/12 m-auto z-0">
        <div id="essay-container" class="w-full flex">
            <div class="md:w-6/9 sticky h-dvh top-0 md:top-0">
                <MainIllustration data={data} step={step}/>
            </div>
            <div class="md:w-3/9 relative">
                <div>
                    <BlocksRenderer rawtext={rawIntroText} {onEssayRender}/>
                </div>
            </div>
        </div>
    </div>
</main>


