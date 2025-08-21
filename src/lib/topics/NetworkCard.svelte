<script lang="ts">
	let { selectedPair, selectedIds } = $props();
	let firstFiveArticles = $derived(selectedIds.length > 5 ? selectedIds.slice(0, 6) : selectedIds);
	let articlesHeadlines = $state<{ headline: string }[]>([]);

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

<div class="rounded-xl border p-2">
	<div class="flex justify-between border-b">
		<div>{selectedPair[0] ? selectedPair[0] : 'select first node'}</div>
		<div>arrow</div>
		<div>{selectedPair[1] ? selectedPair[1] : 'select another node'}</div>
	</div>
	{#if selectedPair.length === 2}
		<div class="p-2">
			{#await articlesHeadlines}
				<p>loading</p>
			{:then}
				{#if articlesHeadlines}
					{#each articlesHeadlines as article}
						<div class="border-b">{article.headline}</div>
					{/each}
				{/if}
			{/await}
		</div>
	{:else if selectedPair.length !== 2 || selectedIds.length === 0}
		<div class="p-10 text-center">Select nodes</div>
	{/if}
</div>
