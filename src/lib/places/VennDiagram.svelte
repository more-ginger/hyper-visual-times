<script lang="ts">

    import type { solution } from '../../types';
    let {data, rawData} = $props()
    const svgHeight = 500;

    const restructuredData = $derived.by(() => {
        const output: { [key: string]: any[] } = {};
        for (const [key, value] of Object.entries(data)) {
        const suffix = key.split('_')[1];
        if (!output[suffix]) {
            output[suffix] = [];
        }
        output[suffix].push(value);
        }

        return output
    })

    function fromObjectNotation(solution: {[setid: string]: {x: number, y: number, radius: number}}) {
        const setids = Object.keys(solution);
        return setids.map((id) => Object.assign(solution[id], { setid: id }));
    }

    // This is expected to work, because the radius of circle will be always be zero
    // if no data point exist for one of the publications
    function checkForOverlaps(solution: solution) {
        const circles = fromObjectNotation(solution);
        for (let c = 0; c < circles.length; c++) {
            const element = circles[c];
            if (element.radius > 0) { 
                return true;
            }
        }
        return false;
    }
</script>
{#if data}
    {#if data && checkForOverlaps(data)}
    <svg 
        height={svgHeight} 
        class={`visualization w-full venn mb-2 bg-red-100 border`} 
        
    >   
        <g>
            {#each Object.keys(restructuredData) as key, k}
                <g class="stroke">
                    {#each restructuredData[key] as element}
                        {#if element.radius > 0}
                            <circle 
                                cx={element.x} 
                                cy={element.y} 
                                r={element.radius}
                                stroke="black"
                                fill={key == "zeit" ? "pink" : "blue"}
                                fill-opacity="0.5"
                            />
                        <text 
                            x={element.x} 
                            y={element.y}>
                                {key}, {k}
                        </text>
                        {/if}
                    {/each}
                </g>
            {/each}
        </g>
    </svg>
    {:else}
        <div>No data</div>
    {/if}
{/if}