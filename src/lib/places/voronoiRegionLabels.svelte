<script lang="ts">
    let {label, maxRegionCoverage} = $props()

    const percCoverageByRegion = $derived(Math.round((100 * label.value) / maxRegionCoverage))
    const thresholdForLabelsSize = $derived(percCoverageByRegion < 4)
</script>
<g id="region-name">
    <text 
        x={label.polygon.site.x} 
        y={label.polygon.site.y}
        text-anchor="middle"
        stroke="rgba(0,0,0,0.5)"
        stroke-width="2"
        fill="transparent"
        font-size={thresholdForLabelsSize ? 8 : 14}
    >
            {label.data.Region}
    </text>
    <text 
        class={"fill-ivory-default" + " " + label.parent.data.outlet}
        x={label.polygon.site.x} 
        y={label.polygon.site.y}
        text-anchor="middle"
        font-size={thresholdForLabelsSize ? 8 : 14}
    >
            {label.data.Region}
    </text>
</g>
{#if !thresholdForLabelsSize}
<g>
    <text 
        x={label.polygon.site.x} 
        y={label.polygon.site.y + 15}
        text-anchor="middle"
        stroke="rgba(0,0,0,0.5)"
        stroke-width="2"
        fill="transparent"
        font-size={thresholdForLabelsSize ? 8 : 12}
    >
            {percCoverageByRegion} %
    </text> 
    <text 
        x={label.polygon.site.x} 
        y={label.polygon.site.y + 15}
        text-anchor="middle"
        class={"fill-ivory-default" + " " + label.parent.data.outlet}
        font-size={thresholdForLabelsSize ? 8 : 12}
    >
            {percCoverageByRegion} %
    </text> 
</g>
{/if}