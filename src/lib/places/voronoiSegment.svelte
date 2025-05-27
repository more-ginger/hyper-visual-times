<script lang=ts>
    let { segment, activeLabels } = $props();

    interface segmentInterface {
        height: number,
        parent: Record<string, any>,
        data: {
            country: string
        }
    }

    const countriesForLabels = $derived(activeLabels.map((el) => { return el.data.country}))

    const nytColors = {
        "fill": "fill-nyt-violet-light",
        "stroke": "stroke-nyt-violet-dark"
    }

    const zeitColors = {
        "fill": "fill-zeit-peach-light",
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

            if (countriesForLabels.includes(segment.data.country)) {
                return segment.parent.parent.data.outlet == "NYT" 
                    ? `fill-nyt-violet-default ${nytColors.stroke} stroke-1`
                    : `fill-zeit-peach-default ${zeitColors.stroke} stroke-1`
            } else {
                return segment.parent.parent.data.outlet == "NYT" 
                    ? `${nytColors.fill} ${nytColors.stroke} stroke-1`
                    : `${zeitColors.fill} ${zeitColors.stroke} stroke-1`   
            }    
        }
    }
</script>

<g>
    <path 
        class={defineSegmentStroke(segment)}
        d={"M"+(segment.polygon.join(",") || "")+"z"}  
    />
</g>