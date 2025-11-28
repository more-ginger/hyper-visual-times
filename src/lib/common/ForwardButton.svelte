<script>
	import { LinkHandler } from "$lib/utils/linkhandler.svelte";

    let {goto} = $props()
</script>
<button><span class="mr-2"
				><img
					src={LinkHandler("/icons/ui-forward.svg")}
					class="inline-block align-middle"
					alt="arrow forward"
				/></span
			>Go to {goto}</button
		>