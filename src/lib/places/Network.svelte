<script lang="ts">
    import type { link, node } from "../../types";
    // @ts-expect-error
    import * as d3 from "d3";

    let {nodes, links, outlet, dataDomain} = $props()
    
    const NodesForVis = $derived(nodes.map((d:node) => ({...d})))
    const LinksForVis = $derived(links.map((d:link) => ({...d})))

    let canvas:HTMLCanvasElement | null = $state(null);
    let context: CanvasRenderingContext2D;
    let simulation;
    let dpi = 1;
    let width = $state(0);
    let height = $state(0);
    
    const radiuScale = $derived(d3.scaleLinear().domain(dataDomain).range([2, 50]))
    const distanceScale = $derived(d3.scaleLinear().domain(d3.extent(LinksForVis.map((d:link) => d.weight))).range([300, 0]))
    const strengthScale = $derived(d3.scaleLinear().domain(d3.extent(LinksForVis.map((d:link) => d.weight))).range([1, 100]))

    function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
    }

    $effect(() => {
        const ctx = canvas?.getContext("2d");
        if (ctx) {
            context = ctx;
        }
        
        context.imageSmoothingQuality = "high";

        if (canvas) {
            dpi = window.devicePixelRatio || 1;
            // Make it visually fill the positioned parent
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            // ...then set the internal size to match
            canvas.width = canvas.offsetWidth * dpi;
            canvas.height = canvas.offsetHeight * dpi;
            width = canvas.offsetWidth * dpi;
            height = canvas.offsetHeight * dpi;
            context.scale(dpi, dpi);
            // change factor to position the network at the center of the scaled canvas
            const positioningFactor =  dpi > 1 ? 4 : 2
            
            simulation = d3
            .forceSimulation(NodesForVis)
            .force("collide", 
                d3.forceCollide((d:node & { [key: string]: any }) => radiuScale((d[`ids_of_articles_${outlet}`] as any[]).length) + 1)
            )
            .force("link", 
                d3.forceLink(LinksForVis).id((d:node) => d.country)
                .distance((d:link) => distanceScale(d.weight))
            )
            .force('center', 
                d3.forceCenter(width / positioningFactor, height / positioningFactor - 100)
             )
             .force("bounding", () => {
                NodesForVis.forEach((node:node) => {
                    const xCenter = width / 2
                    const yCenter = height / 2
                    if (distance(node.x, node.y, xCenter, yCenter) > 280) {
                        const theta = Math.atan((node.y - (height / 2)) / (node.x - (width / 2)))
                        node.x = (width / 2) + 280 * Math.cos(theta) * (node.x < (width / 2) ? -1 : 1);
                        node.y = (height / 2) + 280 * Math.sin(theta) * (node.x < (width / 2) ? -1 : 1);
                    }
                })
            })
            .on("tick", simulationUpdate)
        }
    })

    function simulationUpdate() {
        context.save();
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        LinksForVis.forEach((d:link) => {
            context.beginPath();
            context.moveTo(d.source.x, d.source.y);
            context.lineTo(d.target.x, d.target.y);
            context.globalAlpha = d.priority > 0 ? 1 : 0.1;
            context.strokeStyle = outlet == "nyt" ? "#FFDB93" : "#7EA7FF";
            context.lineWidth = Math.sqrt(strengthScale(d.weight))
            context.stroke()
            context.globalAlpha = 1;

            if (d.priority <= 0) {
                context.setLineDash([4, 2]);
            }
        })
        
        NodesForVis.forEach((d: node & { [key: string]: any }) => {
            context.beginPath();
            context.setLineDash([0, 0]);
            context.arc(d.x, d.y, radiuScale((d[`ids_of_articles_${outlet}`] as any[]).length), 0, 2 * Math.PI);
            context.strokeStyle = outlet == "nyt" ? "#CE8900" : "#0036AC";
            context.lineWidth = 1.5;
            context.stroke();
            context.fillStyle = outlet == "nyt" ? "#FFDB93" : "#7EA7FF";
            context.fill();
            context.fillStyle = "black";
            context.fillText( d.priority > 0 ? d.country : d.iso, d.x + 5, d.y + 5)
        })
               
        context.restore();
    }
</script>

<div bind:clientWidth={width} bind:clientHeight={height} class="h-4/5">
    {#await nodes && links}
        <div>Loading</div>
    {:then} 
        <canvas bind:this={canvas} width={width} height={height}></canvas>
    {/await}
</div>