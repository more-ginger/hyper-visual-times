<script lang="ts">
    // @ts-expect-error
    import * as d3 from "d3";

    let {nodes, links, outlet, dataDomain} = $props()
    let canvas:HTMLCanvasElement | null = $state(null);
    let context: CanvasRenderingContext2D;
    let simulation;
    let dpi = 1;
    let width = $state(0);
    let height = $state(0);
    const NodesForVis = $derived(nodes.map((d) => ({...d})))
    const LinksForVis = $derived(links.map((d) => ({...d})))

    const radiuScale = $derived(d3.scaleLinear().domain(dataDomain).range([2, 50]))
    const distanceScale = $derived(d3.scaleLinear().domain(d3.extent(LinksForVis.map((d) => d.weight))).range([300, 0]))
    const strengthScale = $derived(d3.scaleLinear().domain(d3.extent(LinksForVis.map((d) => d.weight))).range([0, 100]))

    $effect(() => {
        const ctx = canvas?.getContext("2d");
        if (ctx) {
            context = ctx;
        }
        
        context.imageSmoothingQuality = "high";

        if (canvas) {
            dpi = window.devicePixelRatio || 1;
            $inspect(dpi)
            // Make it visually fill the positioned parent
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            // ...then set the internal size to match
            canvas.width = canvas.offsetWidth * dpi;
            canvas.height = canvas.offsetHeight * dpi;
            width = canvas.offsetWidth * dpi;
            height = canvas.offsetHeight * dpi;
            context.scale(dpi, dpi);
            const positioningFactor =  dpi > 1 ? 4 : 2
            simulation = d3
            .forceSimulation(NodesForVis)
            .force("collide", d3.forceCollide((d) => radiuScale(d[`ids_of_articles_${outlet}`].length) + 1))
            .force("link", d3.forceLink(LinksForVis).id((d) => d.country).distance((d) => distanceScale(d.weight)))
            .force('center', d3.forceCenter(width / positioningFactor, height / positioningFactor))
            .on("tick", simulationUpdate)
        }
    })

    function simulationUpdate() {
        context.save();
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        LinksForVis.forEach((d) => {
            context.beginPath();
            context.moveTo(d.source.x, d.source.y);
            context.lineTo(d.target.x, d.target.y);
            context.globalAlpha = 0.3;
            context.strokeStyle = outlet == "nyt" ? "#FFDB93" : "#7EA7FF";
            context.lineWidth = Math.sqrt(strengthScale(d.weight))
            context.stroke()
            context.globalAlpha = 1;
        })
        
        NodesForVis.forEach((d) => {
            context.beginPath();
            context.arc(d.x, d.y, radiuScale(d[`ids_of_articles_${outlet}`].length), 0, 2 * Math.PI);
            context.strokeStyle = "black";
            context.lineWidth = 1.5;
            context.stroke();
            context.fillStyle = outlet == "nyt" ? "#FFBC36" : "#4580FF";
            context.fill();
            context.fillStyle = "black";
            context.fillText(d.country, d.x, d.y)
        })

        context.restore();
    }



</script>

<div bind:clientWidth={width} bind:clientHeight={height} class="h-200 border">
    {#await nodes && links}
        <div>Loading</div>
    {:then nodes} 
        <canvas bind:this={canvas} width={width} height={height}></canvas>
    {/await}
</div>