<script lang="ts">
    import IntroductionTile from "$lib/essay/IntroductionTile.svelte";
    import rawIntroText from "@/content/main-intro.md?raw";
    import rawEssayText from "@/content/main-essay.md?raw";
    import scrollama from "scrollama";
	import BlocksRenderer from "$lib/essay/BlocksRenderer.svelte";

    let { data } = $props()

    const scroller = scrollama();
    let step = $state(0);
    let essayIsRendered = $state(false);
    let essayHasSteps = $state(false);
    
    function onEssayRender(data:{isEssayRendered:boolean, hasSteps:boolean}) {
        essayIsRendered = data.isEssayRendered
        essayHasSteps = data.hasSteps
    }

    $effect(() => {
        if (essayIsRendered && essayHasSteps) {
            console.log("init step!")
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
        <div class="w-full h-dvh">
            <IntroductionTile {data}/>
        </div>
        <div>
            <BlocksRenderer rawtext={rawIntroText}/>
        </div>
        <div>
            <BlocksRenderer rawtext={rawEssayText} {onEssayRender}/>
        </div>
        <!-- <div id="essay-container" class="w-full">
            <div class="w-full h-dvh top-0 md:top-0">
                <MainIllustration data={data} step={step}/>
            </div>
            <div class="md:w-3/9">
                <div>
                    <BlocksRenderer rawtext={rawIntroText} {onEssayRender}/>
                </div>
            </div>
        </div> -->
    </div>
</main>


