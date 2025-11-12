<script lang="ts">
	import { selectedOutlet } from '$lib/utils/state.images.svelte.ts';
	import ArticleCard from '$lib/common/ArticleCard.svelte';
	let { data, context, legend, ids } = $props();
	let articles = $state<any>([]);
	let contextOpen = $state(false);
	let legendOpen = $state(false);
	let nArticles = $state(0);
	let fetchWait = $state(false);
	let dataOpen = $state(true);
	async function fetchArticlesForCards() {
		try {
			let loadedIDs = ids.slice(nArticles, nArticles + 3);
			const response = await fetch(
				`/api/articles?source=${$selectedOutlet.toLocaleLowerCase()}&id=${loadedIDs.join('&id=')}`
			);
			articles.push(...(await response.json()));
			// nArticles += loadedIDs.length;
			fetchWait = false;
		} catch (error) {
			console.log('Error in fetching articles inside fetchArticlesForCards', error);
		}
	}
	$effect(() => {
		if (ids != null && ids.length != nArticles && !fetchWait) {
			articles = [];
			nArticles = 0;
			fetchArticlesForCards();
		}else{
			articles = [];
			nArticles = 0;
		}
	});
	function toggleOpen(name, open) {
		switch (name) {
			case 'Context':
				contextOpen = !open;
				break;
			case 'Legend':
				legendOpen = !open;
				break;
			case 'Articles':
				dataOpen = !open;
				break;
		}
	}
</script>
{#snippet cardSection(name, open)}
	<!-- svelte-ignore a11y_no_static_element_interactions-->
	<div
		class="grid cursor-pointer grid-cols-2 p-2"
		onclick={() => {
			toggleOpen(name, open);
		}}
	>
		<p class="font-bold">{name}</p>
		<img
			class="h-4 self-center justify-self-end"
			class:rotate-180={open}
			src="icons/ui-scroll.svg"
			alt=""
		/>
	</div>
{/snippet}
<div
	class="overflow-hidden overscroll-none rounded-xl border border-black backdrop-blur-lg relative"
>
	<div class="w-full">
		{@render cardSection('Context', contextOpen)}
		<div class={"h-0 overflow-hidden border-t border-black " + (contextOpen ? '!h-full border-dashed ' : '')}>
			<div class={"p-2 " + (contextOpen ? 'border-solid border-b' : '')}>
				{@render context()}
			</div>
		</div>
	</div>
	<div class="w-full">
		{@render cardSection('Legend', legendOpen)}
		<div class={"h-0 overflow-hidden border-t border-black " + (legendOpen ? '!h-full border-dashed' : '')}>
			<div class="border-b border-black p-2">
				{@render legend()}
			</div>
		</div>
	</div>
	<div class="w-full">
		{@render cardSection('Articles', dataOpen)}
		<div class={"h-0 max-h-[50vh] !overflow-scroll overscroll-none " + (dataOpen ? 'border-t border-dashed border-black !h-full' : '')}>
			<div class="sticky top-0 flex justify-between p-2 bg-[var(--color-ivory-default)] shadow-md z-10">
				<div class="grid w-full grid-cols-2 leading-relaxed">
					{@render data()}
				</div>
			</div>
			<div class="relative">
				{#each articles as article}
					<ArticleCard {article} />
				{/each}
				<div onclick={fetchArticlesForCards} class:hidden={articles.length == 0 || nArticles== ids.length} class="absolute border rounded-full px-2 py-px left-[50%] -translate-x-1/2 -bottom-4 z-10 bg-[var(--color-ivory-default)] cursor-pointer">Load More</div>
			</div>
		</div>
	</div>
</div>
