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
<button onclick={handleBack}
	><span class="mr-1"
		><img
			src="./icons/ui-forward.svg"
			class="inline-block align-middle rotate-180"
			alt="arrow backward"
		/></span>
   {@render children()}
</button>
