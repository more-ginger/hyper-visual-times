<script lang=ts>
    let { segment } = $props();

    interface segmentInterface {
        height: number,
        parent: Record<string, any>
    }
    const nytColors = {
        "fill": "fill-nyt-violet-default",
        "stroke": "stroke-nyt-violet-dark"
    }

    const zeitColors = {
        "fill": "fill-zeit-peach-default",
        "stroke": "stroke-zeit-peach-dark"
    }
    
    function defineSegmentStroke (segment:segmentInterface) {
        if (segment.height == 3 || segment.height == 2) {
            return "stroke-transparent fill-transparent stroke-4"
        } else if (segment.height == 1) {
            return segment.parent.data.outlet == "NYT" 
                ? `${nytColors.stroke} stroke-3 fill-transparent` 
                : `${zeitColors.stroke} stroke-3 fill-transparent`
        } else {
            return segment.parent.parent.data.outlet == "NYT" 
                ? `${nytColors.fill} ${nytColors.stroke} stroke-1`
                : `${zeitColors.stroke} ${zeitColors.fill} stroke-1`       
        }
    }
</script>

<g>
    <path 
        class={defineSegmentStroke(segment)}
        d={"M"+(segment.polygon.join(",") || "")+"z"}  
    />
</g>