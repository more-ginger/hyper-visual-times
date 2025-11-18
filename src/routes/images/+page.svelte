<script>
	import scrollama from 'scrollama';
	import { onMount } from 'svelte';
	import visualStoryline from '../../content/data/images/visual_mentions_storyline.json';
	import rawIntroText from '@/content/images/images-intro.md?raw';
	import rawOutroText from '@/content/images/images-outro.md?raw';

	import BlocksRenderer from '$lib/common/BlocksRenderer.svelte';
	import ImageStreamgraph from '$lib/images/ImageStreamgraph.svelte';
	import ImageNetworkgraph from '$lib/images/ImageNetworkgraph.svelte';
	import ImageBubblechart from '$lib/images/ImageBubblechart.svelte';
	import { currentView, selectedOutlet } from '$lib/utils/state.images.svelte.ts';

	//scrollama setup
	let step = $state(0);
	let selectedWeek = $state('');
	let selectedPeople = $state([]);
	onMount(async () => {
		currentView.set('streamgraph');
		scrollama()
			.setup({
				step: '.step',
				offset: 0.5,
				debug: false
			})
			.onStepEnter((response) => {
				step = response.index;
				if (visualStoryline[step] && step > 0) {
					selectedPeople = [...visualStoryline[step][$selectedOutlet]];
				}
			});
		window.setTimeout(() => {
			let video = document.querySelector('#intro-video')
			video.style.opacity = 1
			video.play()
		},500)
	});
	$effect(() => {
		if ($selectedOutlet) {
			selectedPeople = [...visualStoryline[step][$selectedOutlet]];
		}
	});
</script>

{#snippet pillOutlet(text, outlet)}
	<button
		type="button"
		class="flex inline-block w-max gap-2 hover:bg-[var(--color-ivory-light)]"
		class:bg-[var(--color-nyt-light)]={outlet === 'NYT'}
		class:bg-[var(--color-zeit-light)]={outlet === 'Zeit'}
		onclick={() => selectedOutlet.set(outlet)}
	>
		<img class="mb-px inline" src="icons/ui-interact.svg" alt="" /> <span>{text}</span>
	</button>
{/snippet}
{#snippet pillInteract(text)}
	<span
		class="flex inline-block w-max gap-2 hover:bg-[var(--color-ivory-light)] border rounded-full px-2 py-px"
	>
		<img class="mb-px inline" src="icons/ui-interact.svg" alt="" /> <span>{text}</span>
</span>
{/snippet}
{#snippet pill(text)}
	<span class="flex inline-block w-max gap-px font-bold ">
		<img class="max-w-[25px] inline pb-px" src="img/images-person.svg" alt="" /> <span>{text}</span>
	</span>
{/snippet}
<div class="base m-auto w-11/12 pt-20" class:opacity-0={!true} class:opacity-100={true}>
	<div id="images-essay">
		<video id="intro-video" class="relative z-10 opacity-0" src="img/images_teaser_desktop.webm" muted loop></video>
		<h1
			class="z-1 mx-auto -mt-[50vh] mb-[45vh] text-center font-serif text-4xl leading-normal font-bold md:w-5/7 md:text-7xl"
		>
			Persons of Interest
		</h1>
		<section id="intro" class="mb-30">
			<div class="m-auto w-full md:w-3/7">
				<BlocksRenderer rawtext={rawIntroText} />
			</div>
		</section>
		<section id="scrolly-1" class="md:flex md:flex-row-reverse">
			{#if $currentView == 'bubblechart'}
				<figure class="sticky top-20 h-dvh w-full basis-full">
					<ImageBubblechart bind:selectedWeek bind:selectedPeople />
				</figure>
			{:else if $currentView == 'streamgraph'}
				<figure class="sticky top-20 h-dvh w-full basis-1/2 p-6 md:basis-6/9 xl:p-4">
					<ImageStreamgraph bind:selectedWeek bind:selectedPeople />
				</figure>
			{/if}
			<article
				class={`relative w-full basis-1/2 md:basis-3/9 ${$currentView == 'bubblechart' ? 'invisible !w-0 !basis-0' : ''}`}
			>
				<div data-step="0" class="step p-6" style="height: 150vh;">
					<div class="table-cell align-middle">
						<h2 class="pb-4 font-serif text-xl">Visual Domination</h2>
						<p>
							<span>
								Which persons are visually represented in news images? The streamgraph on the right
								shows the weekly number of images featuring persons from different regions of the
								world in two Western newspapers: Zeit Online and
								The New York Times.
								You can interact change the outlet shown in the visualization by {@render pillInteract('clicking')} on the newspapers in the text: <br><br>{@render pillOutlet('The New York Times','NYT')} and {@render pillOutlet('Zeit Online','Zeit')} <br><br>
								Furthermore, you can alter the shown people in the visualization by toggling their respective name in the pills above the visualization.
								Lastly, you can inspect the poeple represented the most for a specific week, by {@render pillInteract('clicking')} on one of the bubbles.
							</span>
							<!-- <img
								src="img/images-streamgraph-legend.svg"
								class="w-9/10 mt-8"
								alt="Legend for the streamgraph visualization"
							/> -->
						</p>
					</div>
				</div>
				<div data-step="1" class="step p-6" style="height:150vh">
					<div class="table-cell align-middle leading-relaxed">
						<h3 class="font-bold text-xl">Most Mentioned</h3>
						First we have the most mentioned people of both newspapers, {@render pill(
							'Donald Trump'
						)} and {@render pill('Olaf Scholz')}. Both are the number one visually depicted person
						in their respective newspapers. However, while {@render pillOutlet(
							'Zeit Online',
							'Zeit'
						)} has Donald Trump as the second most visually mentioned person, Olaf Scholz doesn't make
						it to the top 15 of the {@render pillOutlet('The New York Times', 'NYT')}.
					</div>
				</div>
				<div data-step="3" class="step p-6 leading-relaxed" style="height:150vh">
					<h3 class="font-bold text-xl">Governments</h3>
					People who are associated with the government or their opposition are represented disproportionately in comparision to other prominent figures from pop culture.
					For {@render pillOutlet('Zeit Online', 'Zeit')} we have {@render pill('Robert Habeck')}, {@render pill('Annalena Baerbock')} and {@render pill('Christian Lidner')}, but also figures from the opposition such as {@render pill('Markus Söder')} or {@render pill('Friedrich Merz')}.
					<br>
					<br>
					{@render pillOutlet('The New York Times', 'NYT')} features government officials like {@render pill('Kamala Harris')} and {@render pill('Anthony Blinken')}, as well as opposition leaders including {@render pill('Mike Johnson')} and {@render pill('Nikki Haley')}.
				</div>
				<div data-step="3" class="step p-6 leading-relaxed" style="height:150vh">
					<h3 class="font-bold text-xl">US Elections</h3>
					Furthermore, we have the presidential elections in the US in November 2024, which stood out as one of the great events that surged the visual mentions of certain people. An outstanding
					phenomena in this regard is the clear cut off of visual mentions after the drop out of {@render pill(
						'Joe Biden'
					)} from the presidential race. In contrast {@render pill('Kamala Harris')}, who was
					previously visually invisible, sees a steep rise in visual mentions. This phenomena is
					especially present in {@render pillOutlet('The New York Times','NYT')}, where the visual mentions of Harris also end with the her defeat in November 2024. <br><br>Although this phenomena is also observable in {@render pillOutlet('Zeit Online', 'Zeit')}, the overall numbers are not comparable to NYT and Kamala Harris is featured much less.
				</div>
				<div data-step="4" class="step p-6 leading-relaxed" style="height:150vh">
					<h3 class="font-bold text-xl">Wars</h3>
					The figures involved in the political dimension of wars are also disproportionately visually
					represented. In both newspapers,
					{@render pill('Vladimir Putin')} is among the top visually mentioned persons in both newspapers, especially in {@render pillOutlet('Zeit Online', 'Zeit')}. This can be attributed to still high importance of the ongoing war in Ukraine. 
					Interestingly, Zeit Online additionally features {@render pill('Volodymyr Zelenskyy')} who hasn't made it to the top 15 of The New York Times. <br><br>
					However, {@render pillOutlet('The New York Times', 'NYT')} has siginficiant higher coverage of the ongoing War in Gaza which leads to a more frequent appearance of {@render pill('Benjamin Netanyahu')}.
				</div>
				<div data-step="5" class="step p-6 leading-relaxed" style="height:100vh">
					<h3 class="font-bold text-xl">Focus</h3>
					Lastly, we have newspaper specific focuses which reveal their editorial tendencies.
					For {@render pillOutlet('Zeit Online', 'Zeit')} we have many visual mentions of national politician {@render pill('Sahra Wagenknecht')} and local political opponents such as {@render pill('Dietmar Woidtke')}. Additionally, they have taken a special interest in {@render pill('Christian Lindner')} who had been accused of sabotaging his own government.
					<br><br>
					In contrast {@render pillOutlet('The New York Times', 'NYT')} has a special interest in the people around the president candidacy of Donald Trump such as {@render pill('JD Vance')} and {@render pill('Elon Musk')}. But there have been also more controversial figures such as {@render pill('Robert Kennedy')}.
				</div>
			</article>
		</section>
		<section class="mt-2">
			<article class="m-auto w-full md:w-3/7">
				<h2 class="font-serif text-xl pb-4">Visual Coappearances</h2>
				Grassland (2023) has already observed how Western European newspapers tend to cover
				macro-regions of interests: areas that have geographical and political significance for the
				host country of the newspaper. Looking at the visualization on the right, this observation
				seems to be confirmed: for Zeit, Central and Western Europe are the main regions of
				interest. Even in relation to conflict and against the cultural background that ties Germany
				and Israel, the use of Russia-Ukraine keywords is much higher than Israel–Palestine ones.
			</article>
			<figure class="h-screen w-full p-4 xl:p-4 xl:pt-20">
				<ImageNetworkgraph />
			</figure>
		</section>
		<section class="mt-2" id="outro">
			<div class="m-auto w-full md:w-3/7">
				<BlocksRenderer rawtext={rawOutroText} />
			</div>
		</section>
	</div>
</div>
