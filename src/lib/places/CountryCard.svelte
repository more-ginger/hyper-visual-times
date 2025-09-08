<script lang="ts">
	import { onMount } from 'svelte';

	let { primaryCountryKey, currentNode, selectedOutlet } = $props();
	type Article = { title: string; url: string };
	let articles = $state<Article[]>([]);

	async function fetchArticles(country: { country: string; shared_articles: string[] }) {
		if (country.shared_articles.length === 0) {
			return { countryName: country.country, headlines: [], count: country.shared_articles.length };
		}

		const sliced = country.shared_articles.slice(0, 3);
		const ids = sliced.map((id) => encodeURIComponent(id)).join('&id=');

		try {
			const response = await fetch(`/api/articles?source=${selectedOutlet}&id=${ids}`);
			const data = await response.json();
			if (data.length > 0) {
				console.log(data);
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
		articles = [];
		fetchArticles(currentNode);
	});

	//$inspect(articles);
</script>

<div>
	<div>{primaryCountryKey} {currentNode.country}</div>
	<div>
		{#each articles as article}<a href={article.url}>{article.title}</a>{/each}
	</div>
</div>
