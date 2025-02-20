<script lang="ts">
    import { onMount } from "svelte";
    import * as d3 from "d3";

    interface networkNodes {
        x: number,
        y: number,
        count: number
    }
    // Data is imported from +page.svelte as prop
    let { data } = $props();
    let innerWidth = window.innerWidth;
    let innerHeight = window.innerHeight;
    
    // visualization
    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    let simulation;
    let width = innerWidth;
    let height= innerHeight;

    const nodes = $derived(data.nodes);
    const edges = $derived(data.edges);

    onMount(() => {
        const ctx = canvas.getContext("2d");
        if (ctx) {
            context = ctx;
        }
        context.imageSmoothingQuality = "high";

        simulation = d3
            .forceSimulation(nodes)
            .on("tick", simulationUpdate)
    })

    function simulationUpdate() {
        context.save();
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        nodes.forEach((d:networkNodes) => {
            context.beginPath();
            context.arc(d.x, d.y, 2 + Math.sqrt(d.count) / 5, 0, 2 * Math.PI);
            context.strokeStyle = "black";
            context.lineWidth = 1.5;
            context.stroke();
            context.fillStyle = "white";
            context.fill();
        })

        context.restore();

    }

</script>

<svelte:window 
	bind:innerWidth
    bind:innerHeight
  />
  
<div>
    <!-- Add your HTML structure here -->
     <div class="absolute">    
        <h1>Network Visualization</h1>
     </div>
    <canvas width={width} height={height} bind:this={canvas}></canvas>
</div>