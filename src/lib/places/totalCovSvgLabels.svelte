<script lang="ts">
    let {country, step, scale} = $props();
</script>
{#if step > 9} 
    <g>
        <text 
            x="75" 
            y={scale(country.count_nyt) - 5} 
            text-anchor="middle"
            font-size="12"
            stroke-width="3"
            stroke="white"
        >
            {country.count_nyt}
        </text>
        <text 
            x="75" 
            y={scale(country.count_nyt) - 5} 
            text-anchor="middle"
            font-size="12"
            class="fill-nyt-violet-dark"
        >
            {country.count_nyt}
        </text>
    </g>
    <g>
        <text 
            x="35"
            y={scale(country.count_zeit) - 5} 
            text-anchor="middle"
            font-size="12"
            stroke-width="3"
            stroke="white"
        >
            {country.count_zeit}
        </text>
        <text 
            x="35"
            y={scale(country.count_zeit) - 5} 
            text-anchor="middle"
            font-size="12"
            class="fill-zeit-peach-dark"
        >
            {country.count_zeit}
        </text>
    </g>
{/if}