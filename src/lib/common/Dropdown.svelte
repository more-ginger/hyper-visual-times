<script lang=ts>
    let {availableFilter, selected = $bindable()} = $props();
</script>

<select bind:value={selected.key} class="w-fit border-b border-b-2 border-black px-2">
    {#each availableFilter as filter, i}
        <option value={filter.key}>{i + 1}. {filter.key}</option>
    {/each}
</select>