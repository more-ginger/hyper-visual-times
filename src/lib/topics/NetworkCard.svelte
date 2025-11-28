<script lang="ts">
	import { base } from '$app/paths';
	let { selectedPair, selectedIds } = $props();
	let firstFiveArticles = $derived(selectedIds.length > 5 ? selectedIds.slice(0, 6) : selectedIds);
	let articlesHeadlines = $state<{ headline: string }[]>([]);
	import ArticleCard from '$lib/common/ArticleCard.svelte';
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
		><img class="mr-1 inline pb-px" src={LinkHandler("/icons/ui-interact.svg")} />{selection ??
			'Selection ' + (i + 1)}</span
	>
{/snippet}
<div
	class={'no-scrollbar no-scrollbar::-webkit-scrollbar mb-6 max-h-[60vh] !overflow-scroll overscroll-none rounded-xl border'}
>
	<div class="sticky top-0 z-10 flex justify-between bg-[var(--color-ivory-default)] p-2 shadow-md">
		<div class="flex w-full flex-wrap gap-2">
			<div class="flex">
				{@render selectionPill(selectedPair[0], 0)}
			</div>
			<div class="flex grow items-center justify-center">
				<img class="inline-block" src={LinkHandler("/icons/ui-forward.svg")} alt="forward" />
			</div>

			<div class="flex">
				{@render selectionPill(selectedPair[1], 1)}
			</div>
		</div>
	</div>
	<div class="relative">
		{#if selectedPair.length == 2}
			{#each articlesHeadlines as article}
				<ArticleCard {article} />
			{/each}
		{:else}
			<div class="w-full p-6">
				<img class="w-full" src={LinkHandler("/img/topics-selection-legend.svg")} />
			</div>
		{/if}
	</div>
</div>
