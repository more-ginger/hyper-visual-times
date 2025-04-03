<script lang=ts>
    let {showFirstTenOnly, i, path, transformFactor, outlet} = $props();
    let color = outlet == "nyt" ? "fill-nyt-violet-default" : "fill-zeit-peach-default"
</script>

<polygon 
    class={showFirstTenOnly && i > 9 ? "fill-white" : color}
    transform={transformFactor}
    points={`25,${path} 0,0 50,0`} 
    stroke="black"
/>