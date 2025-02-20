<script lang="ts">
    // Data is imported from +page.svelte as prop
    let { data } = $props();
    let innerWidth = window.innerWidth;
    let innerHeight = window.innerHeight;
    
    // visualization
    let canvas;
    let width = innerWidth;
    let height= innerHeight;

    const nodes = $derived(data.nodes);
    const edges = $derived(data.edges);

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