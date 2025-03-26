<script lang="ts">
    import type { PageProps } from './$types';
    import scrollama from "scrollama";

    import rawIntroText from "@/content/places-essay.md?raw";
    import IntroductionText from '$lib/essay/IntroductionText.svelte';
    import TotalCoverageBar from "$lib/places/totalCoverageBar.svelte";
    import VoronoiTreemap from '$lib/places/voronoiTreemap.svelte';

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
        <section id="scrolly-1" class="md:flex">
            <figure class="sticky w-full h-dvh top-50 md:basis-2/3 md:top-0 p-4">
                <TotalCoverageBar countryData={data} step={step}/>
            </figure>
            <article class="w-full z-10 mx-4 relative md:basis-1/3">
                <div data-step="0" class="step px-4" style="height:600px">
                    In both newspapers, global conflicts receive the lion share of mentions. 
                    The meta-keywords for Israel, Palestine (Gaza), Russia, China, Ukraine, United Kingdom, France, Iran, Lebanon and Europe are in the top 10 of the New York Times.
                </div>
                <div data-step="1" class="step px-4" style="height:300px">
                    For Zeit, the outlook is similar, with important differences. 
                    First, the US is the most referenced country. Then, Palestine is seldom referenced – outside of the top 20.
                </div>
                <div data-step="2" class="step px-4" style="height:300px">
                    The following 10 countries express more closely the interest in countries that are either geographically or economically close. 
                    For the NYT these are Canada, Georgia, Germany, Mexico, Japan, Syria, India, Italy, South Korea, and Brazil.
                </div>
                <div data-step="3" class="step px-4" style="height:300px">From the Zeit perspective, relevant keywords relate to countries mostly part of the EU or with a direct shared border with Germany. 
                    Exceptions are Turkey (close to Germany for political and social reasons) and Middle Eastern countries close to the Israel-Palestine or Russia-Ukraine conflicts.</div>
            </article>
        </section>
        <section id="scrolly-2" class="md:flex md:flex-row-reverse">
            <figure class="sticky w-full h-dvh top-0 md:basis-2/3 p-4">
                <VoronoiTreemap regionData={data.coverageByRegion}/>
            </figure>
            <article class="w-full relative md:basis-1/3">
                <div data-step="4" class="step" style="height:900px">Step 4</div>
                <div data-step="5" class="step" style="height:900px">Step 5</div>
                <div data-step="6" class="step" style="height:900px">Step 6</div>
                <div data-step="7" class="step" style="height:900px">Step 7</div>
            </article>
        </section>
        <section id="outro" style="height:500px"></section>
    </div>
</div>