<script lang=ts>
    let {availableFilter, selected = $bindable()} = $props();
</script>

<select bind:value={selected.key} class="inline-block border-b border-b-2 border-black px-2">
    {#each availableFilter as filter, i}
        <option value={filter.key}>
            {#if filter.count == 0}
                <!-- No data are available for this voice in the specific dropdown -->
                - 
            {:else}
                {i + 1}. 
            {/if}
            
            {filter.key}</option>
    {/each}
</select>

<style>
    select {
        width: max-content;
    }
</style>