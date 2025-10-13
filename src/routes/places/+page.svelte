<script lang="ts">
	import type { PageProps } from './$types';
	import scrollama from 'scrollama';

	import rawIntroText from '@/content/places/places-intro.md?raw';
	import rawOutroText from '@/content/places/places-outro.md?raw';
	import rawChapter3Text from '@/content/places/places-chapter-3.md?raw';
	import BlocksRenderer from '$lib/common/BlocksRenderer.svelte';

	import TotalCoverageBar from '$lib/places/totalCoverageBars.svelte';
	import TotalCovLegend from '$lib/places/totalCovLegend.svelte';
	import VoronoiTreemap from '$lib/places/voronoiTreemap.svelte';
	import VoronoiLegend from '$lib/places/voronoiLegend.svelte';
	import NetworkContainer from '$lib/places/NetworkContainer.svelte';
	import Load from '$lib/common/Load.svelte';

	let { data }: PageProps = $props();
	const scroller = scrollama();
	let step = $state(0);
	let networkMounted = $state(false);

	$effect(() => {
		scroller
			.setup({
				step: '.step',
				debug: false
			})
			.onStepEnter((response) => {
				step = response.index;
				// console.log("entering block", step)
				// { element, index, direction }
			})
			.onStepExit((response) => {
				step = response.index;
				// console.log("exiting block", step)
				// { element, index, direction }
			});
	});

	function handleNetworkMount() {
		networkMounted = true;
	}
</script>

{#await data}
	<p>Waiting for data</p>
{:then data}
	<div
		class="bg-ivory-default/90 fixed fixed z-100 h-[200vh] w-full overflow-hidden backdrop-blur-sm md:hidden"
	>
		<div class="flex h-[98vh]">
			<p class="m-4 inline-block self-center text-center align-middle">
				Your device is too small. This visualization tool requires a large viewport to be used
				meaningfully! Please switch tablet or desktop computer.
			</p>
		</div>
	</div>
	<div
		class="base m-auto w-11/12 pt-20"
		class:opacity-0={!networkMounted}
		class:opacity-100={networkMounted}
	>
		<div id="places-essay">
			<section id="intro" class="mb-30">
				<div class="m-auto w-full md:w-3/7">
					<BlocksRenderer rawtext={rawIntroText} />
				</div>
			</section>
			<section id="scrolly-2" class="md:flex md:flex-row-reverse">
				<figure class="w-full p-4 sticky top-0 h-dvh md:basis-2/3 xl:p-4 xl:pt-20">
					<VoronoiTreemap regionData={data.coverageByRegion} {step} />
				</figure>
				<article class="relative w-full md:basis-1/3">
					<div data-step="0" class="step p-6">
						<div class="table-cell align-middle">
							<h2 class="font-serif text-xl">Are there geographical spheres of interest?</h2>
							<p class="mb-2">
								Let us consider all geographical entities used as meta-keywords. For both outlets,
								between 40 to 50% of news content tagged with geo-related keywords refer to the
								newspaper's own country. The rest of this coverage is split across other countries,
								as shown on the left. The frequency at which certain geo-political entities are
								referred to translates into relevance for the reader. This relevance is constructed
								by following certain patterns. For example, these keywords are set at different
								granularities. At a low level we have names of cities, like Berlin or New York,
								sometimes even names of neighborhoods, like Manhattan (NY). At a higher level, we
								have names of states (Baden-Wuttemberg, Ohio), countries (Bolivia, Italien,
								Greenland), and supra-national geo-political or geographical entities (Red Sea,
								Atlantic Ocean). If we reduce the granularity by aggregating all localities with
								their country and assign each region and country to macro-regions, we can observe
								how newspapers have different areas of interest.
								<img
									src="img/localities-keywords.svg"
									alt="Diagram of the process of keywords abstraction, 
									from top to down: localities, provinces and states, countries, and regions. 
									The top layers are shown to flow into the bottom ones with arrows pointing down."
								/>
							</p>
							<p>
								The resulting abstraction is shown in the visualization on the right, with the world
								“split” into areas of interest based on how much either Die Zeit or The New York
								Times cover a specific country.
							</p>
						</div>
					</div>
					<div data-step="1" class="step p-6" style="height:900px">
						<div class="table-cell align-middle">
							Grassland (2023) has already observed how Western European newspapers tend to cover
							macro-regions of interests: areas that have geographical and political significance
							for the host country of the newspaper. Looking at the visualization on the right, this
							observation seems to be confirmed: for Zeit, Central and Western Europe are the main
							regions of interest. Even in relation to conflict and against the cultural background
							that ties Germany and Israel, the use of Russia-Ukraine keywords is much higher than
							Israel–Palestine ones.
						</div>
					</div>
					<div data-step="2" class="step p-6" style="height:900px">
						<div class="table-cell align-middle">
							For the New York Times, half of the coverage is tagged with geo-political keywords
							about the two regions of Asia and Middle East. At first, this delineates a largely
							conflict-first approach, with the Israel-Palestine conflict as central. However, it
							also brings forward a much broader concern of the newspaper for foreign affairs,
							especially if compared with Zeit.
						</div>
					</div>
					<div data-step="3" class="step p-6" style="height:900px">
						<div class="table-cell align-middle">
							The NYT also provides tags about geographical entities that are not directly
							associated with countries, like natural landmarks or geographically distinct areas
							encompassing several countries (seas, deserts, etc.). This shows a different, possibly
							more granular, strategy in producing and tagging content.
						</div>
					</div>
					<div data-step="4" class="step p-6" style="height:900px">
						<div class="table-cell align-middle">
							However, whereas for Zeit the coverage of European countries is more nuanced and based
							on individual countries – a good portion of the NYT coverage refers generally to
							“Europe”. In this sense, one of the most important aspects that emerge is the lack of
							reciprocal attention. Content tagged with keywords related to the United States takes
							up almost 20% of Zeit news, whereas for the NYT the direct reference to Germany is
							much less central.
						</div>
					</div>
					<div data-step="5" class="step h-dvh p-2 xl:py-10">
						<div>
							<VoronoiLegend />
						</div>
					</div>
				</article>
			</section>
			<section id="scrolly-1" class=" md:flex">
				<figure class="sticky top-50 h-dvh w-full md:top-0 md:basis-2/3 md:py-4 xl:p-4 xl:pt-20">
					<TotalCoverageBar countryData={data} {step} />
				</figure>
				<article class="relative z-10 ml-4 w-full md:basis-1/3">
					<div data-step="7" class="step table px-4" style="height:600px">
						<div class="table-cell align-top">
							<h2 class="font-serif text-xl">
								What countries and geographic entities are mentioned the most?
							</h2>
							<p>
								For instance, global conflicts receive the lion share of mentions, in both
								newspapers. The meta-keywords for Israel, Palestine (Gaza), Russia, China, Ukraine,
								United Kingdom, France, Iran, Lebanon and Europe are in the top 10 of the New York
								Times.
							</p>
						</div>
					</div>
					<div data-step="8" class="step p-6 px-4" style="height:600px">
						For Zeit, the outlook is similar, with important differences. First, the US is the most
						referenced country. Then, Palestine is seldom referenced – outside of the top 20. China
						is also less referenced than in NYT coverage.
					</div>
					<div data-step="9" class="step p-6 px-4" style="height:600px">
						For both outlets, the remaining 10 countries express more closely the interest in
						countries that are either geographically or economically close. For the NYT these are
						Canada, Georgia, Germany, Mexico, Japan, Syria, India, Italy, South Korea, and Brazil.
					</div>
					<div data-step="10" class="step p-6 px-4" style="height:600px">
						From the Zeit perspective, relevant keywords relate to countries mostly part of the EU
						or with a direct shared border with Germany. Exceptions are Turkey (close to Germany for
						political and social reasons) and Middle Eastern countries close to the Israel-Palestine
						or Russia-Ukraine conflicts.
					</div>
					<div data-step="11" class="step h-dvh p-2 xl:py-10">
						<div>
							<TotalCovLegend />
						</div>
					</div>
				</article>
			</section>
			<section id="scrolly-3" class="w-full">
				<article class="m-auto w-full md:w-3/7">
					<BlocksRenderer rawtext={rawChapter3Text} />
				</article>
				<figure class="w-full md:top-0 md:basis-2/3 md:py-4 xl:p-4 xl:py-10">
					<NetworkContainer data={data.data} onMounted={handleNetworkMount} />
				</figure>
			</section>
			<section class="mt-2" id="outro">
				<div class="m-auto w-full md:w-3/7">
					<BlocksRenderer rawtext={rawOutroText} />
				</div>
			</section>
		</div>
	</div>
{/await}

<!-- Loading state -->
{#if !networkMounted}
	<Load />
{/if}
