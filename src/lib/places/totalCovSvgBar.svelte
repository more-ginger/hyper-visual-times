<script lang=ts>
    let {
        showFirstTenOnly, 
        showLastTenOnly, 
        i, 
        path, 
        transformFactor, 
        outlet, 
        currentOutlet
    } = $props();
    
    let primaryColor = outlet == "NYT" ? 
        "fill-nyt-violet-default" : 
        "fill-zeit-peach-default"
    
    let secondaryColor = currentOutlet === outlet ?
        "fill-nyt-violet-light" : 
        "fill-zeit-peach-light"
</script>

<polygon 
    class={
        showFirstTenOnly && i > 9 || 
        showLastTenOnly && i < 10 ? 
        secondaryColor : 
        primaryColor
    }
    transform={transformFactor}
    points={`25,${path} 0,0 50,0`} 
    stroke="black"
/>