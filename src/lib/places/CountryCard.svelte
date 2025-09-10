<script lang="ts">
	import { onMount } from 'svelte';

	let { primaryCountryKey, currentNode, selectedOutlet, onCardReset, onPrimaryCountryChange } =
		$props();
	type Article = {
		headline: string;
		web_url: string;
		snippet: string;
		pub_date: string | number;
		byline: string;
		parsed_date: Date;
	};
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
				const headlines = data.map((article: Article) => {
					let parsedByline = JSON.parse(article.byline);
					let byline = parsedByline.length > 0 ? parsedByline[0]['name'] : '';

					let parsedPubDate = new Date(article.pub_date);
					let fullDate = `${parsedPubDate.getDate()}.${parsedPubDate.getMonth() + 1}.${parsedPubDate.getFullYear()}`;

					articles.push({
						headline: article.headline,
						snippet: article.snippet,
						web_url: article.web_url,
						pub_date: fullDate,
						parsed_date: parsedPubDate,
						byline
					});
				});

				return { countryName: country.country, headlines, count: country.shared_articles.length };
			}
		} catch (error) {
			console.error('Error fetching article headlines:', error);
		}
	}

	const orderedArticles = $derived(
		[...articles].sort((a: { parsed_date: Date }, b: { parsed_date: Date }) => {
			return b.parsed_date.getTime() - a.parsed_date.getTime();
		})
	);

	function resetCard() {
		onCardReset();
	}

	function changePrimaryCountry(node: string) {
		onPrimaryCountryChange({
			key: node
		});
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
</script>

<div class=" h-99 overflow-scroll rounded-xl">
	<div class=" bg-ivory-default sticky top-0 flex justify-between px-2 pt-2">
		<div>
			<button onclick={resetCard}
				><img src="icons/ui-forward.svg" class="rotate-180 py-2" alt="arrow back" /></button
			>
		</div>
		<div class="flex pt-1">
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
	</div>
	<div>
		<div class="px-2 py-3 text-right text-xs">
			<button
				onclick={() => {
					changePrimaryCountry(currentNode.country);
				}}
				class="border-red-500 text-red-500">Set {currentNode.country} as primary country</button
			>
		</div>
	</div>
	{#await articles}
		<div>Loading articles</div>
	{:then orderedArticles}
		<div class="px-2">
			{#each orderedArticles as article}
				<div class="my-3 rounded-xl border border-black p-2 hover:bg-white">
					<a href={article.web_url} target="_blank">
						<div>
							<div>{article.headline}</div>
							<div class="py-2 text-sm">{article.snippet}</div>
							<div class="text-xs">{article.byline}, {article.pub_date}</div>
						</div>
					</a>
				</div>
			{/each}
		</div>
	{/await}
	{#if orderedArticles.length > 0}
		<div class="absolute bottom-0 my-2 w-full text-center">
			{#if currentNode.shared_articles.length > lastArticleIndex}
				<button
					class="bg-ivory-default transition-all hover:-translate-y-0.5 hover:shadow-sm"
					onclick={increaseIndexesToFetchMoreArticles}>Load More</button
				>
			{/if}
		</div>
	{/if}
</div>
