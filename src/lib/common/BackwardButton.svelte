<script>
	import { selectedView } from "$lib/utils/state.images.svelte";

    let {children,} = $props()
    function handleBack(){
        if ($selectedView == "streamgraph"){
            selectedView.set("bubblechart");
        }else{
            selectedView.set("streamgraph");
        }
    }
</script>
<button class="flex items-center justify-items-center gap-2" onclick={handleBack}
	><span 
		><img
			src="./icons/ui-forward.svg"
			class="inline-block align-middle rotate-180 pt-px"
			alt="arrow backward"
		/></span>
        <span>
               {@render children()}
        </span>
</button>
