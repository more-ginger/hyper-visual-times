<script lang="ts">
    // @ts-expect-error
    import { voronoiTreemap } from "d3-voronoi-treemap";
    // @ts-expect-error
    import { hierarchy } from "d3-hierarchy";
    
    let { regionData } = $props();
    let fullWidth = $state(10); 
    let fullHeight = $state(10);
    let leaves = $state([]);
    let descendants = $state([]);
    let smallestSide = $derived(Math.min(fullWidth, fullHeight))

    let regionColors = {
        "Africa": "#FF5733",
        "Asia": "#33FF57",
        "Europe": "#3357FF",
        "North America": "#FF33A1",
        "South America": "#A133FF",
        "Oceania": "#33FFF5",
        "Antarctica": "#F5FF33"
    };

    function computeCirclingPolygon(radius:number) {
        var points = 60,
            increment = 2*Math.PI/points,
            circlingPolygon = [];
        
        for (var a=0, i=0; i<points; i++, a+=increment) {
          circlingPolygon.push(
            [
                radius + radius*Math.cos(a), 
                radius + radius*Math.sin(a)
            ]
        )}
        
        return circlingPolygon
    }

    function weightAccessor(d:any) {
        return d.count;
    }

    let circlingLayout = $derived(
        computeCirclingPolygon(smallestSide / 2.2)
    )

    var voronoiClip = $derived(
        voronoiTreemap().clip(circlingLayout)
    ); // sets the clipping polygon

    var rootNode = $derived(
        hierarchy(regionData).sum(weightAccessor)
    ); // creates hierarchy of voronoi map
    
    $effect(() => {
        voronoiClip(rootNode);
        leaves = rootNode.leaves()
        descendants = rootNode.descendants()
        $inspect(rootNode.descendants())
    })

</script>
<div class="h-full">
    <div>
        <div class=border-b><h4>Areas of interests</h4></div>
        <div><p>Subtitle</p></div>
    </div>
    <div class="h-9/10">
        <svg 
            width="100%" 
            height="100%"
            bind:clientWidth={fullWidth} 
            bind:clientHeight={fullHeight}    
            class="border"
        >   
            <g class="origin-center" transform={`translate(25, 25)`}>
                {#if leaves}
                    {#each descendants as leave}
                        <path 
                            d={"M"+(leave.polygon.join(",") || "")+"z"} 
                            fill="transparent"
                            stroke="white"
                            stroke-width={leave.height + 1 % 2}
                            rx=100
                        />
                    {/each}
                {/if}
            </g>
        </svg>
    </div>
</div>