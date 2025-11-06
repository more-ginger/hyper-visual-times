<script lang="ts">
	import * as d3 from 'd3';
	import { selectedOutlet } from '$lib/utils/state.images.svelte.ts';
	let { children, ids, newsDesks=[] } = $props();
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
	function getAuthorSourceAgnostic(byline){
		byline = byline.trim().replaceAll(/'/g, '"').replaceAll('None', '""')
		try{
		 if ($selectedOutlet == 'NYT'){
			let by = JSON.parse(byline)
			if (by.original.length == 0) return 'Author unknown'
			return by.original ?? 'Author unknown'
		 }else{		
			let by = JSON.parse(byline)
			if (!by || by.length == 0) return 'Author unknown'
			return by[0].name ?? 'Author unknown'
		 }
		}catch(e){
			return 'Author unknown'
		}
	}
	let colorScale = $derived(d3.scaleOrdinal(newsDesks, d3.schemeTableau10))
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
				<div class="bg-[var(--color-ivory-default)] my-3 rounded-xl border border-black p-2 m-2">
					<a href={article.web_url} target="_blank">
						<div>
							<div>{article.headline}</div>
							<div class="my-2 text-sm line-clamp-2 overflow-hidden">{article.snippet}</div>
							<div class="italic text-sm mb-2">
								{getAuthorSourceAgnostic(article.byline)}
							</div>
							<div class="grid grid-cols-3">
								<span class="justify-self-start col-span-1 text-sm">
								{new Date(article.pub_date).toLocaleDateString('de')}
								</span>
								<span class="justify-self-end flex items-center gap-1 col-span-2 text-sm">
									{#if newsDesks.length > 0}
										<span class="w-[10px] h-[10px] block rounded-full" style="background-color: {colorScale(article.news_desk)};"></span>
										{article.news_desk}
									{/if}
								</span>
							</div>
						</div>
					</a>
				</div>
			{/each}
</div>
