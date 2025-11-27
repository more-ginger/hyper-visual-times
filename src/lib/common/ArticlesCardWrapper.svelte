<script lang="ts">
	import { selectedOutlet } from '$lib/utils/state.images.svelte.ts';
	import ArticleCard from '$lib/common/ArticleCard.svelte';
	import { LinkHandler } from '$lib/utils/pathhelper.svelte';
	let { data, context, legend, ids } = $props();
	let articles = $state<any>([]);
	let contextOpen = $state(false);
	let articlesFetched = $state(0);
	let fetchWait = $state(false);
	let dataOpen = $state(true);
	let oids = []
	async function fetchArticlesForCards() {
		try {
			if (ids.length == 0) return;
			let loadedIDs = ids.slice(articlesFetched, articlesFetched + 3);
			const response = await fetch(
				`/api/articles?source=${$selectedOutlet.toLocaleLowerCase()}&id=${loadedIDs.join('&id=')}`
			);
			articles.push(...(await response.json()));
			articlesFetched += loadedIDs.length;
			fetchWait = false;
		} catch (error) {
			console.log('Error in fetching articles inside fetchArticlesForCards', error);
		}
	}
	$effect(() => {
		if (ids != oids){
			oids = ids;
			articles = [];
			articlesFetched = 0;
			fetchArticlesForCards();
		}
	});
	function toggleOpen(name, open) {
		switch (name) {
			case 'Context':
				contextOpen = !open;
				break;
			case 'Articles':
				dataOpen = !open;
				break;
		}
	}
</script>
{#snippet cardSection(name, open)}
	<button
		type="button"
		class="grid w-full cursor-pointer grid-cols-2 rounded-none border-none p-2 text-left"
		onclick={() => {
			toggleOpen(name, open);
		}}
	>
		<p class="font-bold">{name}</p>
		<img
			class="h-4 self-center justify-self-end"
			class:rotate-180={open}
			src={LinkHandler("/icons/ui-scroll.svg")}
			alt=""
		/>
	</button>
{/snippet}
<div
	class="overflow-hidden overscroll-none rounded-xl border border-black backdrop-blur-lg relative"
>
	<div class="w-full">
		{@render cardSection('Context', contextOpen)}
		<div
			class={'h-0 overflow-hidden border-t border-black ' +
				(contextOpen ? '!h-full border-dashed ' : '')}
		>
			<div class={'p-2 ' + (contextOpen ? 'border-b border-solid' : '')}>
				{@render context()}
			</div>
		</div>
	</div>
	<div class="w-full">
		{@render cardSection('Articles', dataOpen)}
		<div
			class={'h-0 max-h-[60vh] !overflow-scroll overscroll-none ' +
				(dataOpen ? '!h-full border-t border-dashed border-black' : '')}
		>
			<div
				class="sticky top-0 z-10 flex justify-between bg-[var(--color-ivory-default)] p-4 border-b border-dashed border-black"
			>
				<div class="grid w-full grid-cols-2 leading-relaxed">
					{@render data()}
				</div>
			</div>
			<div class="relative">
				{#each articles as article}
					<ArticleCard {article} />
				{/each}
				<div onclick={fetchArticlesForCards} class:hidden={articles.length == 0 || articlesFetched== ids.length} class="absolute border rounded-full px-2 py-px left-[50%] -translate-x-1/2 -bottom-4 z-10 bg-[var(--color-ivory-default)] cursor-pointer">Load More</div>
				<div class="p-6" class:hidden={articles.length > 0}>
					{@render legend()}
				</div>
			</div>
		</div>
	</div>
</div>
