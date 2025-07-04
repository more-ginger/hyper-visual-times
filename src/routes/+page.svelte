<script lang="ts">
    import IntroductionTile from "$lib/essay/IntroductionTile.svelte";
    import rawIntroText from "@/content/main-intro.md?raw";
    import rawEssayText from "@/content/main-essay.md?raw";
    import scrollama from "scrollama";
	import BlocksRenderer from "$lib/essay/BlocksRenderer.svelte";
	import Illustration from "$lib/essay/Illustration.svelte";

    let { data } = $props()

    const scroller = scrollama();
    let step = $state(0);
    let progress = $state(0);
    let direction = $state("");
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
                offset: 0.7,
                progress: true
            })
            .onStepEnter((response) => {
                step = response.index
                direction = response.direction
                // { element, index, direction }
            })
            .onStepProgress((response)=> {
                progress = response.progress
            })
            .onStepExit((response) => {
                //
            }) 
        }
    })
</script>

<main>
    <div class="w-11/12 m-auto z-0">
        <div>
            <div class="w-full h-dvh top-20 2xl:max-h-[80vh]">
                <IntroductionTile {data}/>
            </div>
            <div class="flex w-10/12 m-auto">
                <div class="w-3/10">
                    <div class="my-5">
                        <p class="italic border-b">
                            This website contains a series of reflections on the circulation and consumption patterns of news in the digital environment. 
                            Using metadata from several newsrooms’ archives, each experiment deals with a feature of digital news: keywords, text, and images. 
                            Using a combination of computational methods, three individual chapters pivot around a series of design and data visualization 
                            experiments with news data.
                        </p>
                        <div>
                            <h5>Browse chapters:</h5>
                            <div>
                                <li>
                                    <ul>The Geo-politics of news</ul>
                                    <ul>The Geo-politics of news</ul>
                                    <ul>The Geo-politics of news</ul>
                                </li>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-7/10">
                    <BlocksRenderer rawtext={rawIntroText}/>
                </div>
            </div>
        </div>
        <div class="w-full m-auto z-0">
            <section>
                <figure class="top-10 py-5 sticky w-full h-[91vh]">
                    <Illustration {step} {progress} {direction}/>
                </figure>
                <article class="w-full relative">
                    <BlocksRenderer 
                        rawtext={rawEssayText} 
                        {onEssayRender}
                    />
                </article>
            </section>
        </div>
    </div>
</main>


