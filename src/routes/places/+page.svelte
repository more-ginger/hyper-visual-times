<script lang="ts">
    import type { PageProps } from './$types';
    import scrollama from "scrollama";
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
            <div class="w-full md:w-3/7 m-auto">
                <div class="m-10">
                    <h1 class="mb-2">The Geo-Politics of news</h1>
                    <h3 class="mb-2">
                        Comparing the use of indexing terms in the New York Times and Die Zeit
                    </h3>
                    <p>
                        This chapter looks into the geopolitics of news outlets. Using the keywords that describe articles, the analysis looks into the most common topics and how different countries are covered from the perspective of one specific outlet. 
                        The results show the complexity of geo-political relations: going from the choice of names to how often certain countries are covered it is possible to see how editorial lines follow the countries’ geopolitical understanding of the globe. 
                        Furthermore, how countries are described show a stark divide between Western and all other countries.
                    </p>
                </div>
            </div>
        </section>
        <section id="scrolly" class="md:flex">
            <figure class="sticky w-full h-dvh top-50 md:w-5/7 md:top-0 p-4"><TotalCoverageBar countryData={data} step={step}/></figure>
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