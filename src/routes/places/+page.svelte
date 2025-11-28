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
	import { LinkHandler } from '$lib/utils/linkhandler.svelte';
	import { onMount } from 'svelte';
	import { getCoveragePerCountry } from '$lib/utils/request.svelte.ts';

	//let { data }: PageProps = $props();
	const scroller = scrollama();
	let step = $state(0);
	let networkMounted = $state(false);
	let data = $state(null);
	onMount(async () => {
		data = await getCoveragePerCountry();
		await new Promise((resolve) => setTimeout(resolve, 100)); // wait a tick to ensure DOM is ready
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

{#if !data}
	<p>Waiting for data</p>
{:else}
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
				<figure class="sticky top-0 h-dvh w-full p-4 md:basis-2/3 xl:p-4 xl:pt-20">
					<VoronoiTreemap regionData={data.coverageByRegion} {step} />
				</figure>
				<article class="relative w-full md:basis-1/3">
					<div data-step="0" class="step p-6">
						<div class="table-cell align-middle">
							<h2 class="text-l font-serif">Geographical Spheres of Interest</h2>
							<p class="mb-2">
								Let’s consider all geographical entities used as meta-keywords.For both outlets,
								between 40 to 50% of news content tagged with geo-related keywords refer to the
								newspaper's own country. The rest of this coverage is split across other countries,
								as shown on the left. The frequency at which certain geo-political entities are
								referred to translates into relevance for the reader. This relevance is constructed
								by following certain patterns. For example, these keywords are set at different
								granularities. At a low level we have names of cities, like Berlin or New York,
								sometimes even names of neighborhoods, like <span class="nyt">Manhattan (NY)</span>
								. At a higher level, we have names of states (<span class="zeit">
									Baden-Württemberg
								</span>,
								<span class="nyt">Ohio</span>), countries (<span class="nyt">Bolivia</span>,
								<span class="zeit">Italien</span>,
								<span class="nyt">Greenland</span>), and supra-national geo-political or
								geographical entities (<span class="nyt">Red Sea</span>,
								<span class="nyt">Atlantic Ocean</span>). If we reduce the granularity by
								aggregating all localities with their country and assign each region and country to
								macro-regions, we can observe how newspapers have different areas of interest.
								<img
									src={LinkHandler('/img/localities-keywords.svg')}
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
							Usually, Western European newspapers tend to cover macro-regions of interests: areas
							that have geographical and political significance for the host country of the
							newspaper (Grasland,2023). Looking at the visualization on the right, this observation
							seems to be confirmed: for <span class="zeit">Zeit Online</span>, Central and Western
							Europe are the main regions of interest. Regarding ongoing conflicts and against the
							cultural background that ties Germany and Israel, the use of Russia-Ukraine keywords
							is still much higher than Israel–Palestine ones. Despite not being the only
							determining factor, the geographical closeness of Ukraine clearly plays an important
							role in the amount of coverage about the conflict.
						</div>
					</div>
					<div data-step="2" class="step p-6" style="height:900px">
						<div class="table-cell align-middle">
							For <span class="nyt">The New York Times</span>, half of the coverage is tagged with
							geo-political keywords related to two regions of Asia and the Middle East. At first,
							this delineates a largely conflict-first approach, with the Israel-Palestine conflict
							as central. However, it also brings forward a much broader concern of the newspaper
							for foreign affairs, especially if compared with
							<span class="zeit">Zeit Online</span>.
						</div>
					</div>
					<div data-step="3" class="step p-6" style="height:900px">
						<div class="table-cell align-middle">
							<span class="nyt">The New York Times</span> also provides tags about geographical entities
							that are not directly associated with countries, like natural landmarks or geographically
							distinct areas encompassing several countries (seas, deserts, etc.). This shows a different,
							possibly more granular, strategy in producing and tagging content.
						</div>
					</div>
					<div data-step="4" class="step p-6" style="height:900px">
						<div class="table-cell align-middle">
							However, whereas for Zeit the coverage of European countries is more nuanced and based
							on individual countries – a good portion of <span class="nyt">The New York Times</span
							>
							coverage refers generally to “Europe”. In this sense, one of the most important aspects
							that emerge is the lack of reciprocal attention. Content tagged with keywords related to
							the United States takes up almost 20% of Zeit news, whereas for
							<span class="nyt">The New York Times</span> the direct reference to Germany is much less
							central.
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
							<h2 class="text-l font-serif">The Most Covered Countries</h2>
							<p>
								Observing the newspapers’ areas of interest already gives a cue about how
								geo-political coverage is organized at broad levels. Moving at a more granular
								level, we observe the total number of articles associated with one particular
								geographical keyword. The visualization offers insight on how this type of coverage
								follows particular patterns in terms of quantity and allocation of articles.
							</p>
						</div>
					</div>
					<div data-step="8" class="step p-6 px-4" style="height:600px">
						Starting from <span class="zeit">Zeit Online</span>, it is immediately visible how
						disproportionate is the coverage of the United States if compared with any other country
						or geographical entity in the dataset. Moreover, the amount of coverage for other
						countries quickly declines after the top 5, with countries receiving less than 1000
						dedicated articles a year. Within the top 5, outside the United States and France all
						other countries (Israel, Russia and Ukraine) are involved in conflicts. <br /><br />
						This view also shows how <span class="zeit">Zeit Online</span>
						tends to maintain a strong focus on Israel, with little content tagged explicitly using keywords
						related to Palestine. This is possibly due to the political relationship between countries
						and also explains why the conflict has overall less presence throughout the corpus of articles
						– especially against <span class="nyt">The New York Times</span> coverage.
					</div>
					<div data-step="9" class="step p-6 px-4" style="height:600px">
						In this regard, the American newspaper shows the tendency to cover foreign policy in a
						broader way, but without the same volume as the German newspaper. The
						Israeli-Palestinian conflict is central, followed by Russia – outside of the top three
						China and Ukraine receive almost half of the coverage.
					</div>
					<div data-step="10" class="step p-6 px-4" style="height:600px">
						From the <span class="zeit">Zeit Online</span> perspective, coverage is tagged as related
						to countries mostly inside the EU or with a direct shared border with Germany. A notable
						exception – aside from Middle Eastern countries subject to conflict – is Turkey, which is
						close to Germany for political reasons.
					</div>
					<div data-step="10" class="step p-6 px-4" style="height:600px">
						Interestingly, this is again different for the New York Times where neighbouring
						countries do not have the same importance as other physically distant geo-political
						entities. Canada is only 11th in the list and Mexico is 14th. These trends could point
						to very distinct strategies for the two newspapers, with the New York Times producing a
						broader and more globalized outtake compared to Die Zeit. After all, The New York Times
						publishing company has itself recognized the broad newspaper reach <a
							href="https://www.nytco.com/press/new-york-times-journalism-is-read-in-every-country-on-earth/"
							target="_blank">with 27% of their readers coming from abroad.</a
						>
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
					<NetworkContainer dataRaw={data.data} onMounted={handleNetworkMount} />
				</figure>
			</section>
			<section class="mt-2" id="outro">
				<div class="m-auto w-full md:w-3/7">
					<BlocksRenderer rawtext={rawOutroText} />
				</div>
			</section>
		</div>
	</div>
{/if}

<!-- Loading state -->
{#if !networkMounted}
	<Load />
{/if}
