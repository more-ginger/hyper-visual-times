<script lang="ts">
    import type { PageProps } from './$types';
    import scrollama from "scrollama";

    import rawIntroText from "@/content/places-essay.md?raw";
    import IntroductionText from '$lib/common/IntroductionText.svelte';
    import TotalCoverageBar from "$lib/places/totalCoverageBar.svelte";

    let { data }: PageProps = $props();
    const scroller = scrollama();
    let step = $state(0);

    $effect(() => {
        scroller
        .setup({
            step: ".step",
        })
        .onStepEnter((response) => {
            step = response.index
            // { element, index, direction }
        })
        .onStepExit((response) => {
            // { element, index, direction }
        });
    })

</script>
<div class="base w-11/12 m-auto">
    <div id="places-essay">
        <section id="intro" class="mt-12 mb-30">
            <div class="w-full md:w-3/7 m-auto"><IntroductionText rawIntroText={rawIntroText}/></div>
        </section>
        <section id="scrolly" class="md:flex">
            <figure class="sticky w-full h-dvh top-50 md:w-5/7 md:top-0 p-4">
                <TotalCoverageBar countryData={data} step={step}/>
            </figure>
            <article class="w-full z-10 relative md:w-2/7">
                <div data-step="0" class="step bg-green-200" style="height:900px">Step 1</div>
                <div data-step="1" class="step bg-green-100" style="height:900px">Step 2</div>
                <div data-step="2" class="step bg-green-100" style="height:900px">Step 3</div>
                <div data-step="3" class="step bg-green-100" style="height:900px">Step 4</div>
            </article>
        </section>
        <section id="outro" style="height:500px"></section>
    </div>
</div>