<script lang="ts">
    import { onMount } from "svelte";
    import * as d3 from "d3";

    // data and interfaces
    let { data } = $props();
    const nodes = $derived(data.nodes);
    const edges = $derived(data.edges);
    interface networkNodes {
        x: number,
        y: number,
        count: number,
        keyword: string
    }

    interface networkEdges {
        source: { x: number, y: number },
        target: { x: number, y: number },
        strength: number
    }

    let innerWidth = $state(window.innerWidth);
    let innerHeight = $state(window.innerHeight);
    
    // visualization
    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    let dpi = 1;
    
    let width = $state(innerWidth);
    let height= $state(innerHeight);
    let simulation;

    const strengthScale = $derived(
            d3.scaleLinear()
              .domain(d3.extent(edges.map((edge: networkEdges) => edge.strength)))
              .range([0, 1])
    )

    onMount(() => {
        const ctx = canvas.getContext("2d");
        if (ctx) {
            context = ctx;
        }
        
        // forceCenter makes sure that the simulation remains centered in the viewport
        // forceLink is strength based, with nodes that have a strong overlap close to each other
        // forceCollide makes sure that the nodes do not overlap 
        simulation = d3
            .forceSimulation(nodes)
            .force('center', 
                d3.forceCenter(width / 2, height / 2)
            )
            .force("link", 
                d3.forceLink(edges)
                  .id((d: networkNodes) => d.keyword)
                  .strength((link: networkEdges) => strengthScale(link.strength))
                  .distance(1)
                )
            .force('collide', 
                d3.forceCollide((d: networkNodes) => Math.sqrt(d.count) + 2)
                 .iterations(10))
            .on("tick", simulationUpdate)
    })

    function simulationUpdate() {
        context.save();
        context.imageSmoothingQuality = "high";
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);


        // edges.forEach((d:networkEdges) => {
        //     context.beginPath();
        //     context.moveTo(d.source.x, d.source.y);
        //     context.lineTo(d.target.x, d.target.y);
        //     context.globalAlpha = 0.3;
        //     context.strokeStyle = "black";
        //     context.lineWidth = Math.cbrt(d.strength)
        //     context.stroke()
        //     context.globalAlpha = 1;
        // })

        nodes.forEach((d:networkNodes) => {
            context.beginPath();
            context.arc(d.x, d.y, Math.sqrt(d.count), 0, 2 * Math.PI);
            context.strokeStyle = "black";
            context.lineWidth = 1.5;
            context.stroke();
            context.fillStyle = "white";
            context.fill();
        })

        context.restore();

    }

    function fitToContainer(node:HTMLCanvasElement) {
        dpi = window.devicePixelRatio || 1;
        // Make it visually fill the positioned parent
        node.style.width = "100%";
        node.style.height = "100%";
        // ...then set the internal size to match
        node.width = node.offsetWidth * dpi;
        node.height = node.offsetHeight * dpi;
        width = node.offsetWidth * dpi;
        height = node.offsetHeight * dpi;
    }

</script>

<svelte:window 
	bind:innerWidth
    bind:innerHeight
  />
  
<div class="h-[100vh]">
     <div class="absolute">    
        <h1 class=p-2>How are NYT categories related to one another?</h1>
     </div>
    <canvas use:fitToContainer width={width} height={height} bind:this={canvas}></canvas>
</div>