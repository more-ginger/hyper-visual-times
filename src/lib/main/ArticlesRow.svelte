<script lang="ts">
	import { getRandomInt } from '$lib/utils/actions.svelte';
	let { article, a } = $props();
	let src = $state(article.multimedia);

	function handleImgError() {
		if (src.includes('zeit')) {
			src = 'img/placeholder-zeit.png';
		} else {
			src = 'img/placeholder-nyt.png';
		}
	}
</script>

<div
	class={`relative m-2 rounded-sm border bg-white/75 p-2 backdrop-blur-xs ${a % 2 !== 0 ? 'animate-bounce-two delay-150' : 'animate-bounce delay-700'}`}
>
	<div class="max-h-45 w-full overflow-hidden">
		<img
			class="mb-2 w-full"
			{src}
			alt="Pulled dynamically from the source outlet"
			onerror={handleImgError}
		/>
	</div>
	<h4 class="pb-0 text-xs md:text-lg">{article.headline}</h4>
</div>
