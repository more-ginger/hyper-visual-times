<script lang="ts">
	import { LinkHandler } from "$lib/utils/pathhelper.svelte";

	let { cluster, c, radiusScale, selectedClusterLabel } = $props();
</script>

<g>
	<text x={cluster.x} y={cluster.y + 4} text-anchor="middle" font-size="12">{cluster.count}</text>
	{#if radiusScale(cluster.count) > 50}
		<g>
			<path
				stroke="none"
				fill="none"
				id={`cluster-${c}`}
				d={`
                M ${cluster.x}, ${cluster.y} 
                m -${radiusScale(cluster.count) - 5},0 
                a ${radiusScale(cluster.count) - 5},${radiusScale(cluster.count) - 5} 0 0,0 ${(radiusScale(cluster.count) - 5) * 2},0 
                a ${radiusScale(cluster.count) - 5},${radiusScale(cluster.count) - 5} 0 0,0 -${(radiusScale(cluster.count) - 5) * 2},0
			`}
			/>
			<text font-size="16" text-anchor="middle">
				<textPath href={LinkHandler(`/topics#cluster-${c}`)} startOffset="25%">{cluster.manualLabel}</textPath>
			</text>
		</g>
	{:else if radiusScale(cluster.count) <= 50 && radiusScale(cluster.count) > 30}
		<g>
			<path
				stroke="none"
				fill="none"
				id={`cluster-${c}`}
				d={`
                M ${cluster.x}, ${cluster.y} 
                m -${radiusScale(cluster.count) - 5},0 
                a ${radiusScale(cluster.count) - 5},${radiusScale(cluster.count) - 5} 0 0,0 ${(radiusScale(cluster.count) - 5) * 2},0 
                a ${radiusScale(cluster.count) - 5},${radiusScale(cluster.count) - 5} 0 0,0 -${(radiusScale(cluster.count) - 5) * 2},0
			`}
			/>
			<text font-size="10">
				<textPath href={LinkHandler(`/topics#cluster-${c}`)}>{cluster.manualLabel}</textPath>
			</text>
		</g>
	{/if}
</g>
{#if cluster.manualLabel === selectedClusterLabel}
	<g>
		<circle
			cx={cluster.x}
			cy={cluster.y}
			r={radiusScale(cluster.count) + 2}
			stroke="black"
			fill="none"
			stroke-width="0.5"
		></circle>
		<circle
			cx={cluster.x}
			cy={cluster.y}
			r={radiusScale(cluster.count) + 4}
			stroke="black"
			fill="none"
			stroke-width="0.25"
		></circle>
	</g>
{/if}
