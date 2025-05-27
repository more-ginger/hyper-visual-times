
<script lang="ts">
    const {labels} = $props()
    $inspect(labels)
</script>
{#each labels as label}
    <g id="country-name">
        <text 
            x={label.polygon.site.x} 
            y={label.polygon.site.y}
            stroke="rgba(0,0,0,0.5)"
            stroke-width="2"
            fill="transparent"
            font-size="12"
            text-anchor="middle"
        >
            {label.data.country}
        </text>
        <text 
            x={label.polygon.site.x} 
            y={label.polygon.site.y}
            text-anchor="middle"
            font-size="12"
             class={"fill-ivory-default" + " " + label.parent.data.outlet}
        >
            {label.data.country}
        </text>
    </g>
    <g>
        <text 
            x={label.polygon.site.x} 
            y={label.polygon.site.y + 15}
            stroke="rgba(0,0,0,0.5)"
            stroke-width="2"
            fill="transparent"
            font-size="12"
            text-anchor="middle"
        >
            {label.value}
        </text>
        <text
            x={label.polygon.site.x} 
            y={label.polygon.site.y + 15}
            text-anchor="middle"
            font-size="12"
            class={"fill-ivory-default" + " " + label.parent.data.outlet}
        >
            {label.value}
        </text>
    </g>
{/each}