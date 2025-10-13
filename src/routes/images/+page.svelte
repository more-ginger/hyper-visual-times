<script lang="ts">
	import rawIntroText from '@/content/images/images-intro.md?raw';
	import rawOutroText from '@/content/images/images-outro.md?raw';
	import BlocksRenderer from '$lib/common/BlocksRenderer.svelte';
	import scrollama from 'scrollama';
	import { onMount } from 'svelte';

	const scroller = scrollama();
	let step = $state(0);
	onMount(() => {
		scroller
			.setup({
				step: '.step',
				debug: false
			})
			.onStepEnter((response) => {
				//step = response.index;
				console.log('entering block', response.index);
				// { element, index, direction }
			})
			.onStepExit((response) => {
				//step = response.index;
				console.log('exiting block', response.index);
				// { element, index, direction }
			});
	});
</script>

<div class="base m-auto w-11/12 pt-20" class:opacity-0={!true} class:opacity-100={true}>
	<div id="images-essay">
		<section id="intro" class="mb-30">
			<div class="m-auto w-full md:w-3/7">
				<BlocksRenderer rawtext={rawIntroText} />
			</div>
		</section>
		<section id="scrolly-1" class="md:flex md:flex-row-reverse">
			<figure class="sticky top-0 h-dvh w-full p-4 md:basis-2/3 xl:p-4 xl:pt-20"></figure>
			<article class="relative w-full md:basis-1/3">
				<div data-step="0" class="step p-6">
					<div class="table-cell align-middle">
						<h2 class="font-serif text-xl">Are there geographical spheres of interest?</h2>
						<p class="mb-2"></p>
					</div>
				</div>
				<div data-step="1" class="step p-6" style="height:900px">
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
			</article>
		</section>
		<section id="scrolly-2" class="md:flex md:flex-row-reverse">
			<figure class="sticky top-0 h-dvh w-full p-4 md:basis-2/3 xl:p-4 xl:pt-20"></figure>
			<article class="relative w-full md:basis-1/3">
				<div data-step="0" class="step p-6">
					<div class="table-cell align-middle">
						<h2 class="font-serif text-xl">Are there geographical spheres of interest?</h2>
						<p class="mb-2"></p>
					</div>
				</div>
				<div data-step="1" class="step p-6" style="height:900px">
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
			</article>
		</section>
		<section class="mt-2" id="outro">
			<div class="m-auto w-full md:w-3/7">
				<BlocksRenderer rawtext={rawOutroText} />
			</div>
		</section>
	</div>
</div>
