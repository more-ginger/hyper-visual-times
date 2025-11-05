<script>

	import scrollama from 'scrollama';
	import { onMount } from 'svelte';
	import translateMap from '../../content/data/images/translate_map.json';
	import visualStoryline from '../../content/data/images/visual_mentions_storyline.json';
	import rawIntroText from '@/content/images/images-intro.md?raw';
	import rawOutroText from '@/content/images/images-outro.md?raw';

	import BlocksRenderer from '$lib/common/BlocksRenderer.svelte';
	import OutletSwitch from '$lib/common/OutletSwitch.svelte';
	import ImageStreamgraph from '$lib/images/ImageStreamgraph.svelte';
	import ImageNetworkgraph from '$lib/images/ImageNetworkgraph.svelte';
	import ImageBubblechart from '$lib/images/ImageBubblechart.svelte';	
	import { selectedView } from '$lib/utils/state.images.svelte.ts';

	//scrollama setup
	let step = $state(0);
	let selectedSource = $state('NYT');
	let selectedWeek = $state('');
	let selectedPeople = $state([]);
	onMount(async () => {
		selectedView.set('streamgraph');
		scrollama().setup({
				step: '.step',
				offset: 0.3,
				debug: false
			})
			.onStepEnter((response) => {
				step = response.index;
				if (visualStoryline[step] && step > 0) {
					selectedSource = visualStoryline[step].source;
				} else {
					selectedSource = 'NYT';
				}
			});
	});

</script>

<div class="base m-auto w-11/12 pt-20" class:opacity-0={!true} class:opacity-100={true}>
	<div id="images-essay">
		<video src="img/images_teaser_desktop.webm" autoplay muted loop></video>
		<section id="intro" class="mb-30">
			<div class="m-auto w-full md:w-3/7">
				<BlocksRenderer rawtext={rawIntroText} />
			</div>
		</section>
		<section id="scrolly-1" class="md:flex md:flex-row-reverse">	
			{#if $selectedView == 'bubblechart'}
			<figure class="sticky top-20 h-dvh w-full basis-full">
				<ImageBubblechart {selectedSource} {selectedWeek} {selectedPeople}  />
			</figure>	
			{:else if $selectedView == 'streamgraph'}
			<figure class="sticky top-20 h-dvh w-full basis-1/2 p-6 md:basis-7/10 xl:p-4">
				<ImageStreamgraph {selectedSource}  bind:selectedWeek={selectedWeek} bind:selectedPeople={selectedPeople} />
			</figure>
			{/if}
			<article class={`relative w-full basis-1/2 md:basis-3/10 ${$selectedView == 'bubblechart' ? '!basis-0 invisible !w-0' : ''}`}>
				<div data-step="0" class="step p-6" style="height: 100vh;">
					<div class="table-cell align-middle">
						<h2 class="font-serif text-xl">1. Visual Domination</h2>
						<p>
							Grassland (2023) has already observed how Western European newspapers tend to cover
							macro-regions.
						</p>
						<img src="img/images-streamgraph-legend.svg" class="my-2" alt="">
						<p>
							Grassland (2023) has already observed how Western European newspapers tend to cover
							macro-regions.
						</p>

					</div>
				</div>
				<div data-step="1" class="step p-6" style="height:100vh">
					<div class="table-cell align-middle">
						Grassland (2023) has already observed how Western European newspapers tend to cover
						macro-regions of interests: areas that have geographical and political significance for
						the host country of the newspaper. Looking at the visualization on the right, this
						observation seems to be confirmed: for Zeit, Central and Western Europe are the main
						regions of interest. Even in relation to conflict and against the cultural background
						that ties Germany and Israel, the use of Russia-Ukraine keywords is much higher than
						Israel–Palestine ones.
					</div>
				</div>
				<div data-step="2" class="step p-6" style="height:100vh">
					<div class="table-cell align-middle">Donald Trump</div>
				</div>
			</article>	
			
		</section>
		<section class="mt-2">
				<article class="m-auto w-full md:w-3/7">
					Grassland (2023) has already observed how Western European newspapers tend to cover
					macro-regions of interests: areas that have geographical and political significance for
					the host country of the newspaper. Looking at the visualization on the right, this
					observation seems to be confirmed: for Zeit, Central and Western Europe are the main
					regions of interest. Even in relation to conflict and against the cultural background
					that ties Germany and Israel, the use of Russia-Ukraine keywords is much higher than
					Israel–Palestine ones.
				</article>
				<figure class="h-screen w-full p-4 xl:p-4 xl:pt-20">
					<ImageNetworkgraph {selectedSource} />
				</figure>
		</section>
		<section class="mt-2" id="outro">
			<div class="m-auto w-full md:w-3/7">
				<BlocksRenderer rawtext={rawOutroText} />
			</div>
		</section>
	</div>
</div>
