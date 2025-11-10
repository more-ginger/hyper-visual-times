<script lang="ts">
	import {
		selectedOutlet,
		colorScale
	} from '$lib/utils/state.images.svelte.ts';
	let { article } = $props();
	function getAuthorSourceAgnostic(byline) {
		byline = byline.trim().replaceAll(/'/g, '"').replaceAll('None', '""');
		try {
			if ($selectedOutlet == 'NYT') {
				let by = JSON.parse(byline);
				if (by.original.length == 0) return 'Author unknown';
				return by.original ?? 'Author unknown';
			} else {
				let by = JSON.parse(byline);
				if (!by || by.length == 0) return 'Author unknown';
				return by[0].name ?? 'Author unknown';
			}
		} catch (e) {
			return 'Author unknown';
		}
	}
</script>

<div class={"m-2 my-3 rounded-xl border border-black p-2"} style={"background-color: "+$colorScale(article.news_desk)+"1a"} id={"article_" + article._id}>
	<a href={article.web_url} target="_blank">
		<div>
			<div>{article.headline}</div>
			<div class="my-2 line-clamp-2 overflow-hidden text-sm">{article.snippet}</div>
			<div class="mb-2 text-sm italic">
				{getAuthorSourceAgnostic(article.byline)}
			</div>
			<div class="grid grid-cols-3">
				<span class="col-span-1 justify-self-start text-sm">
					{new Date(article.pub_date).toLocaleDateString('de')}
				</span>
				<span class="col-span-2 flex items-center gap-1 justify-self-end text-sm">
					{#if article.news_desk.length > 0}
						<span
							class="block h-[10px] w-[10px] rounded-full"
							style="background-color: {$colorScale(article.news_desk)};"
						></span>
						{article.news_desk}
					{/if}
				</span>
			</div>
		</div>
	</a>
</div>
