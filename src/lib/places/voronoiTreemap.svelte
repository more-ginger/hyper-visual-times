<script lang="ts">
    // @ts-expect-error
    import { voronoiTreemap } from "d3-voronoi-treemap";
    // @ts-expect-error
    import { hierarchy } from "d3-hierarchy";
    // @ts-expect-error
    import seedrandom  from "seedrandom";
    import VoronoiSegment from "./voronoiSegment.svelte";

    const rng = seedrandom('World');
    let { regionData } = $props();
    let fullWidth = $state(100); 
    let fullHeight = $state(100);
    let segmentForRadius = $derived(Math.min(fullWidth, fullHeight))
    let radius = $derived(segmentForRadius / 2.2)
    let descendants = $state<Array<{ height: number; [key: string]: any }>>([]);

    const _voronoiTreemap = voronoiTreemap()

    // Areas and geometry
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

    function polygonArea(element: { polygon: { site: { x: number; y: number }; [key: string]: any }[] }) {
        const xPoints = element.polygon.map(el => el[0])
        const yPoints = element.polygon.map(el => el[1])
        const numPoints = xPoints.length
        
        let area = 0;
        let j = numPoints - 1;

        for (let i = 0; i < numPoints; i++) {
            area = area + (xPoints[j]+xPoints[i]) * (yPoints[j]-yPoints[i])
            j = i
        }
        
        return area / 2
   }

   // Voronoi set-up
    function weightAccessor(d:any) {
        return d.count;
    } // sets the accessor to the amount of articles

    let circlingLayout = $derived(
        computeCirclingPolygon(radius)
    ) // computes the circular layout

    let rootNode = $derived(
        hierarchy(regionData).sum(weightAccessor)
    ); // creates hierarchy of voronoi map

    
    $effect(() => {
        const voronoiClip = _voronoiTreemap
            .prng(rng)
            .clip(circlingLayout);
        voronoiClip(rootNode);
        descendants = rootNode.descendants()
    })

    // Groups data for easier rendering and styling
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
            class="visualization"
            bind:clientWidth={fullWidth} 
            bind:clientHeight={fullHeight}    
        >   
           <g transform={`translate(${(fullWidth - radius) / 12}, ${(fullHeight - radius) / 12})`}>
                {#if keysOfLeaves}
                    <g>
                    {#each keysOfLeaves as key}
                        <g class={"treemap-" + key}>
                            {#each groupedLeaves[key] as segment} 
                                <VoronoiSegment segment={segment}/>
                            {/each}
                        </g>
                    {/each}
                    {#each keysOfLeaves as key}
                        {#if key === "1"}
                            {#each groupedLeaves[key] as label}
                                <text 
                                    class={"fill-ivory-default" + " " + label.parent.data.outlet}
                                    x={label.polygon.site.x} 
                                    y={label.polygon.site.y}
                                    text-anchor="middle"
                                    font-size={polygonArea(label) <= 2500 ? 8 : 12}
                                >
                                        {label.data.Region}
                                </text>
                            {/each}
                        {/if}
                    {/each}
                    </g>
                {/if}
           </g>
        </svg>
    </div>
</div>