<script lang="ts">
	import markedFootnote from 'marked-footnote';
	import { marked } from 'marked';
	import { setFootnotes } from '$lib/utils/actions.svelte';

	let { rawtext, onEssayRender = undefined } = $props();
	let shown = $state(true);

	marked.use({ async: true, breaks: true }, markedFootnote());
	const essayContent = marked.parse(rawtext);

	function evaluateRenderEssay(node: HTMLElement) {
		// Use setTimeout to ensure DOM is fully updated
		setTimeout(() => {
			onEssayRender?.({
				isEssayRendered: true,
				hasSteps: node.querySelector('#has-steps') ? true : false
			});
		}, 100);
		return {};
	}
</script>

{#await essayContent}
	<div>Loading essay content</div>
{:then essayContent}
	<div use:setFootnotes>
		<div class="essay my-5 md:mx-5" use:evaluateRenderEssay class:optional-hidden={!shown}>
			{@html essayContent}
		</div>
	</div>
{/await}
