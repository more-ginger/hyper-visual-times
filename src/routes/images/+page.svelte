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
						<h2 class="pb-4 font-serif text-xl">Visual Stockpile</h2>
						<p>
							<span>
Which persons are visually represented in news images? The streamgraph on the right represents the weekly number of images featuring different persons of Zeit Online and The New York Times. Each pill represents 10 visual appearances in a week. You can alter the shown people in the visualization by toggling their respective name in the pills above the visualization. If you want to inspect the distribution of visual appearances for a specific week, you can {@render pillInteract('clicking')} on one of the bubbles. Lastly, you can change the outlet shown by the visualization by {@render pillInteract('clicking')} on the newspapers in the text:<br><br>
{@render pillOutlet('The New York Times','NYT')} and {@render pillOutlet('Zeit Online','Zeit')} 
							</span>
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
				<h2 class="font-serif text-xl pb-4">Visual Co-appearances</h2>

While individual visibility highlights which public figures dominate the visual field of a newspaper, <i>visual co-appearances</i> reveal how newsrooms construct relationships, oppositions, and political constellations. When two political actors appear together in the same image, this juxtaposition often encodes editorial interpretations of alliances, institutional proximity, rivalry, or shared involvement in major events. Analyzing these co-appearance patterns therefore provides insight into how newspapers visually stage political dynamics.

Our analysis of article teaser images in <span class="zeit">Zeit Online</span> and <span class="nyt">The New York Times</span> reveals distinct structural tendencies in how each outlet visually pairs public figures.

<h4 class="text-lg font-bold py-2">Zeit Online: Visualizing Political Constellations</h4>

For <span class="zeit">Zeit Online</span>, co-appearances are dominated by <i>intra-German political relations</i>. The most frequent visual pairings involve key government figures—most notably {@render pill('Olaf Scholz')} with {@render pill('Robert Habeck')}, who appear together across more than two dozen images . These repeated pairings reflect the centrality of coalition politics in the national news agenda and illustrate how the newspaper frames the internal workings and public presence of the governing alliance.

Similarly, {@render pill('Friedrich Merz')} frequently co-appears with both {@render pill('Olaf Scholz')} and {@render pill('Markus Söder')}, highlighting the visibility of opposition leadership and inter-party competition. Another recurring cluster involves {@render pill('Christian Lindner')}, whose frequent co-appearances with {@render pill('Robert Habeck')} and {@render pill('Olaf Scholz')} indicate the visual prominence of fiscal and economic debates within the government.

In contrast, international figures appear far less often in joint depictions. Exceptions include occasional images pairing {@render pill('Olaf Scholz')} or {@render pill('Annalena Baerbock')} with {@render pill('Volodymyr Zelenskyy')}, reflecting coverage of German involvement in the Ukraine conflict. However, these pairings occur at substantially lower rates than domestic political co-appearances.

Overall, Zeit’s visual pairings emphasize <i>coalition governance</i>, <i>domestic conflict</i>, and <i>regional political networks</i>—a pattern consistent with its editorial focus on German national politics.

<h4 class="text-lg font-bold py-2">The New York Times: Elections and Legal Entanglements</h4>

In <span class="nyt">The New York Times</span>, visual co-appearances reflect a markedly different structure. The dataset is dominated by U.S. federal politics and the 2024 presidential election. The most frequent pairing by far is {@render pill('Donald Trump')} with his lawyer {@render pill('Todd Blanche')}, appearing across <i>over sixty images</i> . This extraordinarily high volume underscores the centrality of Trump’s legal challenges in <span class="nyt">The New York Times</span>’s visual narrative.
Election-related pairings are similarly prominent. {@render pill('Donald Trump')} frequently co-appears with {@render pill('Kamala Harris')}, but these are largely found in <i>graphics, opinion pages, and <span class="nyt">The New York Times</span> Now</i>—often representing hypothetical matchups or comparative analyses rather than literal photographic scenes. In contrast, {@render pill('Joe Biden')} and {@render pill('Kamala Harris')} co-appear primarily in political and Washington desks, reflecting their real-world institutional partnership.

<span class="nyt">The New York Times</span>’s co-appearance structure also reveals the newspaper’s focus on the shifting political coalitions surrounding Trump’s candidacy. For instance, images pairing {@render pill('Donald Trump')} with {@render pill('JD Vance')}, or appearances of {@render pill('JD Vance')} with {@render pill('Tim Walz')}, visually foreground the evolving electoral landscape and vice-presidential contest.

International co-appearances remain rare and episodic. Images pairing {@render pill('Benjamin Netanyahu')} with {@render pill('Joe Biden')} or {@render pill('Kamala Harris')} appear only a handful of times, primarily tied to U.S. diplomatic engagement in the Gaza conflict. Co-appearances involving {@render pill('Vladimir Putin')} are extremely limited, reflecting a narrower visual focus on Russia in comparison to <span class="zeit">Zeit</span>.

In sum, <span class="nyt">The New York Times</span>’s co-appearance patterns center on <i>legal proceedings</i>, <i>electoral competition</i>, and <i>key moments in U.S. foreign policy</i>, with image pairings used to stage political conflict, institutional relationships, and campaign dynamics.
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
