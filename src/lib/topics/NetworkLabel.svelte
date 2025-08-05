<script lang="ts">
	let { radiusScale, node, mean } = $props();
</script>

{#if node.size > mean}
	<foreignObject width="100" height="20" x={node.x + radiusScale(node.size) + 5} y={node.y - 10}>
		<div class="h-full w-fit rounded-sm border bg-white/25 px-2 text-xs backdrop-blur-xs">
			{node.id.charAt(0).toUpperCase() + node.id.slice(1)}
		</div>
	</foreignObject>
{/if}
