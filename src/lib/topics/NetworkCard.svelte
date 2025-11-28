<script lang="ts">
	import { base } from '$app/paths';
	let { selectedPair, selectedIds } = $props();
	let firstFiveArticles = $derived(selectedIds.length > 5 ? selectedIds.slice(0, 6) : selectedIds);
	let articlesHeadlines = $state<{ headline: string }[]>([]);
	import ArticleCard from '$lib/common/ArticleCard.svelte';
	import ArticlesCardWrapper from '$lib/common/ArticlesCardWrapper.svelte';
	import { LinkHandler } from '$lib/utils/linkhandler.svelte';
	import { getArticles } from '$lib/utils/request.svelte';

	async function fetchArticlesForCards() {
		try {
			const data = await getArticles('nyt', firstFiveArticles);
			articlesHeadlines = data.data;
		} catch (error) {
			console.log('Error in fetching articles inside fetchArticlesForCards', error);
		}
	}

	$effect(() => {
		if (selectedIds.length !== 0) {
			fetchArticlesForCards();
		} else {
			articlesHeadlines = [];
		}
	});
</script>

{#snippet selectionPill(selection, i)}
	<span class="w-fit rounded-full border bg-[var(--color-ivory-default)] px-2"
		><img class="mr-1 inline pb-px" src={LinkHandler('/icons/ui-interact.svg')} />{selection ??
			'Selection ' + (i + 1)}</span
	>
{/snippet}
{#snippet context()}
	<p class="mb-2">
		This project frames the patterns of language and narrative of a year's corpus of news data,
		digging into the divergent simultaneous discourses discourses that occur across the newspaper's
		articles, sections, and timeframes.
	</p>
	One bubble represents a topic, a cluster of common words extracted from The New York Times' articles.
	The most common topics are marked in<span
		class="rounded-xl border border-orange-700 px-2 before:pr-1 before:text-orange-700 before:content-['•']"
		>orange</span
	>
	and are related to foreign politics and conflict. followed by internal politics and economy – here
	in
	<span
		class="rounded-xl border border-[#FFBC35] px-2 before:pr-1 before:text-[#FFBC35] before:content-['•']"
		>yellow</span
	>
	. Miscellaneous topics like culture, health, society, and sports are represented in
	<span
		class="rounded-xl border border-[#FFDAB9] px-2 before:pr-1 before:text-[#FFDAB9] before:content-['•']"
		>pink</span
	>. Orange bubbles represent topics connected to foreign politics. Climate-related topics are
	<span
		class="rounded-xl border border-[#EAFFC0] px-2 before:pr-1 before:text-[#EAFFC0] before:content-['•']"
		>green</span
	>.
{/snippet}
{#snippet legend()}
	<img src={LinkHandler('/img/topics-selection-legend.svg')} class="my-2 w-full" alt="" />
{/snippet}
{#snippet data()}
	<div class="col-span-2 sticky top-0 z-10 flex justify-between bg-[var(--color-ivory-default)] p-2">
		<div class="flex w-full flex-wrap gap-2">
			<div class="flex">
				{@render selectionPill(selectedPair[0], 0)}
			</div>
			<div class="flex grow items-center justify-center">
				<img class="inline-block" src={LinkHandler('/icons/ui-forward.svg')} alt="forward" />
			</div>
			<div class="flex">
				{@render selectionPill(selectedPair[1], 1)}
			</div>
		</div>
	</div>
{/snippet}
<ArticlesCardWrapper {data} {context} {legend} ids={firstFiveArticles} />
