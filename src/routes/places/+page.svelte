<script lang="ts">
    import type { PageProps } from './$types';
    import scrollama from "scrollama";

    import rawIntroText from "@/content/places/places-intro.md?raw";
    import rawOutroText from "@/content/places/places-outro.md?raw";
    import TextRenderer from '$lib/essay/TextRenderer.svelte';
    import TotalCoverageBar from "$lib/places/totalCoverageBars.svelte";
    import TotalCovLegend from '$lib/places/totalCovLegend.svelte';
    import VoronoiTreemap from '$lib/places/voronoiTreemap.svelte';
    import VennDiagram from '$lib/places/VennDiagram.svelte';

    let { data }: PageProps = $props();
    const scroller = scrollama();
    let step = $state(0);

    $effect(() => {
        scroller
        .setup({
            step: ".step",
            debug: false,
            offset: 0.3
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
                <TextRenderer rawtext={rawIntroText}/>
            </div>
        </section>
        <section id="scrolly-1" class=" md:flex">
            <figure class="sticky w-full h-dvh top-50 md:py-4 md:basis-2/3 md:top-0 xl:py-10 xl:p-4">
                <TotalCoverageBar countryData={data} step={step}/>
            </figure>
            <article class="w-full z-10 ml-4 relative md:basis-1/3">
                <div data-step="0" class="step p-6 table" style="min-height:600px">
                    <div class="align-middle table-cell">
                        <h2 class="mb-4">What countries and geographic entities are mentioned the most?</h2>
                        <p class="mb-4">
                            Let us consider all geographical entities used as meta-keywords. These words have different granularities. 
                            At a low level we have names of cities, like Berlin or New York, sometimes even names of neighborhoods, like Manhattan (NY). 
                            At a higher level, we have names of states (Baden-Wuttemberg, Ohio), countries (Bolivia, Italien, Greenland), 
                            and supra-national geo-political or geographical entities (Red Sea, Atlantic Ocean).
                        </p>
                        <p>
                            For both outlets, between 40 to 50% of news content tagged with  geo-related keywords refer to the newspaper's own country. 
                            The rest of this coverage is split across other countries, as shown on the left. 
                            The frequency at which certain geo-political entities are referred to translates into relevance for the reader. 
                            This relevance is constructed by following certain patterns.
                        </p>
                    </div>
                </div>
                <div data-step="1" class="step px-4 table" style="height:200px">
                    <div class="align-top table-cell">
                        <p>
                            For instance, global conflicts receive the lion share of mentions, in both newspapers. 
                            The meta-keywords for Israel, Palestine (Gaza), Russia, China, Ukraine, United Kingdom, 
                            France, Iran, Lebanon and Europe are in the top 10 of the New York Times.
                        </p>
                    </div>
                </div>
                <div data-step="2" class="step px-4" style="height:200px">
                    For Zeit, the outlook is similar, with important differences. First, the US is the most referenced country. 
                    Then, Palestine is seldom referenced – outside of the top 20. China is also less referenced than in NYT coverage.
                </div>
                <div data-step="3" class="step px-4" style="height:200px">
                    For both outlets, the remaining 10 countries express more closely the interest in countries that are either geographically or economically close. 
                    For the NYT these are Canada, Georgia, Germany, Mexico, Japan, Syria, India, Italy, South Korea, and Brazil.
                </div>
                <div data-step="4" class="step px-4" style="height:200px">
                    From the Zeit perspective, relevant keywords relate to countries mostly part of the EU or with a direct shared border with Germany. 
                    Exceptions are Turkey (close to Germany for political and social reasons) and Middle Eastern countries close to the Israel-Palestine or Russia-Ukraine conflicts.
                </div>
                <div class="p-2 xl:py-8 h-dvh">
                    <div>
                        <TotalCovLegend />
                    </div>
                </div>
            </article>
        </section>
        <section id="scrolly-2" class="md:flex md:flex-row-reverse">
            <figure class="sticky w-full h-dvh top-0 md:basis-2/3 p-4">
                <VoronoiTreemap regionData={data.coverageByRegion}/>
            </figure>
            <article class="w-full relative md:basis-1/3">
                <div data-step="4" class="step p-6 table" style="height:900px">
                    <div class="align-middle table-cell">
                        <h2 class="mb-4">Are there geographical spheres of interest?</h2>
                        <p>
                            Starting from these differences it is worthwhile to question to which extent the two newspapers focus on specific areas, rather than others. 
                        </p>
                    </div>
                </div>
                <div data-step="5" class="step p-6 table" style="height:900px">
                    <div class="align-middle table-cell">
                        For the New York Times, half of the coverage is tagged with geo-political keywords about the two regions of Asia and Middle East. This delineates a largely conflict-first approach. 
                    </div>
                </div>
                <div data-step="6" class="step p-6 table" style="height:900px">
                    <div class="align-middle table-cell">
                        For Zeit, Europe is the main region of interest. The coverage of the Russia-Ukraine conflict is much higher than the one focusing on the Israel–Palestine situation. 
                        Generally, the coverage of European countries is more nuanced and based on individual countries – whereas a good portion of the NYT coverage refers generally to “Europe”.    
                    </div>
                </div>
                <div data-step="7" class="step p-6 table" style="height:900px">
                    <div class="align-middle table-cell">
                        Maybe one of the most important aspects is the lack of reciprocal attention. 
                        Content tagged with keywords related to the United States takes up almost 20% of Zeit news, whereas for the NYT the direct reference to Germany is much less central, 
                        as the newspaper produces more content on historical partners like the United Kingdom.    
                    </div>
                </div>
                <div data-step="8" class="step p-6 table" style="height:900px">
                    <div class="align-middle table-cell">
                    The NYT also provides tags about geographical entities that are not directly associated with countries, like natural landmarks or geographically 
                    distinct areas encompassing several countries (seas, deserts, etc.).
                    This shows a different strategy in producing and tagging content.
                    </div>
                </div>
            </article>
        </section>
        <section id="scrolly-3" class="w-full bg-red-100">
            <figure class="w-full">
                <VennDiagram data={data.data}/>
            </figure>
            <article></article>
        </section>
        <section id="outro" style="height:500px">
            <div class="w-full md:w-3/7 m-auto">
                <TextRenderer rawtext={rawOutroText}/>
            </div>
        </section>
    </div>
</div>