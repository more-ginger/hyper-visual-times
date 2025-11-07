<script lang="ts">
	import { selectedOutlet } from '$lib/utils/state.images.svelte.ts';
	import ArticleCard from '$lib/common/ArticleCard.svelte';
	let { children, ids} = $props();
	let articles = $state([]);
	async function fetchArticlesForCards() {
		try {
			const response = await fetch(
					`/api/articles?source=${$selectedOutlet.toLocaleLowerCase()}&id=${ids.join('&id=')}`
			);
			articles = [...(await response.json())];
		} catch (error) {
			console.log('Error in fetching articles inside fetchArticlesForCards', error);
		}
	}
	$effect(() => {
		if(ids){
			fetchArticlesForCards();
		}
	});

</script>

<div class="w-[300px] overflow-scroll overscroll-none rounded-xl border border-black backdrop-blur-lg md:max-h-90">
	<div class="sticky top-0 flex justify-between p-2 backdrop-blur-sm bg-[var(--color-ivory-default)]" class:border-b={articles.length > 0} class:border-0={articles.length == 0}>
		<div class="grid grid-cols-2 w-full leading-relaxed">
			{@render children()}
		</div>
	</div>
		{#each articles as article}
			<ArticleCard {article} />
		{/each}
</div>
