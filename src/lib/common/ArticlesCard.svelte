<script lang="ts">
	import { get } from 'svelte/store';
	import translateMap from '../../content/data/images/translate_map.json';
	let { articles, currentSource, selectedPerson, selectedDate, loading } = $props();
	function getAuthorSourceAgnostic(byline){
		 if (currentSource == 'NYT'){
			let by = JSON.parse(JSON.parse(byline))
			if (by.original.length == 0) return 'Author unknown'
			return by.original ?? 'Author unknown'
		 }else{		
			let by = JSON.parse(byline)
			if (!by || by.length == 0) return 'Author unknown'
			return by[0].name ?? 'Author unknown'
		 }
	}
</script>

<div
	class="h-60 w-[300px] overflow-scroll overscroll-none rounded-xl border border-black backdrop-blur-lg md:h-80">
	<div class="sticky top-0 flex justify-between p-2 backdrop-blur-sm shadow-md bg-[var(--color-ivory-default)]">
		<div class="grid grid-cols-2 pt-1">
		{#if articles.length == 0}
			<div class="pr-2 col-span-2 font-bold">
				Select a Person
			</div>
				<div class="pr-2 col-span-2">
					(Date - Date)
					<img class=" inline" src="icons/ui-forward.svg" alt="arrow right" />
					 <u>{articles.length == 0 ?'?' : articles.length}</u> Articles 
			</div>
		{:else}
			<div class="pr-2 col-span-2 font-bold">
				{translateMap[selectedPerson]} 
			</div>
				<div class="pr-2 col-span-2">
					({new Date(selectedDate).toLocaleDateString('de')} - {new Date(new Date(selectedDate).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('de')})
					<img class=" inline" src="icons/ui-forward.svg" alt="arrow right" />
					 <u>{articles.length == 0 ?'?' : articles.length}</u> Articles 
			</div>
		{/if}
		</div>
	</div>

		{#if articles.length == 0}
		<div class="flex h-max-content w-full flex-col items-center justify-center p-4">
			{#if loading}
				<p>Loading...</p>
			{:else}
				<p>no data</p>
			{/if}
		</div>
		{:else}
			{#each articles as article}
				<div class="bg-[var(--color-ivory-default)] my-3 rounded-xl border border-black p-2 m-2">
					<a href={article.web_url} target="_blank">
						<div>
							<div>{article.headline}</div>
							<div class="py-2 text-sm">{article.snippet}</div>
							<div class="text-xs">
								{getAuthorSourceAgnostic(article.byline)} |
								{new Date(article.pub_date).toLocaleDateString('de')}
							</div>
						</div>
					</a>
				</div>
			{/each}
		{/if}
</div>
