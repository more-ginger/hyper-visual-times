<script lang="ts">
	let { selectedPair, selectedIds } = $props();
	let firstFiveArticles = $derived(selectedIds.length > 5 ? selectedIds.slice(0, 6) : selectedIds);
	let articlesHeadlines = $state<{ headline: string }[]>([]);
	import ArticlesCardWrapper from '$lib/common/ArticlesCardWrapper.svelte';
	async function fetchArticlesForCards() {
		const ids = firstFiveArticles.map((id: string) => encodeURIComponent(id)).join('&id=');
		try {
			const response = await fetch(`/api/articles?source=nyt&${ids}`);
			const data = await response.json();
			articlesHeadlines = data;
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

{#snippet selectionPill(selection)}
	<span class="w-fit rounded-full border bg-[var(--color-ivory-default)] px-2"
		><img class="mr-1 inline pb-px" src="icons/ui-interact.svg" />{selection ??
			'Selection 1'}</span
	>
{/snippet}
<ArticlesCardWrapper ids={selectedIds}>
	<div class="col-span-2 flex flex-wrap gap-2">
		<div class="flex">
			{@render selectionPill(selectedPair[0])}
		</div>
		<div class="grow flex items-center justify-center">
<img class="inline-block" src="icons/ui-forward.svg" alt="forward">
		</div>
		
		<div class="flex">
			{@render selectionPill(selectedPair[1])}
		</div>
	</div>
</ArticlesCardWrapper>
