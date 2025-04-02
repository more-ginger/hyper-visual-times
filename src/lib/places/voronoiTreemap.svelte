<script lang="ts">
    // @ts-expect-error
    import { voronoiTreemap } from "d3-voronoi-treemap";
    // @ts-expect-error
    import { hierarchy } from "d3-hierarchy";
    import VoronoiSegment from "./voronoiSegment.svelte";
    
    let { regionData } = $props();
    let fullWidth = $state(10); 
    let fullHeight = $state(10);
    let descendants = $state<Array<{ height: number; [key: string]: any }>>([]);

    let smallestSide = $derived(Math.min(fullWidth, fullHeight))

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
        descendants = rootNode.descendants()
    })

   const groupedLeaves: { [key: string]: any[] } = $derived(
       Object.entries(Object.groupBy(descendants, ({ height }) => height))
           .reduce((acc, [key, value]) => {
               if (value) acc[key.toString()] = value;
               return acc;
           }, {} as { [key: string]: any[] })
   );
   
   const keysOfLeaves = $derived(Object.keys(groupedLeaves))
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
        >   
           <g>
                {#if keysOfLeaves}
                    {#each keysOfLeaves as key}
                        <g class={"treemap-" + key}>
                            <text>{key}</text>
                            {#each groupedLeaves[key] as segment} 
                                <VoronoiSegment segment={segment}/>
                            {/each}
                        </g>
                    {/each}
                {/if}
           </g>
        </svg>
    </div>
</div>