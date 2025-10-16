<script>
    let {backto, back = $bindable()} = $props()
    function handleBack(){
        console.log(back)
        if (!back){
            back = true;
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
    Back to {backto}
</button>
