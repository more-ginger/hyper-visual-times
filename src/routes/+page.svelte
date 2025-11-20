<script lang="ts">
	import IntroductionTile from '$lib/main/IntroductionTile.svelte';
	import rawIntroText from '@/content/main-intro.md?raw';
	import rawEssayText from '@/content/main-essay.md?raw';
	import rawOutroText from '@/content/main-outro.md?raw';
	import scrollama from 'scrollama';
	import BlocksRenderer from '$lib/common/BlocksRenderer.svelte';
	import Illustration from '$lib/main/Illustration.svelte';
	import Chapters from '$lib/main/Chapters.svelte';
	import Load from '$lib/common/Load.svelte';
	import About from '$lib/main/About.svelte';

	let { data } = $props();
	// init scroller for scrollytelling
	const scroller = scrollama();
	let step = $state(0);
	// checks if essay is rendered
	let essayIsRendered = $state(false);
	// checks if essay has step to attach scroller
	let essayHasSteps = $state(false);
	// get body width to decide which graphic to load
	let bodyWidth: number = $state(0);

	// trigger initial scroll on button click
	function handleInitScroll() {
		scrollTo({ top: 600, behavior: 'smooth' });
	}

	// the event is dispatched from BlockRenderer component if scrolly
	function onEssayRender(data: { isEssayRendered: boolean; hasSteps: boolean }) {
		essayIsRendered = data.isEssayRendered;
		essayHasSteps = data.hasSteps;
	}

	$effect(() => {
		if (essayIsRendered && essayHasSteps) {
			// Wait a bit more to ensure DOM is ready
			setTimeout(() => {
				scroller
					.setup({
						step: '.step',
						debug: false,
						offset: 0.7,
						progress: true
					})
					.onStepEnter((response) => {
						step = response.index;
					})
					.onStepProgress((response) => {})
					.onStepExit((response) => {});
			}, 200);
		}
	});
</script>

<main
	bind:clientWidth={bodyWidth}
	class:opacity-0={!essayIsRendered}
	class:opacity-100={essayIsRendered}
>
	<div class="z-0 m-auto">
		<div class="m-auto w-full md:w-11/12">
			<div class="h-dvh w-full 2xl:max-h-[80vh]">
				<IntroductionTile {data} />
			</div>
			<div class="absolute bottom-10 left-0 w-full">
				<div class="grid justify-items-center">
					<button class="bg-ivory-default" onclick={handleInitScroll}>
						<span>Scroll down to read</span>
						<span
							><img class="inline" src="icons/ui-scroll.svg" alt="Arrow pointing downwards" /></span
						>
					</button>
				</div>
			</div>
			<div class="m-auto grid h-2 w-11/12 grid-cols-11">
				<div class="col-span-5 border-b"></div>
				<div class="col-span-1 m-auto w-1/2">
					<img src="img/pn-logo.png" alt="Publication logo" />
				</div>
				<div class="col-span-5 border-b"></div>
			</div>
			<div class="m-auto my-10 w-10/12 md:flex">
				<div class="w-full md:w-3/10">
					<div class="my-10 md:my-5">
						<p class="border-b pb-4 italic">
							This website contains a series of reflections on the circulation and consumption
							patterns of news in the digital environment. Using metadata from several newsrooms’
							archives, each experiment deals with a feature of digital news: keywords, text, and
							images. Using a combination of computational methods, three individual chapters pivot
							around a series of design and data visualization experiments with news data.
						</p>
						<div>
							<h4 class="pt-4 pb-2">Browse by chapter:</h4>
							<div>
								<ul>
									<li class="pb-4">
										<button class="flex items-center px-2 py-[2px]"
											><div
												class="mr-[5px] h-[15px] w-[15px] animate-pulse rounded-xl bg-green-500"
											></div>
											<a href="/places">The Geo-politics of news</a></button
										>
									</li>
									<li class="pb-4">
										<button class="flex items-center px-2 py-[2px]"
											><div
												class="mr-[5px] h-[15px] w-[15px] animate-pulse rounded-xl bg-green-500"
											></div>
											<a href="/topics">Discoursive interrelations</a></button
										>
									</li>
									<li class="pb-4">
										<button class="flex items-center px-2 py-[2px]"
											><div class="mr-[5px] h-[15px] w-[15px] rounded-xl bg-green-500"></div>
											<a href="/images">Person of interest</a></button
										>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
				<div class="w-full pl-2 md:w-7/10">
					<BlocksRenderer rawtext={rawIntroText} />
				</div>
			</div>
		</div>
		<div class="z-0 m-auto w-full">
			<section>
				<figure class="sticky top-10 h-[80vh] h-dvh w-full">
					<Illustration {step} {bodyWidth} />
				</figure>
				<article class="relative w-full">
					<BlocksRenderer rawtext={rawEssayText} {onEssayRender} />
				</article>
			</section>
			<section class="m-auto w-11/12">
				<div>
					<Chapters />
				</div>
			</section>
			<section class="py-10">
				<div>
					<About />
				</div>
			</section>
			<section>
				<BlocksRenderer rawtext={rawOutroText} />
			</section>
		</div>
	</div>
</main>

<!-- Loading state -->
{#if !essayIsRendered}
	<Load />
{/if}
