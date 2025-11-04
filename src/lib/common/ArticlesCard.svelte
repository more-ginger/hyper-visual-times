<script lang="ts">
	import * as d3 from 'd3';
	let { children, articles, currentSource, newsDesks=[], loading=null } = $props();
	function getAuthorSourceAgnostic(byline){
		byline = byline.trim().replaceAll(/'/g, '"').replaceAll('None', '""')
		try{
		 if (currentSource == 'NYT'){
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
		if(loading){
			articles = [];
		}
	});
</script>

<div
	class="h-60 w-[300px] overflow-scroll overscroll-none rounded-xl border border-black backdrop-blur-lg md:h-80">
	<div class="sticky top-0 flex justify-between p-2 backdrop-blur-sm shadow-md bg-[var(--color-ivory-default)]">
		<div class="grid grid-cols-2 pt-1">
		{#if articles.length == 0 && !loading}
			<div class="col-span-2">
				Select a <u>bubble</u> to inspect the <u>articles</u>.
			</div>
		{:else}
			{@render children()}
		{/if}
		</div>
	</div>
		{#if articles.length == 0}
		<div class="flex h-max-content w-full flex-col items-center justify-center p-4">
			{#if loading}
				<p>Loading...</p>
			{:else}
				<p>No Data</p>
			{/if}
		</div>
		{:else}
			{#each articles as article}
				<div class="bg-[var(--color-ivory-default)] my-3 rounded-xl border border-black p-2 m-2">
					<a href={article.web_url} target="_blank">
						<div>
							<div>{article.headline}</div>
							<div class="py-2 text-sm">{article.snippet}</div>
							<div>
								{getAuthorSourceAgnostic(article.byline)}
							</div>
							<div class="grid grid-cols-3">
								<span class="justify-self-start col-span-1">
								{new Date(article.pub_date).toLocaleDateString('de')}
								</span>
								<span class="justify-self-end flex items-center gap-1 col-span-2">
									<span class="w-[10px] h-[10px] block rounded-full" style="background-color: {colorScale(article.news_desk)};"></span>
									{article.news_desk}
								</span>
							</div>
						</div>
					</a>
				</div>
			{/each}
		{/if}
</div>
