<script lang="ts">
	import { onMount } from 'svelte';

	let { primaryCountryKey, currentNode, selectedOutlet } = $props();
	type Article = { title: string; url: string };
	let articles = $state<Article[]>([]);
	let firstArticleIndex = $state(0);
	let lastArticleIndex = $state(3);

	async function fetchArticles(country: { country: string; shared_articles: string[] }) {
		if (country.shared_articles.length === 0) {
			return { countryName: country.country, headlines: [], count: country.shared_articles.length };
		}

		const sliced = country.shared_articles.slice(firstArticleIndex, lastArticleIndex);
		const ids = sliced.map((id) => encodeURIComponent(id)).join('&id=');

		try {
			const response = await fetch(`/api/articles?source=${selectedOutlet}&id=${ids}`);
			const data = await response.json();
			if (data.length > 0) {
				//console.log(data);
				const headlines = data.map((d: { headline: string; web_url: string }) => {
					articles.push({ title: d.headline, url: d.web_url });
					//d.headline
				});
				//articles.push(headlines);
				return { countryName: country.country, headlines, count: country.shared_articles.length };
			}
		} catch (error) {
			console.error('Error fetching article headlines:', error);
		}
	}

	onMount(() => {
		firstArticleIndex = 0;
		lastArticleIndex = 3;
		articles = [];
		fetchArticles(currentNode);
	});

	function increaseIndexesToFetchMoreArticles() {
		firstArticleIndex = lastArticleIndex;
		lastArticleIndex = firstArticleIndex + 3;
	}

	$effect(() => {
		if (firstArticleIndex !== 0 && firstArticleIndex !== lastArticleIndex) {
			fetchArticles(currentNode);
		}
	});

	$inspect(firstArticleIndex, lastArticleIndex);
</script>

<div class="h-96 overflow-scroll p-2">
	<div class="flex justify-between">
		<div class="flex">
			<div class="pr-2">{primaryCountryKey}</div>
			<div class="pr-2">
				<img class="mx-auto inline" src="icons/ui-forward.svg" alt="arrow right" />
			</div>
			<div class="pr-2">{currentNode.country}</div>
			<div class="pr-2">
				{#if lastArticleIndex < currentNode.shared_articles.length}
					{lastArticleIndex}
				{:else}
					{currentNode.shared_articles.length}
				{/if}
				/ {currentNode.shared_articles.length}
			</div>
		</div>
		<div>
			<button><img src="icons/ui-forward.svg" class="rotate-180 py-2" alt="arrow back" /></button>
		</div>
	</div>
	<div>
		{#each articles as article}<div
				class="my-3 rounded-xl border border-transparent p-2 hover:border-black"
			>
				<a href={article.url}>{article.title}</a>
			</div>{/each}
		<div class="my-2 text-center">
			{#if currentNode.shared_articles.length >= lastArticleIndex}
				<button onclick={increaseIndexesToFetchMoreArticles}>Load More</button>
			{/if}
		</div>
	</div>
</div>
