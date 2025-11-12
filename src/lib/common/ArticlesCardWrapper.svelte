<script lang="ts">
	import { selectedOutlet } from '$lib/utils/state.images.svelte.ts';
	import ArticleCard from '$lib/common/ArticleCard.svelte';
	let { data, context, legend, ids } = $props();
	let articles = $state<any>([]);
	let contextOpen = $state(false);
	let legendOpen = $state(false);
	let dataOpen = $state(true);
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
		if (ids) {
			fetchArticlesForCards();
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
			src="icons/ui-scroll.svg"
			alt=""
		/>
	</button>
{/snippet}
<div
	class="w-[300px] overflow-hidden overscroll-none rounded-xl border border-black backdrop-blur-lg"
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
		{@render cardSection('Legend', legendOpen)}
		<div
			class={'h-0 overflow-hidden border-t border-black ' +
				(legendOpen ? '!h-full border-dashed' : '')}
		>
			<div class="border-b border-black p-2">
				{@render legend()}
			</div>
		</div>
	</div>
	<div class="w-full">
		{@render cardSection('Articles', dataOpen)}
		<div
			class={'h-0 max-h-[50vh] !overflow-scroll overscroll-none ' +
				(dataOpen ? '!h-full border-t border-dashed border-black' : '')}
		>
			<div
				class="sticky top-0 z-10 flex justify-between bg-[var(--color-ivory-default)] p-2 shadow-md"
			>
				<div class="grid w-full grid-cols-2 leading-relaxed">
					{@render data()}
				</div>
			</div>
			{#each articles as article}
				<ArticleCard {article} />
			{/each}
		</div>
	</div>
</div>
