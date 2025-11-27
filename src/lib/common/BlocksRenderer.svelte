<script lang="ts">
	import markedFootnote from 'marked-footnote';
	import { marked } from 'marked';
	import {base} from '$app/paths';

	// onEssayRender is optional, we pass it only if we have scrolly blocks
	let { rawtext, onEssayRender = undefined } = $props();
	let shown = $state(true);

	// marked.js is used to render markdown into html
	marked.use({ async: true, breaks: true }, markedFootnote());
	const essayContent = marked.parse(rawtext.replaceAll('src="\.?\/?(.*?)"', `src="${base}/$1"`));

	// we evaluate what to send back to the parent.
	// If steps are present the scroller will be attached after some delay
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
	<div>
		<div class="essay my-5" use:evaluateRenderEssay class:optional-hidden={!shown}>
			{@html essayContent}
		</div>
	</div>
{/await}
