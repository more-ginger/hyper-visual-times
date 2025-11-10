<script lang="ts">
	import { selectedOutlet } from '$lib/utils/state.images.svelte.ts';
	import ArticleCard from '$lib/common/ArticleCard.svelte';
	let { children, ids} = $props();
	let articles = $state([]);
	let nArticles = $state(0);
	let initialFetchDone = $state(false);
	async function fetchArticlesForCards() {
		try {
			let loadedIDs = ids.slice(nArticles, nArticles + 3);
			console.log("Loading article IDs:", ids);
			const response = await fetch(
					`/api/articles?source=${$selectedOutlet.toLocaleLowerCase()}&id=${loadedIDs.join('&id=')}`
			);
			articles.push(...(await response.json()));
			nArticles += loadedIDs.length;
		} catch (error) {
			console.log('Error in fetching articles inside fetchArticlesForCards', error);
		}
	}
	$effect(() => {
		if (ids.length > 0 && !initialFetchDone) {
			fetchArticlesForCards();
			initialFetchDone = true;
		}else if (ids.length == 0){
			articles = [];
			nArticles = 0;
			initialFetchDone = false;
		}
	});

</script>

<div class=" overflow-scroll overscroll-none rounded-xl border border-black backdrop-blur-lg md:max-h-90 relative">
	<div class="sticky top-0 flex justify-between p-2 backdrop-blur-sm bg-[var(--color-ivory-default)]" class:border-b={articles.length > 0} class:border-0={articles.length == 0}>
		<div class="grid grid-cols-2 w-full leading-relaxed">
			{@render children()}
		</div>
	</div>
	<div class="relative">
		{#each articles as article}
			<ArticleCard {article} />
		{/each}
		<div on:click={fetchArticlesForCards} class:hidden={articles.length == 0 || nArticles== ids.length} class="absolute border rounded-full px-2 py-px left-[50%] -translate-x-1/2 -bottom-4 z-10 bg-[var(--color-ivory-default)] cursor-pointer">Load More</div>
	</div>

</div>
