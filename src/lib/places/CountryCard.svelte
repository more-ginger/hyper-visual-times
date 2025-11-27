<script lang="ts">
	import ArticleCard from '$lib/common/ArticleCard.svelte';
	import { onMount } from 'svelte';
	import { selectedOutlet } from '$lib/utils/state.images.svelte.ts';
	import { LinkHandler } from '$lib/utils/pathhelper.svelte';

	let { primaryCountryKey, currentNode, onCardReset, onPrimaryCountryChange } =
		$props();
	type Article = {
		headline: string;
		web_url: string;
		snippet: string;
		news_desk: string;
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
			const response = await fetch(`/api/articles?source=${$selectedOutlet.toLocaleLowerCase()}&id=${ids}`);
			const data = await response.json();
			if (data.length > 0) {
				const headlines = data.map((article: Article) => {
					article.byline = article.byline.replaceAll(/'/g, '"').replaceAll('None', '""');
					let parsedByline = JSON.parse(article.byline);
					let byline = parsedByline.length > 0 ? `${parsedByline[0]['name']},` : '';

					let parsedPubDate = new Date(article.pub_date);
					let fullDate = `${parsedPubDate.getDate()}.${parsedPubDate.getMonth() + 1}.${parsedPubDate.getFullYear()}`;

					articles.push({
						headline: article.headline,
						snippet: article.snippet,
						web_url: article.web_url,
						news_desk: article.news_desk,
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

	$inspect(articles);
</script>

<div class="w-full overflow-scroll rounded-xl md:h-99">
	<div class=" bg-ivory-default sticky top-0 flex justify-between px-2 pt-2">
		<div>
			<button onclick={resetCard}
				><img src={LinkHandler("/icons/ui-forward.svg")} class="rotate-180 py-2" alt="arrow back" /></button
			>
		</div>
		<div class="flex pt-1">
			<div class="pr-2">
				{primaryCountryKey === 'The Democratic Republic of the Congo'
					? 'DR of Congo'
					: primaryCountryKey}
			</div>
			<div class="pr-2">
				<img class="mx-auto inline" src={LinkHandler("/icons/ui-forward.svg")} alt="arrow right" />
			</div>
			<div class="pr-2">
				{currentNode.country === 'The Democratic Republic of the Congo'
					? 'DR of Congo'
					: currentNode.country}
			</div>
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
				class="border-red-500 text-red-500"
				>Set {currentNode.country === 'The Democratic Republic of the Congo'
					? 'DR of Congo'
					: currentNode.country} as primary country</button
			>
		</div>
	</div>
	{#await articles}
		<div>Loading articles</div>
	{:then orderedArticles}
		<div class="px-2">
			{#each orderedArticles as article}
			<ArticleCard {article}/>
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
