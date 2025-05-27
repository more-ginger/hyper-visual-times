<script lang=ts>
    let {
        showFirstTenOnly, // Controls color if only first ten are visible
        showLastTenOnly, // Controls color if only last ten are visible
        i, // index of bars
        path, // ∆
        transformFactor, // Horizontal positioning for bar
        outlet, // Outlet, controls primary color
        currentOutlet // controls secondary color
    } = $props();
    
    let primaryColor = outlet == "NYT" ? 
        "fill-nyt-default" : 
        "fill-zeit-default"
    
    let secondaryColor = currentOutlet === outlet ?
        "fill-nyt-light" : 
        "fill-zeit-light"
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