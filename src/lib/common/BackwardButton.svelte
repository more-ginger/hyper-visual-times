<script>
	import { LinkHandler } from "$lib/utils/pathhelper.svelte";
	import { currentView } from "$lib/utils/state.images.svelte";

    let {children,} = $props()
    function handleBack(){
        if ($currentView == "streamgraph"){
            currentView.set("bubblechart");
        }else{
            currentView.set("streamgraph");
        }
    }
</script>
<button class="flex items-center justify-items-center gap-2" onclick={handleBack}
	><span 
		><img
			src={LinkHandler("/icons/ui-forward.svg")}
			class="inline-block align-middle rotate-180 pt-px"
			alt="arrow backward"
		/></span>
        <span>
               {@render children()}
        </span>
</button>
